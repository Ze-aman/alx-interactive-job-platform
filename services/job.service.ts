import { db } from '@/lib/database';

export interface JobFilterOptions {
  category?: string;
  location?: string;
  experience?: 'Entry' | 'Mid' | 'Senior';
  search?: string;
  page?: number;
  limit?: number;
}

export const getFilteredJobs = async ({
  category,
  location,
  experience,
  search,
  page = 1,
  limit = 10,
}: JobFilterOptions) => {
  const where: string[] = [];
  const values: any[] = [];

  if (category) {
    where.push('category = ?');
    values.push(category);
  }

  if (location) {
    where.push('location = ?');
    values.push(location);
  }

  if (experience) {
    where.push('experience_level = ?');
    values.push(experience);
  }

  if (search) {
    where.push('(title LIKE ? OR category LIKE ? OR location LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const dataSQL = `
    SELECT *
    FROM jobs
    ${whereSQL}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countSQL = `
    SELECT COUNT(*) as total
    FROM jobs
    ${whereSQL}
  `;

  const [rows] = await db.query(dataSQL, [...values, limit, offset]);
  const [[{ total }]]: any = await db.query(countSQL, values);

  return {
    data: rows,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
