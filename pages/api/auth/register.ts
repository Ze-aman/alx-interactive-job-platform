import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/database';
import { hashPassword } from '@/utils/hash';
import { v4 as uuid } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, role_id } = req.body;

  if (!email || !password || !role_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const password_hash = await hashPassword(password);

  await db.query(
    'INSERT INTO users (id, email, password_hash, role_id, created_at) VALUES (?, ?, ?, ?, NOW())',
    [uuid(), email, password_hash, role_id]
  );

  return res.status(201).json({ message: 'User created' });
}
