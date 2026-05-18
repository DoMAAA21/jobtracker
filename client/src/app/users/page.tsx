import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { useMutator, type ApiUsersResponseRaw } from '@/interfaces/responses/api.users';
import { useQueryString } from '@/hooks/use-query-string';
import http from '@/lib/http';
import { parsePositiveInt, pickSearchParams } from '@/lib/utils';
import { UserFilterForm, type UserFilterFormData } from './_components/user-filter-form';

const COLUMNS = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'createdAt', header: 'Created At', sortable: true },
] as const;

export default function UsersPage() {
    const { getParam, setParam, setParams } = useQueryString();

    const page = parsePositiveInt(getParam('page'), 1);
    const perPage = parsePositiveInt(getParam('perPage'), 10);
    const filters = pickSearchParams({
        name: getParam('name'),
        email: getParam('email'),
    });

    const queryParams = { page, perPage, ...filters };
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
            ...filter,
            page: '1',
        });
    }

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
                data={data?.data ?? []}
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
                onSort={() => { }}
            />
        </div>
    );
}
