import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from './_components/login-form';
import type { LoginFormValues } from './_components/login-form.types';
import { Button } from '@/components/ui/button';
import http from '@/lib/http';

type LoginResponse = {
  user: {
    id: number;
    email: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      http.post<LoginResponse>('/auth/login', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Signed in successfully');
      navigate('/');
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string | string[] })?.message
        : undefined;

      if (Array.isArray(message)) {
        toast.error(message.join(', '));
      } else if (typeof message === 'string') {
        toast.error(message);
      } else {
        toast.error('Invalid email or password');
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4">
      <div className="mb-8 space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <LoginForm />

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </FormProvider>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
