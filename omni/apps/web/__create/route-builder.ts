import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
	globalThis.fetch = updatedFetch;
}

// Build-time glob — works in both dev AND production (Vite bundles all matched modules)
const routeGlob = import.meta.glob('../src/app/api/**/route.js', { eager: true }) as Record<string, Record<string, Function>>;

function globKeyToHonoPath(globKey: string): string {
	const normalized = globKey.replace(/\\/g, '/');
	const apiIndex = normalized.indexOf('/api/');
	if (apiIndex === -1) return '';
	const relativePath = normalized.slice(apiIndex + 5).replace(/\/route\.(js|ts)$/, '');
	if (!relativePath) return '';

	const segments = relativePath.split('/');
	const transformed = segments.map((seg) => {
		const match = seg.match(/^\[(\.{3})?([^\]]+)\]$/);
		if (match) {
			return match[1] === '...' ? `:${match[2]}{.+}` : `:${match[2]}`;
		}
		return seg;
	});

	return '/' + transformed.join('/');
}

function registerRoutes() {
	api.routes = [];

	const entries = Object.entries(routeGlob).sort(([a], [b]) => b.length - a.length);

	for (const [globKey, routeModule] of entries) {
		const honoPath = globKeyToHonoPath(globKey);
		if (!honoPath) continue;

		for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const) {
			const handlerFn = routeModule[method];
			if (handlerFn) {
				const handler: Handler = async (c) => {
					return await handlerFn(c.req.raw, { params: c.req.param() });
				};
				(api as any)[method.toLowerCase()](honoPath, handler);
			}
		}
	}
}

registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
	import.meta.glob('../src/app/api/**/route.js', {});
	if (import.meta.hot) {
		import.meta.hot.accept((newSelf) => {
			registerRoutes();
		});
	}
}

export { api, API_BASENAME };
