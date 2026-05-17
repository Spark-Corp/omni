import type { AuthUser } from './config'

export type Permission = 
  | 'vendor:create'
  | 'vendor:update'
  | 'vendor:delete'
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'request:create'
  | 'request:respond'
  | 'request:view'
  | 'message:send'
  | 'message:read'
  | 'ai:respond'
  | 'premium:activate'
  | 'stats:view'
  | 'admin:all'

const rolePermissions: Record<string, Permission[]> = {
  buyer: [
    'request:create',
    'request:view',
    'message:send',
    'message:read',
  ],
  vendor: [
    'vendor:create',
    'vendor:update',
    'product:create',
    'product:update',
    'product:delete',
    'request:respond',
    'request:view',
    'message:send',
    'message:read',
    'stats:view',
  ],
  admin: [
    'admin:all',
  ],
}

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  if (user.role === 'admin') return true
  return rolePermissions[user.role]?.includes(permission) ?? false
}

export function requireOwnership(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId
}
