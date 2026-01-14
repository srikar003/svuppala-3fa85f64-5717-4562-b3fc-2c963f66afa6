export type AuditAction =
  | 'AUTH_LOGIN'
  | 'TASK_CREATE'
  | 'TASK_LIST'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'AUDIT_VIEW'
  | 'AUTH_DENY'
  | 'ACCESS_DENY';

export interface AuditLogEntry {
  id: string;
  ts: string; // ISO
  action: AuditAction;
  allowed: boolean;
  reason?: string;

  userId?: number;
  role?: string;
  orgId?: number;

  resource?: string;     // e.g., "Task"
  resourceId?: number;   // task id if applicable

  ip?: string;
  method?: string;
  path?: string;
}
