import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/database';
import { v4 as uuid } from 'uuid';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (req.method === 'POST') {
    const { company_id, title } = req.body;

    await db.query(
      'INSERT INTO jobs VALUES (?, ?, ?, "OPEN", NOW())',
      [uuid(), company_id, title]
    );

    return res.status(201).json({ message: 'Job created' });
  }

  const [jobs] = await db.query('SELECT * FROM jobs');
  res.status(200).json(jobs);
}

export default withAuth(handler, [2]); // Employer
