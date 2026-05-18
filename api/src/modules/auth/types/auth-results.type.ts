import { AuthUser } from './auth-user.type';
export type AuthResult = {
    accessToken: string;
    user: AuthUser;
};