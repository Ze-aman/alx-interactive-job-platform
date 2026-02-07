import { verifyToken } from '@/utils/jwt';

export async function getServerSideProps(context: any) {
  const token = context.req.cookies?.token;

  if (!token) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  try {
    const user = verifyToken(token);

    if (user.roleId !== 2) {
      return {
        redirect: {
          destination: '/unauthorized',
          permanent: false,
        },
      };
    }

    return { props: {} };
  } catch {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
}

export default function EmployerDashboard() {
  return <h1>Employer Dashboard</h1>;
}
