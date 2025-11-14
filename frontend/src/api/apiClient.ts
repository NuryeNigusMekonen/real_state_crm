import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Define proper TypeScript interfaces
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface BackendError {
  message?: string;
  error?: string;
  [key: string]: any;
}

interface Site {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  parkingAvailable: boolean;
  description?: string;
  createdAt: string;
  buildingCount?: number;
}

interface Building {
  id: string;
  name: string;
  floorCount: number;
  totalAreaSqm: number;
  siteId: string;
  site?: Site;
  siteName?: string;
  createdAt: string;
  unitCount?: number;
}

interface BuildingUnit {
  id: string;
  unitNumber: string;
  type: 'APARTMENT' | 'OFFICE' | 'SHOP' | 'MIXED';
  floor: number;
  areaSqm: number;
  parkingSlots: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'LEASED' | 'SOLD';
  buildingId: string;
  building?: Building;
  buildingName?: string;
  ownerId?: string;
  owner?: Owner;
  ownerName?: string;
  createdAt: string;
}

interface Owner {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  createdAt: string;
  ownedUnitsCount?: number;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  baseSalary?: number;
  commissionRate?: number;
  compensationType?: string;
  createdAt: string;
  updatedAt: string;
}

// Use type assertion for import.meta.env to avoid TypeScript errors
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/v1';

// Helper function to generate UUID-like strings for mock data
const generateMockUUID = (seed: number): string => {
  const baseUUID = '550e8400-e29b-41d4-a716-446655440000';
  const hexSeed = seed.toString(16).padStart(12, '0');
  return `${baseUUID.slice(0, 24)}${hexSeed}`;
};

// Mock data for fallback when API is down - USING UUIDs
const mockSites: Site[] = [
  {
    id: generateMockUUID(1),
    name: 'Bole Site',
    addressLine1: 'Main Street',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    parkingAvailable: true,
    createdAt: new Date().toISOString(),
    buildingCount: 2,
  },
  {
    id: generateMockUUID(2),
    name: 'Business District Tower',
    addressLine1: '456 Business Ave',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    parkingAvailable: false,
    createdAt: new Date().toISOString(),
    buildingCount: 1,
  },
];

const mockBuildings: Building[] = [
  {
    id: generateMockUUID(101),
    name: 'Tower A',
    floorCount: 10,
    totalAreaSqm: 5000,
    siteId: mockSites[0].id,
    siteName: 'Bole Site',
    createdAt: new Date().toISOString(),
    unitCount: 5,
  },
  {
    id: generateMockUUID(102),
    name: 'Tower B',
    floorCount: 8,
    totalAreaSqm: 4000,
    siteId: mockSites[0].id,
    siteName: 'Bole Site',
    createdAt: new Date().toISOString(),
    unitCount: 3,
  },
];

const mockUnits: BuildingUnit[] = [
  {
    id: generateMockUUID(201),
    unitNumber: 'A-101',
    type: 'APARTMENT',
    floor: 1,
    areaSqm: 120,
    parkingSlots: 1,
    price: 250000,
    status: 'AVAILABLE',
    buildingId: mockBuildings[0].id,
    buildingName: 'Tower A',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateMockUUID(202),
    unitNumber: 'A-201',
    type: 'OFFICE',
    floor: 2,
    areaSqm: 200,
    parkingSlots: 2,
    price: 500000,
    status: 'LEASED',
    buildingId: mockBuildings[0].id,
    buildingName: 'Tower A',
    ownerId: generateMockUUID(301),
    ownerName: 'Nurye Nigus',
    createdAt: new Date().toISOString(),
  },
];

const mockOwners: Owner[] = [
  {
    id: generateMockUUID(301),
    name: 'Nurye Nigus',
    contactPerson: 'Nurye Nigus',
    email: 'nurye.nigus.me@gmail.com',
    phone: '+251970124500',
    address: '123 Main Street, Addis Ababa',
    taxNumber: 'TAX123456',
    notes: 'Primary property owner',
    createdAt: new Date().toISOString(),
    ownedUnitsCount: 2,
  },
  {
    id: generateMockUUID(302),
    name: 'Real Estate Holdings',
    contactPerson: 'Manager',
    email: 'contact@realestateholdings.com',
    phone: '+251911223344',
    address: '456 Business Avenue, Addis Ababa',
    taxNumber: 'TAX789012',
    notes: 'Commercial property investment company',
    createdAt: new Date().toISOString(),
    ownedUnitsCount: 1,
  },
];

