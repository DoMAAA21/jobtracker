import type { PaginatedResponseModel } from '../paginated-response-model';
import type { User } from '@/models/user-model';
import { formatDate } from '@/lib/utils';

export type ApiUserRole = {
  id: number;
  name: string;
};

export type ApiUser = User & {
  roles?: ApiUserRole[];
};

/** GET /users response from the Nest API */
export type ApiUsersResponseRaw = {
  data: ApiUser[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export type ApiUserTableRow = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  roles?: ApiUserRole[];
};

export function mutateApiUser(user: ApiUser): ApiUserTableRow {
  return {
    ...user,
    name: user.name ?? '—',
    createdAt: formatDate(new Date(user.createdAt)),
  };
}

export function useMutator(
  response: ApiUsersResponseRaw,
): PaginatedResponseModel<ApiUserTableRow> {
  const { meta } = response;
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1;
  const to = Math.min(meta.page * meta.perPage, meta.total);

  return {
    data: response.data.map(mutateApiUser),
    total: meta.total,
    per_page: meta.perPage,
    current_page: meta.page,
    last_page: meta.totalPages,
    from,
    to,
    has_more_pages: meta.page < meta.totalPages,
    message: null,
    success: true,
  };
}
