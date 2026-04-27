import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Get current directory
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Recursively find all route.js files
async function findRouteFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        // Handle root route.js specially
        if (filePath === join(__dirname, 'route.js')) {
          routes.unshift(filePath); // Add to beginning of array
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  // Normalize Windows backslashes to forward slashes for consistent processing
  const normalizedPath = routeFile.replace(/\\/g, '/');
  const normalizedDirname = __dirname.replace(/\\/g, '/');
  const relativePath = normalizedPath.replace(normalizedDirname, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import and register all routes
async function registerRoutes() {
  console.log('[RouteBuilder] Starting route registration...');
  console.log('[RouteBuilder] __dirname:', __dirname);
  
  const routeFiles = (
    await findRouteFiles(__dirname).catch((error) => {
      console.error('Error finding route files:', error);
      return [];
    })
  )
    .slice()
    .sort((a, b) => {
      return b.length - a.length;
    });

  console.log(`[RouteBuilder] Found ${routeFiles.length} route files:`, routeFiles);

  // Clear existing routes
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      // Normalize Windows paths and convert to file:// URL for proper module resolution
      // Windows paths need file:///C:/ format (3 slashes before drive letter)
      const normalizedPath = routeFile.replace(/\\/g, '/');
      const fileUrl = normalizedPath.startsWith('/') 
        ? `file://${normalizedPath}` 
        : `file:///${normalizedPath}`;
      console.log(`[RouteBuilder] Importing: ${fileUrl}`);
      const route = await import(/* @vite-ignore */ `${fileUrl}?update=${Date.now()}`);
      console.log(`[RouteBuilder] Successfully imported: ${routeFile}`, Object.keys(route));

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      let registeredMethods = [];
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            console.log(`[RouteBuilder] Registering ${method} ${honoPath}`);
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                // Normalize Windows paths and convert to file:// URL for proper module resolution
                // Windows paths need file:///C:/ format (3 slashes before drive letter)
                const normalizedPath = routeFile.replace(/\\/g, '/');
                const fileUrl = normalizedPath.startsWith('/') 
                  ? `file://${normalizedPath}` 
                  : `file:///${normalizedPath}`;
                const updatedRoute = await import(
                  /* @vite-ignore */ `${fileUrl}?update=${Date.now()}`
                );
                return await updatedRoute[method](c.req.raw, { params });
              }
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                registeredMethods.push('GET');
                break;
              case 'post':
                api.post(honoPath, handler);
                registeredMethods.push('POST');
                break;
              case 'put':
                api.put(honoPath, handler);
                registeredMethods.push('PUT');
                break;
              case 'delete':
                api.delete(honoPath, handler);
                registeredMethods.push('DELETE');
                break;
              case 'patch':
                api.patch(honoPath, handler);
                registeredMethods.push('PATCH');
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
      console.log(`[RouteBuilder] Registered methods for ${routeFile}:`, registeredMethods);
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
  
  console.log(`[RouteBuilder] Route registration complete. Total routes: ${api.routes.length}`);
  console.log('[RouteBuilder] Registered paths:', api.routes.map(r => `${r.method} ${r.path}`));
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  import.meta.glob('../src/app/api/**/route.js', {
    eager: true,
  });
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
