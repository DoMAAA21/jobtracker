export type PublicUser = {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
};
  
  
export type PaginatedUsers = {
    data: PublicUser[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
};