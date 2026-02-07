import type { NextApiRequest } from 'next';
import { db } from '@/lib/database';
import { v4 as uuid } from 'uuid';

interface AuthRequest extends NextApiRequest {
  user?: {
    userId: string;
    roleId: string;
  };
}

export async function audit(
  req: AuthRequest,
  action: string,
  resource: string
) {
  try {
    await db.query(
      `INSERT INTO audit_logs 
       (id, user_id, action, resource, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        uuid(),
        req.user?.userId || null,
        action,
        resource,
        req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        req.headers['user-agent'] || '',
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
