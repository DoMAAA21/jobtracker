import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { useMutator, type ApiUsersResponseRaw } from '@/interfaces/responses/api.users';
import { useQueryString } from '@/hooks/use-query-string';
import http from '@/lib/http';
import { parsePositiveInt, pickSearchParams } from '@/lib/utils';
import { UserFilterForm, type UserFilterFormData } from './_components/user-filter-form';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showConfirmationPopup } from '@/components/confirmation-popup';
import { toast } from 'sonner';

const COLUMNS = [
  { key: 'id', header: 'ID', sortTable: true },
  { key: 'name', header: 'Name', sortTable: true },
  { key: 'email', header: 'Email', sortTable: true },
  { key: 'createdAt', header: 'Created At', sortTable: true },
  { key: 'actions', header: 'Actions', sortTable: false },
] as const;

const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_ORDER = 'desc';

export default function UsersPage() {
  const { getParam, setParam, setParams } = useQueryString();
  const queryClient = useQueryClient();
  const page = parsePositiveInt(getParam('page'), 1);
  const perPage = parsePositiveInt(getParam('perPage'), 10);
  const sortBy = getParam('sortBy') ?? DEFAULT_SORT_BY;
  const sortOrder = getParam('sortOrder') ?? DEFAULT_SORT_ORDER;

  const filters = pickSearchParams({
    name: getParam('name'),
    email: getParam('email'),
  });

  const queryParams = { page, perPage, sortBy, sortOrder, ...filters };
  const hasActiveFilters = Object.keys(filters).length > 0;

  const { data, isPending } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: async () => {
      const { data: response } = await http.get<ApiUsersResponseRaw>('/users', {
        params: pickSearchParams(queryParams),
      });
      return response;
    },
    select: useMutator,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data: response } = await http.delete<ApiUsersResponseRaw>(`/users/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  function handlePageChange(nextPage: number) {
    setParam('page', String(nextPage));
  }

  function handleRowsPerPageChange(rows: number) {
    setParams({ perPage: String(rows), page: '1' });
  }

  function handleSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setParams({ email: trimmed, page: '1' });
  }

  function handleFilterSubmit(filter: UserFilterFormData) {
    setParams({
      name: filter.name.trim(),
      email: filter.email.trim(),
      page: '1',
    });
  }

  function handleSort(colKey: string, order: string) {
    setParams({
      sortBy: colKey,
      sortOrder: order,
      page: '1',
    });
  }

  function handleViewUser(id: number) {
    console.log(id);
  }

  function handleEditUser(id: number) {
    console.log(id);
  }

  function handleDeleteUser(id: number) {
   showConfirmationPopup({
    title: 'Delete User',
    message: 'Are you sure you want to delete this user?',
    onSuccess: () => {
      deleteUserMutation.mutate(id);
    },
   })
  } 

  const rows = data?.data.map((user) => ({
    ...user,
    actions: (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleViewUser(user.id)}>
          <EyeIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleEditUser(user.id)}>
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => handleDeleteUser(user.id)}> 
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage user accounts in the system.
        </p>
      </div>

      <DataTable
        columns={[...COLUMNS]}
        defaultFilterOpen={hasActiveFilters}
        activeSortColumn={sortBy}
        activeSortOrder={sortOrder}
        data={rows ?? []}
        currentPage={page}
        totalPages={data?.last_page ?? 1}
        totalRows={data?.total ?? 0}
        rowsPerPage={perPage}
        isLoading={isPending}
        multiSelect={false}
        filter={
          <UserFilterForm
            key={`${filters.name ?? ''}-${filters.email ?? ''}`}
            defaultValues={{
              name: filters.name ?? '',
              email: filters.email ?? '',
            }}
            onSubmit={handleFilterSubmit}
          />
        }
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSort={handleSort}
      />
    </div>
  );
}
