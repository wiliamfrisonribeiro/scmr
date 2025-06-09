export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthday: string;
  account_group_id: string;
  account_group?: {
    id: string;
    name: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
} 