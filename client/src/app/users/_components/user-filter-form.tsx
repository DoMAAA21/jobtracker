import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface UserFilterFormData {
  name: string;
  email: string;
}

type UserFilterFormProps = {
  defaultValues?: UserFilterFormData;
  onSubmit: (data: UserFilterFormData) => void;
};

export function UserFilterForm({ defaultValues, onSubmit }: UserFilterFormProps) {
  const { register, handleSubmit } = useForm<UserFilterFormData>({
    defaultValues: defaultValues ?? { name: '', email: '' },
  });

  const handleFormSubmit: SubmitHandler<UserFilterFormData> = (formData) => {
    onSubmit(formData);
  };

  return (
    <div className="rounded-lg bg-card p-4">
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label htmlFor="filter-name">Name</Label>
            <Input
              id="filter-name"
              type="text"
              placeholder="Filter by name"
              {...register('name')}
            />
          </div>
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label htmlFor="filter-email">Email</Label>
            <Input
              id="filter-email"
              type="text"
              placeholder="Filter by email"
              {...register('email')}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit">Apply filter</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

