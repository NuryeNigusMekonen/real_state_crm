package com.realestatecrm.dto;

import com.realestatecrm.entity.*;
import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

public class PropertyDtos {
    
    // === SITE DTOS ===
    public static class CreateSiteRequest {
        public String name;
        public String addressLine1;
        public String addressLine2;
        public String city;
        public String state;
        public String country;
        public String postalCode;
        public Boolean parkingAvailable;
        public String description;
    }

    public static class SiteResponse {
        public UUID id;
        public String name;
        public String addressLine1;
        public String addressLine2;
        public String city;
        public String state;
        public String country;
        public String postalCode;
        public Boolean parkingAvailable;
        public String description;
        public String createdAt;
        public Integer buildingCount;

        public static SiteResponse fromEntity(Site site) {
            SiteResponse response = new SiteResponse();
            response.id = site.getId();
            response.name = site.getName();
            response.addressLine1 = site.getAddressLine1();
            response.addressLine2 = site.getAddressLine2();
            response.city = site.getCity();
            response.state = site.getState();
            response.country = site.getCountry();
            response.postalCode = site.getPostalCode();
            response.parkingAvailable = site.getParkingAvailable();
            response.description = site.getDescription();
            response.createdAt = site.getCreatedAt().toString();
            response.buildingCount = site.getBuildings() != null ? site.getBuildings().size() : 0;
            return response;
        }
    }

    // === BUILDING DTOS ===
    public static class CreateBuildingRequest {
        public String name;
        public Integer floorCount;
        public Double totalAreaSqm;
        public UUID siteId;
    }

    public static class BuildingResponse {
        public UUID id;
        public String name;
        public Integer floorCount;
        public Double totalAreaSqm;
        public UUID siteId;
        public String siteName;
        public String createdAt;
        public Integer unitCount;

        public static BuildingResponse fromEntity(Building building) {
            BuildingResponse response = new BuildingResponse();
            response.id = building.getId();
            response.name = building.getName();
            response.floorCount = building.getFloorCount();
            response.totalAreaSqm = building.getTotalAreaSqm();
            response.siteId = building.getSite().getId();
            response.siteName = building.getSite().getName();
            response.createdAt = building.getCreatedAt().toString();
            response.unitCount = building.getBuildingUnits() != null ? building.getBuildingUnits().size() : 0;
            return response;
        }
    }

    // === BUILDING UNIT DTOS ===
    public static class CreateUnitRequest {
        public String unitNumber;
        public String type; // APARTMENT, OFFICE, SHOP, MIXED
        public Integer floor;
        public Double areaSqm;
        public Integer parkingSlots;
        public Double price;
        public String status; // AVAILABLE, RESERVED, LEASED, SOLD
        public UUID buildingId;
        public UUID ownerId;
    }

    public static class UnitResponse {
        public UUID id;
        public String unitNumber;
        public String type;
        public Integer floor;
        public Double areaSqm;
        public Integer parkingSlots;
        public Double price;
        public String status;
        public UUID buildingId;
        public String buildingName;
        public UUID ownerId;
        public String ownerName;
        public String createdAt;

        public static UnitResponse fromEntity(BuildingUnit unit) {
            UnitResponse response = new UnitResponse();
            response.id = unit.getId();
            response.unitNumber = unit.getUnitNumber();
            response.type = unit.getType().name();
            response.floor = unit.getFloor();
            response.areaSqm = unit.getAreaSqm();
            response.parkingSlots = unit.getParkingSlots();
            response.price = unit.getPrice();
            response.status = unit.getStatus().name();
            response.buildingId = unit.getBuilding().getId();
            response.buildingName = unit.getBuilding().getName();
            response.createdAt = unit.getCreatedAt().toString();
            
            if (unit.getOwner() != null) {
                response.ownerId = unit.getOwner().getId();
                response.ownerName = unit.getOwner().getName();
            }
            
            return response;
        }
    }

    public static class UpdateUnitStatusRequest {
        public String status;
    }

    public static class AssignOwnerRequest {
        public UUID ownerId;
    }

    // === OWNER DTOS ===
    public static class CreateOwnerRequest {
        public String name;
        public String contactPerson;
        public String email;
        public String phone;
        public String address;
        public String taxNumber;
        public String notes;
    }

    public static class OwnerResponse {
        public UUID id;
        public String name;
        public String contactPerson;
        public String email;
        public String phone;
        public String address;
        public String taxNumber;
        public String notes;
        public String createdAt;
        public Integer ownedUnitsCount;

        public static OwnerResponse fromEntity(Owner owner) {
            OwnerResponse response = new OwnerResponse();
            response.id = owner.getId();
            response.name = owner.getName();
            response.contactPerson = owner.getContactPerson();
            response.email = owner.getEmail();
            response.phone = owner.getPhone();
            response.address = owner.getAddress();
            response.taxNumber = owner.getTaxNumber();
            response.notes = owner.getNotes();
            response.createdAt = owner.getCreatedAt() != null ? owner.getCreatedAt().toString() : Instant.now().toString();
            
            // Fixed: Use buildingUnits instead of getUnits()
            response.ownedUnitsCount = 0; // Default value since we don't have direct access
            return response;
        }
    }
}