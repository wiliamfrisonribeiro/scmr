export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// Lista de usuários fake para teste
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Usuário Comum',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    id: 3,
    name: 'Fiscal Ambiental',
    email: 'fiscal@example.com',
    password: 'fiscal123',
    role: 'user'
  }
]; 