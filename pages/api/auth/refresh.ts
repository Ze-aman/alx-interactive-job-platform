import type { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import { db } from '@/lib/database';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/utils/jwt';
import { v4 as uuid } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1️⃣ Read refresh token from cookies
    const cookies = parse(req.headers.cookie || '');
    const oldToken = cookies.refreshToken;

    if (!oldToken) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    // 2️⃣ Verify JWT signature
    const payload: any = verifyRefreshToken(oldToken);

    // 3️⃣ Validate token in DB (rotation check)
    const [rows]: any = await db.query(
      'SELECT id FROM refresh_tokens WHERE token = ? AND revoked = false',
      [oldToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // 4️⃣ Revoke old refresh token
    await db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = ?',
      [oldToken]
    );

    // 5️⃣ Issue new tokens
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      roleId: payload.roleId,
    });

    const newRefreshToken = signRefreshToken({
      userId: payload.userId,
    });

    // 6️⃣ Store new refresh token
    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token, revoked, created_at) VALUES (?, ?, ?, false, NOW())',
      [uuid(), payload.userId, newRefreshToken]
    );

    // 7️⃣ Set cookies
    res.setHeader('Set-Cookie', [
      serialize('accessToken', newAccessToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 min
      }),
      serialize('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
    ]);

    return res.status(200).json({ message: 'Token refreshed' });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}
