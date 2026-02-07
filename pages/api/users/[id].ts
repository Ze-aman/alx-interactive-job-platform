import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/database';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const [rows]: any = await db.query(
    'SELECT id, email, role_id FROM users WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(rows[0]);
}

export default withAuth(handler);
