import { db } from '@/lib/database';

export const getJobsByCompany = async (companyId: string) => {
  const [rows] = await db.query(
    'SELECT * FROM jobs WHERE company_id = ?',
    [companyId]
  );
  return rows;
};
