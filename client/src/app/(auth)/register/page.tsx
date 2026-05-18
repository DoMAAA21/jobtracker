import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterForm } from './_components/register-form';
import type { RegisterFormValues } from './_components/register-form.types';
import { Button } from '@/components/ui/button';
import http from '@/lib/http';

type RegisterResponse = {
  user: {
    id: number;
    email: string;
  };
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      http.post<RegisterResponse>('/auth/register', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Account created successfully');
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
        toast.error('Registration failed. Please try again.');
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4">
      <div className="mb-8 space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <RegisterForm />

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating account…' : 'Register'}
          </Button>
        </form>
      </FormProvider>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
