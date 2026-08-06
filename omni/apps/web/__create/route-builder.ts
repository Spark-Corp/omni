import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';
import { api } from './generated-routes';

const API_BASENAME = '/api';

if (globalThis.fetch) {
	globalThis.fetch = updatedFetch;
}

// In dev, hot-reload routes by re-importing dynamically
if (import.meta.env.DEV) {
	import.meta.glob('../src/app/api/**/route.js', {});
	async function registerRoutes() {
		const { readdir, stat } = await import('node:fs/promises');
		const { join } = await import('node:path');
		const { fileURLToPath } = await import('node:url');

		const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');

		async function findRouteFiles(dir: string): Promise<string[]> {
			const files = await readdir(dir);
			let routes: string[] = [];
			for (const file of files) {
				const filePath = join(dir, file);
				const statResult = await stat(filePath);
				if (statResult.isDirectory()) {
					routes = routes.concat(await findRouteFiles(filePath));
				} else if (file === 'route.js') {
					routes.push(filePath);
				}
			}
			return routes;
		}

		api.routes = [];
		const routeFiles = (await findRouteFiles(__dirname)).sort((a, b) => b.length - a.length);

		for (const routeFile of routeFiles) {
			const normalizedPath = routeFile.replace(/\\/g, '/');
			const fileUrl = normalizedPath.startsWith('/')
				? `file://${normalizedPath}`
				: `file:///${normalizedPath}`;
			const route = await import(/* @vite-ignore */ `${fileUrl}?update=${Date.now()}`);

			const relativePath = normalizedPath.replace(/\\/g, '/').replace(/^.*\/api\//, '').replace(/\/route\.js$/, '');
			const segments = relativePath.split('/');
			const honoPath = '/' + segments.map(s => {
				const m = s.match(/^\[(\.{3})?([^\]]+)\]$/);
				return m ? (m[1] === '...' ? `:${m[2]}{.+}` : `:${m[2]}`) : s;
			}).join('/');

			for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const) {
				if (route[method]) {
					const handler: Handler = async (c) => {
						const updatedRoute = await import(/* @vite-ignore */ `${fileUrl}?update=${Date.now()}`);
						return await updatedRoute[method](c.req.raw, { params: c.req.param() });
					};
					(api as any)[method.toLowerCase()](honoPath, handler);
				}
			}
		}
	}

	if (import.meta.hot) {
		import.meta.hot.accept((newSelf) => {
			registerRoutes().catch((err) => {
				console.error('Error reloading routes:', err);
			});
		});
	}
}

export { api, API_BASENAME };
