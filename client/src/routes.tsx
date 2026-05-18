import { useRoutes } from 'react-router-dom';
import AuthGuard from './app/(auth)/_guards/auth-guard';
import LoginPage from './app/(auth)/login/page';
import RegisterPage from './app/(auth)/register/page';
import ApplicationsPage from './app/applications/page';
import HomePage from './app/home/page';
import SettingsPage from './app/settings/page';
import UsersPage from './app/users/page';
import MainLayout from './layouts/main-layout';

export default function Routes() {
  return useRoutes([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'applications',
          element: <ApplicationsPage />,
        },
        {
          path: 'users',
          element: <UsersPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
      ],
    },
  ]);
}
