import type { NextApiRequest, NextApiResponse } from 'next';
import { getFilteredJobs } from '@/services/job.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const {
      category,
      location,
      experience,
      search,
      page,
      limit,
    } = req.query;

    const result = await getFilteredJobs({
      category: category as string,
      location: location as string,
      experience: experience as any,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}
