import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/database';
import { v4 as uuid } from 'uuid';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, industry } = req.body;

    await db.query(
      'INSERT INTO companies VALUES (?, ?, ?, false)',
      [uuid(), name, industry]
    );

    return res.status(201).json({ message: 'Company created' });
  }

  const [companies] = await db.query('SELECT * FROM companies');
  res.status(200).json(companies);
}

export default withAuth(handler, [1, 2]); // Admin, Employer
