/**
 * Session data structure from backend
 */
export interface Session {
  id: string;
  userAgent: string;
  ip: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt?: string;
  isCurrent: boolean;
}

/**
 * List sessions response
 */
export interface ListSessionsResponse {
  sessions: Session[];
  total?: number;
}

/**
 * Delete session response
 */
export interface DeleteSessionResponse {
  message: string;
}

/**
 * Revoke all other sessions response
 */
export interface RevokeAllSessionsResponse {
  revokedCount: number;
}
