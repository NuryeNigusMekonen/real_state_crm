// types/User.ts
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'SALES' | 'MANAGER' | 'USER';
  compensation_type?: 'SALARY' | 'COMMISSION';
  base_salary?: number;
  created_at: string;
  updated_at: string;
}