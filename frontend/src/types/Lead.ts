// types/Lead.ts
export interface LeadResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  priority?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  priority?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  priority?: string;
  source?: string;
}