const mockLeads: Lead[] = [
  {
    id: generateMockUUID(401),
    firstName: 'nur',
    lastName: 'king',
    email: 'nur.king@example.com',
    phone: '+241990890',
    status: 'NEW',
    source: 'Website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateMockUUID(402),
    firstName: 'abebe',
    lastName: 'beso',
    email: 'abe.bes0@example.com',
    phone: '+25178989891',
    status: 'CONTACTED',
    source: 'Referral',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUsers: User[] = [
  {
    id: generateMockUUID(501),
    username: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@crm.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateMockUUID(502),
    username: 'manager1',
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@crm.com',
    role: 'MANAGER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateMockUUID(503),
    username: 'sales1',
    firstName: 'antenh',
    lastName: 'Sales',
    email: 'anteneh.sales@crm.com',
    role: 'SALES',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const api = axios.create({
  baseURL: API_BASE,
  headers: { 
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let useMockData = false;
let serverOnlineStatus = true;

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Remove cache busting for property endpoints to avoid issues
  if ((import.meta as any).env?.DEV && config.method?.toLowerCase() === 'get' && 
      !config.url?.includes('/properties/')) {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }
  
  console.log(` ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(` ${response.status} ${response.config.url}`, response.data);
    useMockData = false;
    serverOnlineStatus = true;
    return response;
  },
  (error: AxiosError) => {
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    
    // Safe error data access with type guards
    const errorData = error.response?.data as BackendError | undefined;
    const errorMessage = errorData?.message || errorData?.error || error.message;
    
    console.error(` ${method} ${url} - Status: ${error.response?.status}`, {
      message: errorMessage,
      data: errorData
    });
    
    // Handle incomplete chunked encoding as network error
    const isNetworkError = error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING' || 
                          error.code === 'ERR_NETWORK' || 
                          error.code === 'NETWORK_ERROR' ||
                          error.code === 'ECONNREFUSED';
    
    const isServerError = error.response?.status && error.response.status >= 500;
    
    if (isNetworkError || isServerError) {
      console.warn(' Server connectivity issue, enabling mock data mode');
      useMockData = true;
      serverOnlineStatus = false;
      
      // Use mock data for GET requests
      if (error.config?.method?.toLowerCase() === 'get') {
        const mockResponse: AxiosResponse = {
          data: getMockDataForEndpoint(url),
          status: 200,
          statusText: 'OK (Mock Data)',
          headers: {},
          config: error.config as InternalAxiosRequestConfig,
          request: error.request
        };
        return Promise.resolve(mockResponse);
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    
    // Enhanced 400 error handling
    if (error.response?.status === 400) {
      let detailedErrorMessage = 'Invalid request data';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          detailedErrorMessage = errorData;
        } else if (errorData.message) {
          detailedErrorMessage = errorData.message;
        } else if (errorData.error) {
          detailedErrorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Handle validation errors with multiple fields
          const validationErrors = Object.values(errorData).filter(val => typeof val === 'string');
          if (validationErrors.length > 0) {
            detailedErrorMessage = validationErrors.join(', ');
          }
        }
      }
      
      const enhancedError = new Error(`Validation Error: ${detailedErrorMessage}`);
      (enhancedError as any).cause = error;
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

function getMockDataForEndpoint(url: string): any {
  if (url.includes('/leads')) {
    return mockLeads;
  }
  
  if (url.includes('/users')) {
    return mockUsers;
  }
  
  if (url.includes('/properties/sites') && !url.includes('/properties/sites/')) {
    return mockSites;
  }
  
  if (url.includes('/properties/buildings') && !url.includes('/properties/buildings/')) {
    return mockBuildings;
  }
  
  if (url.includes('/properties/units') && !url.includes('/properties/units/')) {
    return mockUnits;
  }
  
  if (url.includes('/properties/owners') && !url.includes('/properties/owners/')) {
    return mockOwners;
  }
  
  // Handle individual resource requests
  const id = url.split('/').pop();
  if (url.includes('/properties/sites/')) {
    return mockSites.find(site => site.id === id) || null;
  }
  if (url.includes('/properties/buildings/')) {
    return mockBuildings.find(building => building.id === id) || null;
  }
  if (url.includes('/properties/units/')) {
    return mockUnits.find(unit => unit.id === id) || null;
  }
  if (url.includes('/properties/owners/')) {
    return mockOwners.find(owner => owner.id === id) || null;
  }
  if (url.includes('/leads/')) {
    return mockLeads.find(lead => lead.id === id) || null;
  }
  if (url.includes('/users/')) {
    return mockUsers.find(user => user.id === id) || null;
  }
  
  return [];
}

const createApiWithFallback = <T>(
  apiCall: () => Promise<AxiosResponse<T>>, 
  fallbackData: T
): Promise<AxiosResponse<T>> => {
  return apiCall().catch((error: AxiosError) => {
    if (useMockData || error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING') {
      console.warn('📦 Using fallback data');
      return Promise.resolve({
        data: fallbackData,
        status: 200,
        statusText: 'OK (Fallback)',
        headers: {},
        config: error.config || {} as InternalAxiosRequestConfig
      } as AxiosResponse<T>);
    }
    throw error;
  });
};

const createApiMutation = <T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorMessage: string
): Promise<AxiosResponse<T>> => {
  return apiCall().catch((error: AxiosError) => {
    // Enhanced 400 error handling for better user feedback
    if (error.response?.status === 400) {
      const errorData = error.response?.data as BackendError | undefined;
      let detailedMessage = errorMessage;
      
      if (errorData) {
        if (typeof errorData === 'string') {
          detailedMessage = errorData;
        } else if (errorData.message) {
          detailedMessage = errorData.message;
        } else if (errorData.error) {
          detailedMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Handle validation errors with multiple fields
          const validationErrors = Object.values(errorData).filter(val => typeof val === 'string');
          if (validationErrors.length > 0) {
            detailedMessage = validationErrors.join(', ');
          }
        }
      }
      
      throw new Error(detailedMessage);
    }
    
    // For network errors, simulate success in mock mode
    if (useMockData || error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING') {
      console.warn('🔄 Server offline, simulating success');
      return Promise.resolve({
        data: { 
          id: generateMockUUID(Date.now()), 
          createdAt: new Date().toISOString(),
          success: true 
        } as T,
        status: 200,
        statusText: 'OK (Simulated)',
        headers: {},
        config: error.config || {} as InternalAxiosRequestConfig
      } as AxiosResponse<T>);
    }
    
    throw error;
  });
};

// AUTH ENDPOINTS
export const authAPI = {
  login: (data: { username: string; password: string }): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/auth/login', data), 'Failed to login'),

  register: (data: unknown): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/users/register', data), 'Failed to register user'),

  logout: (): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/auth/logout'), 'Failed to logout'),

  refresh: (): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/auth/refresh'), 'Failed to refresh token'),
};

// USER ENDPOINTS
export const userAPI = {
  register: (data: unknown): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/users/register', data), 'Failed to register user'),

  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<User>> =>
    createApiMutation(() => api.post('/users', data), 'Failed to create user'),

  login: (data: { username: string; password: string }): Promise<AxiosResponse> =>
    createApiMutation(() => api.post('/auth/login', data), 'Failed to login'),

  getAll: (): Promise<AxiosResponse<User[]>> =>
    createApiWithFallback(() => api.get('/users'), mockUsers),

  getById: (id: string): Promise<AxiosResponse<User | null>> =>
    createApiWithFallback(() => api.get(`/users/${id}`), mockUsers.find(user => user.id === id) || null),

  update: (id: string, data: Partial<User>): Promise<AxiosResponse<User>> =>
    createApiMutation(() => api.put(`/users/${id}`, data), 'Failed to update user'),

  delete: (id: string): Promise<AxiosResponse> =>
    createApiMutation(() => api.delete(`/users/${id}`), 'Failed to delete user'),
};

// LEAD ENDPOINTS
export const leadAPI = {
  getAll: (): Promise<AxiosResponse<Lead[]>> =>
    createApiWithFallback(() => api.get('/leads'), mockLeads),

  getById: (id: string): Promise<AxiosResponse<Lead | null>> =>
    createApiWithFallback(() => api.get(`/leads/${id}`), mockLeads.find(lead => lead.id === id) || null),

  create: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<Lead>> =>
    createApiMutation(() => api.post('/leads', data), 'Failed to create lead'),

  update: (id: string, data: Partial<Lead>): Promise<AxiosResponse<Lead>> =>
    createApiMutation(() => api.put(`/leads/${id}`, data), 'Failed to update lead'),

  delete: (id: string): Promise<AxiosResponse> =>
    createApiMutation(() => api.delete(`/leads/${id}`), 'Failed to delete lead'),

  assign: (leadId: string, userId: string): Promise<AxiosResponse<Lead>> =>
    createApiMutation(() => api.put(`/leads/${leadId}/assign`, { assignedTo: userId }), 'Failed to assign lead'),

  updateStatus: (leadId: string, status: string): Promise<AxiosResponse<Lead>> =>
    createApiMutation(() => api.patch(`/leads/${leadId}/status`, { status }), 'Failed to update lead status'),
};

// PROPERTY ENDPOINTS
export const propertyAPI = {
  sites: {
    getAll: (): Promise<AxiosResponse<Site[]>> =>
      createApiWithFallback(() => api.get('/properties/sites'), mockSites),

    getById: (id: string): Promise<AxiosResponse<Site | null>> =>
      createApiWithFallback(() => api.get(`/properties/sites/${id}`), mockSites.find(site => site.id === id) || null),

    create: (data: {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state?: string;
      country: string;
      postalCode?: string;
      parkingAvailable: boolean;
      description?: string;
    }): Promise<AxiosResponse<Site>> =>
      createApiMutation(() => api.post('/properties/sites', data), 'Failed to create site. Please check the data and try again.'),

    update: (id: string, data: {
      name?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      parkingAvailable?: boolean;
      description?: string;
    }): Promise<AxiosResponse<Site>> =>
      createApiMutation(() => api.put(`/properties/sites/${id}`, data), 'Failed to update site. Please check the data and try again.'),

    delete: (id: string): Promise<AxiosResponse> =>
      createApiMutation(() => api.delete(`/properties/sites/${id}`), 'Failed to delete site. It may not exist or has dependencies.'),
  },

  buildings: {
    getAll: (): Promise<AxiosResponse<Building[]>> =>
      createApiWithFallback(
        () => api.get('/properties/buildings')
          .then(response => {
            console.log('✅ Buildings API success:', response.data.length, 'buildings loaded');
            return response;
          })
          .catch(error => {
            console.error('❌ Buildings API error - Status:', error.response?.status, 'Data:', error.response?.data);
            console.error('❌ Full error:', error.message);
            throw error;
          }), 
        mockBuildings
      ),

    getById: (id: string): Promise<AxiosResponse<Building | null>> =>
      createApiWithFallback(
        () => api.get(`/properties/buildings/${id}`)
          .catch(error => {
            console.error(`Building ${id} API error:`, error.response?.data || error.message);
            throw error;
          }), 
        mockBuildings.find(building => building.id === id) || null
      ),

    getBySite: (siteId: string): Promise<AxiosResponse<Building[]>> =>
      createApiWithFallback(
        () => api.get(`/properties/sites/${siteId}/buildings`)
          .catch(error => {
            console.error(`Buildings for site ${siteId} API error:`, error.response?.data || error.message);
            throw error;
          }), 
        mockBuildings.filter(b => b.siteId === siteId)
      ),

    create: (data: {
      name: string;
      floorCount: number;
      totalAreaSqm: number;
      siteId: string;
    }): Promise<AxiosResponse<Building>> =>
      createApiMutation(
        () => api.post('/properties/buildings', data)
          .then(response => {
            console.log('✅ Building created successfully:', response.data);
            return response;
          })
          .catch(error => {
            console.error('❌ Create building API error:', error.response?.data || error.message);
            throw error;
          }), 
        'Failed to create building. Please check that all required fields are filled and the site exists.'
      ),

    update: (id: string, data: {
      name?: string;
      floorCount?: number;
      totalAreaSqm?: number;
      siteId?: string;
    }): Promise<AxiosResponse<Building>> =>
      createApiMutation(
        () => api.put(`/properties/buildings/${id}`, data)
          .catch(error => {
            console.error(`Update building ${id} API error:`, error.response?.data || error.message);
            throw error;
          }), 
        'Failed to update building. Please check the data and try again.'
      ),

    delete: (id: string): Promise<AxiosResponse> =>
      createApiMutation(
        () => api.delete(`/properties/buildings/${id}`)
          .catch(error => {
            console.error(`Delete building ${id} API error:`, error.response?.data || error.message);
            throw error;
          }), 
        'Failed to delete building. It may not exist or has units attached.'
      ),
  },

  units: {
    getAll: (params?: { 
      status?: string; 
      type?: string; 
      buildingId?: string 
    }): Promise<AxiosResponse<BuildingUnit[]>> =>
      createApiWithFallback(() => api.get('/properties/units', { params }), mockUnits),

    getById: (id: string): Promise<AxiosResponse<BuildingUnit | null>> =>
      createApiWithFallback(() => api.get(`/properties/units/${id}`), mockUnits.find(unit => unit.id === id) || null),

    create: (data: {
      unitNumber: string;
      type: string;
      floor: number;
      areaSqm: number;
      parkingSlots: number;
      price: number;
      status: string;
      buildingId: string;
      ownerId?: string;
    }): Promise<AxiosResponse<BuildingUnit>> =>
      createApiMutation(() => api.post('/properties/units', data), 'Failed to create unit. Please check that all required fields are filled and the building exists.'),

    update: (id: string, data: {
      unitNumber?: string;
      type?: string;
      floor?: number;
      areaSqm?: number;
      parkingSlots?: number;
      price?: number;
      status?: string;
      buildingId?: string;
      ownerId?: string;
    }): Promise<AxiosResponse<BuildingUnit>> =>
      createApiMutation(() => api.put(`/properties/units/${id}`, data), 'Failed to update unit. Please check the data and try again.'),

    updateStatus: (id: string, status: string): Promise<AxiosResponse<BuildingUnit>> =>
      createApiMutation(() => api.patch(`/properties/units/${id}/status`, { status }), 'Failed to update unit status.'),

    assignOwner: (id: string, ownerId: string): Promise<AxiosResponse<BuildingUnit>> =>
      createApiMutation(() => api.patch(`/properties/units/${id}/assign-owner`, { ownerId }), 'Failed to assign owner to unit.'),

    delete: (id: string): Promise<AxiosResponse> =>
      createApiMutation(() => api.delete(`/properties/units/${id}`), 'Failed to delete unit.'),
  },

  owners: {
    getAll: (): Promise<AxiosResponse<Owner[]>> =>
      createApiWithFallback(() => api.get('/properties/owners'), mockOwners),

    getById: (id: string): Promise<AxiosResponse<Owner | null>> =>
      createApiWithFallback(() => api.get(`/properties/owners/${id}`), mockOwners.find(owner => owner.id === id) || null),

    create: (data: {
      name: string;
      contactPerson: string;
      email: string;
      phone: string;
      address?: string;
      taxNumber?: string;
      notes?: string;
    }): Promise<AxiosResponse<Owner>> =>
      createApiMutation(() => api.post('/properties/owners', data), 'Failed to create owner. Please check that all required fields are filled.'),

    update: (id: string, data: {
      name?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      address?: string;
      taxNumber?: string;
      notes?: string;
    }): Promise<AxiosResponse<Owner>> =>
      createApiMutation(() => api.put(`/properties/owners/${id}`, data), 'Failed to update owner. Please check the data and try again.'),

    delete: (id: string): Promise<AxiosResponse> =>
      createApiMutation(() => api.delete(`/properties/owners/${id}`), 'Failed to delete owner. It may not exist or has units assigned.'),
  },
};

// HEALTH CHECK
export const healthAPI = {
  check: (): Promise<AxiosResponse> =>
    api.get('/health').catch(() => {
      return Promise.resolve({
        data: { status: 'DOWN', message: 'Server is unreachable' },
        status: 503,
        statusText: 'Service Unavailable'
      } as AxiosResponse);
    }),

  checkProperties: (): Promise<AxiosResponse> =>
    api.get('/properties/health').catch(() => {
      return Promise.resolve({
        data: { status: 'DOWN', message: 'Property service is unreachable' },
        status: 503,
        statusText: 'Service Unavailable'
      } as AxiosResponse);
    }),
};

// Utility functions
export const isUsingMockData = (): boolean => useMockData;
export const isServerOnline = (): boolean => serverOnlineStatus;
export const setMockDataMode = (enabled: boolean): void => {
  useMockData = enabled;
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    serverOnlineStatus = true;
    useMockData = false;
    return true;
  } catch (error) {
    serverOnlineStatus = false;
    useMockData = true;
    return false;
  }
};

// UUID validation helper
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Retry mechanism for critical operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
};

// Debug function to check API status
export const debugAPIStatus = () => {
  console.group('🔧 API Debug Information');
  console.log('API Base URL:', API_BASE);
  console.log('Using Mock Data:', useMockData);
  console.log('Server Online:', serverOnlineStatus);
  console.log('Buildings Mock Data:', mockBuildings);
  console.groupEnd();
};

// Export types for use in components
export type {
  Site,
  Building,
  BuildingUnit,
  Owner,
  Lead,
  User,
  BackendError
};

export default api;