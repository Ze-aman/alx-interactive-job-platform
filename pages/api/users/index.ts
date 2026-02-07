import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/database';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const [users] = await db.query(
    'SELECT id, email, role_id, created_at FROM users'
  );
  res.status(200).json(users);
}

export default withAuth(handler, [1]); // Admin only
