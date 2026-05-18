import type { BaseModel } from './base-model';

export interface User extends BaseModel {
  email: string;
  name: string | null;
}
