import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/database';
import { v4 as uuid } from 'uuid';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (req.method === 'POST') {
    const { job_id } = req.body;

    await db.query(
      'INSERT INTO job_applications VALUES (?, ?, ?, "APPLIED", NOW())',
      [uuid(), job_id, user.userId]
    );

    return res.status(201).json({ message: 'Application submitted' });
  }

  const [apps] = await db.query(
    'SELECT * FROM job_applications WHERE candidate_id = ?',
    [user.userId]
  );

  res.status(200).json(apps);
}

export default withAuth(handler, [3]); // Candidate
