import { useRoutes } from 'react-router-dom';
import LoginPage from './app/(auth)/login/page';
import RegisterPage from './app/(auth)/register/page';

export default function Routes() {
    return useRoutes([
        {
            path: "/",
            element: <LoginPage />,
        },
        {
            path: "/register",
            element: <RegisterPage />,
        },
    ]);
}