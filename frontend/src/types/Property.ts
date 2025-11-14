export interface Site {
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

export interface Building {
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

export interface BuildingUnit {
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

export interface Owner {
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

// Request DTOs
export interface CreateSiteRequest {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  parkingAvailable: boolean;
  description?: string;
}

export interface CreateBuildingRequest {
  name: string;
  floorCount: number;
  totalAreaSqm: number;
  siteId: string;
}

export interface CreateUnitRequest {
  unitNumber: string;
  type: string;
  floor: number;
  areaSqm: number;
  parkingSlots: number;
  price: number;
  status: string;
  buildingId: string;
  ownerId?: string;
}

export interface CreateOwnerRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
}

export interface UpdateUnitStatusRequest {
  status: string;
}

export interface AssignOwnerRequest {
  ownerId: string;
}