import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EMAIL_REGEX } from '@/lib/regex';

export type RegisterFormValues = {
    name: string;
    email: string;
    password: string;
};

export function RegisterForm() {
    const {
        register,
        formState: { errors },
    } = useFormContext<RegisterFormValues>();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="name" required>
                    Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    {...register('name', { required: 'Name is required' })}
                />
                {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="email" required>
                    Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: EMAIL_REGEX,
                            message: 'Enter a valid email',
                        },
                    })}
                />
                {errors.email?.message && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password" required>
                    Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    aria-invalid={!!errors.password}
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                        },
                        maxLength: {
                            value: 32,
                            message: 'Password must be at most 32 characters',
                        },
                    })}
                />
                {errors.password?.message && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
        </div>
    );
}
