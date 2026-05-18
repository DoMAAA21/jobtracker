export interface PaginatedModelLinkItem {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedModel<Data> {
  data: Data[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
  message: string | null;
  success: boolean;
  first_page_url?: string;
  last_page_url?: string;
  links?: PaginatedModelLinkItem[];
  next_page_url?: string | null;
  path?: string;
  prev_page_url?: string | null;
}

export type PaginatedResponseModel<Data> = PaginatedModel<Data>;

export type ArrayResponseModel<Data> = {
  data: Data[];
  message: string | null;
  success: boolean;
};
