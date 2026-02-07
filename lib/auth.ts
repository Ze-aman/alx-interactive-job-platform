import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { verifyAccessToken } from '@/utils/jwt';
import type { JwtPayload } from 'jsonwebtoken'; // import the type

interface AuthRequest extends NextApiRequest {
  user?: {
    userId: string;
    roleId: string;
  };
}

export function withAuth(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<any>,
  roles: string[] = []
) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.accessToken;

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const payloadRaw = verifyAccessToken(token);

      // Check if payload is JwtPayload and has required fields
      if (typeof payloadRaw === 'string' || !('userId' in payloadRaw) || !('roleId' in payloadRaw)) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const payload = payloadRaw as { userId: string; roleId: string };
      req.user = payload;

      if (roles.length && !roles.includes(payload.roleId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return handler(req, res);
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
