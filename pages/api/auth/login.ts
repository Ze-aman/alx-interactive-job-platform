import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { db } from '@/lib/database';
import { comparePassword } from '@/utils/hash';
import { signAccessToken, signRefreshToken } from '@/utils/jwt';
import { v4 as uuid } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    // 1️⃣ Fetch user
    const [rows]: any = await db.query(
      'SELECT id, password_hash, role_id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // 2️⃣ Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = user.id;
    const roleId = user.role_id;

    // 3️⃣ Sign tokens
    const accessToken = signAccessToken({ userId, roleId });
    const refreshToken = signRefreshToken({ userId });

    // 4️⃣ Store refresh token (rotation-ready)
    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token, revoked, created_at) VALUES (?, ?, ?, false, NOW())',
      [uuid(), userId, refreshToken]
    );

    // 5️⃣ Set HTTP-only cookies
    res.setHeader('Set-Cookie', [
      serialize('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      }),
      serialize('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
    ]);

    // 6️⃣ Respond
    return res.status(200).json({ message: 'Logged in' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
