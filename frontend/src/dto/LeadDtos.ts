// src/dto/LeadDtos.ts

// Defines the request body for creating or updating a Lead.
export interface CreateLeadRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string;
}

// Defines the full Lead object received from the API (used in LeadTable).
export interface LeadResponse {
    id: string;
    first_name: string; // Must match the snake_case from your Spring Boot backend
    last_name: string; // Must match the snake_case from your Spring Boot backend
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    created_at: string;
    updated_at: string;
}