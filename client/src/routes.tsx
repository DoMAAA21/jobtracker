import { useRoutes } from 'react-router-dom';
import AuthGuard from './app/(auth)/_guards/auth-guard';
import LoginPage from './app/(auth)/login/page';
import RegisterPage from './app/(auth)/register/page';
import HomePage from './app/home/page';

export default function Routes() {
    return useRoutes([
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/register",
            element: <RegisterPage />,
        },
        {
            path: "/",
            element: <AuthGuard><HomePage /></AuthGuard>,
        },
    ]);
}