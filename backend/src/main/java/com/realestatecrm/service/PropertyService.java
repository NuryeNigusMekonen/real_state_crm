package com.realestatecrm.service;

import com.realestatecrm.dto.PropertyDtos;
import com.realestatecrm.entity.*;
import com.realestatecrm.exception.ResourceNotFoundException;
import com.realestatecrm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PropertyService {
    private final SiteRepository siteRepo;
    private final BuildingRepository buildingRepo;
    private final BuildingUnitRepository unitRepo;
    private final OwnerRepository ownerRepo;
    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);

    public PropertyService(SiteRepository siteRepo, BuildingRepository buildingRepo, 
                          BuildingUnitRepository unitRepo, OwnerRepository ownerRepo) {
        this.siteRepo = siteRepo;
        this.buildingRepo = buildingRepo;
        this.unitRepo = unitRepo;
        this.ownerRepo = ownerRepo;
    }

    // === SITE METHODS ===
    public List<Site> getAllSites() {
        logger.info("Fetching all sites");
        try {
            List<Site> sites = siteRepo.findAll();
            logger.info("Successfully fetched {} sites", sites.size());
            return sites;
        } catch (Exception e) {
            logger.error("Error fetching sites: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch sites: " + e.getMessage());
        }
    }

    public Site getSiteById(UUID id) {
        logger.info("Fetching site by ID: {}", id);
        return siteRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with ID: " + id));
    }

    public Site createSite(PropertyDtos.CreateSiteRequest request) {
        logger.info("Creating site: {}", request.name);
        
        try {
            // Validate required fields
            validateSiteRequest(request);
            
            Site site = new Site();
            site.setName(request.name != null ? request.name.trim() : "");
            site.setAddressLine1(request.addressLine1 != null ? request.addressLine1.trim() : "");
            site.setCity(request.city != null ? request.city.trim() : "");
            site.setCountry(request.country != null ? request.country.trim() : "");
            site.setParkingAvailable(request.parkingAvailable != null ? request.parkingAvailable : false);
            
            Site savedSite = siteRepo.save(site);
            logger.info("Site created successfully with ID: {}", savedSite.getId());
            return savedSite;
        } catch (Exception e) {
            logger.error("Error creating site: {}", e.getMessage());
            throw new RuntimeException("Failed to create site: " + e.getMessage());
        }
    }

    private void validateSiteRequest(PropertyDtos.CreateSiteRequest request) {
        if (request.name == null || request.name.trim().isEmpty()) {
            throw new IllegalArgumentException("Site name is required");
        }
        if (request.addressLine1 == null || request.addressLine1.trim().isEmpty()) {
            throw new IllegalArgumentException("Address line 1 is required");
        }
        if (request.city == null || request.city.trim().isEmpty()) {
            throw new IllegalArgumentException("City is required");
        }
        if (request.country == null || request.country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country is required");
        }
    }

    public Site updateSite(UUID id, PropertyDtos.CreateSiteRequest request) {
        logger.info("Updating site with ID: {}", id);
        try {
            Site site = getSiteById(id);
            
            if (request.name != null) site.setName(request.name.trim());
            if (request.addressLine1 != null) site.setAddressLine1(request.addressLine1.trim());
            if (request.city != null) site.setCity(request.city.trim());
            if (request.country != null) site.setCountry(request.country.trim());
            if (request.parkingAvailable != null) site.setParkingAvailable(request.parkingAvailable);
            
            Site updatedSite = siteRepo.save(site);
            logger.info("Site updated successfully");
            return updatedSite;
        } catch (Exception e) {
            logger.error("Error updating site: {}", e.getMessage());
            throw new RuntimeException("Failed to update site: " + e.getMessage());
        }
    }

    public void deleteSite(UUID id) {
        logger.info("Deleting site with ID: {}", id);
        try {
            if (!siteRepo.existsById(id)) {
                throw new ResourceNotFoundException("Site not found with ID: " + id);
            }
            siteRepo.deleteById(id);
            logger.info("Site deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting site: {}", e.getMessage());
            throw new RuntimeException("Failed to delete site: " + e.getMessage());
        }
    }

    // === BUILDING METHODS ===
    public List<Building> getAllBuildings() {
        logger.info("Fetching all buildings");
        try {
            List<Building> buildings = buildingRepo.findAll();
            logger.info("Successfully fetched {} buildings", buildings.size());
            return buildings;
        } catch (Exception e) {
            logger.error("Error fetching buildings: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch buildings: " + e.getMessage());
        }
    }

    public List<Building> getBuildingsBySite(UUID siteId) {
        logger.info("Fetching buildings for site ID: {}", siteId);
        try {
            Site site = getSiteById(siteId);
            List<Building> buildings = buildingRepo.findBySite(site);
            logger.info("Found {} buildings for site {}", buildings.size(), siteId);
            return buildings;
        } catch (Exception e) {
            logger.error("Error fetching buildings by site: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch buildings: " + e.getMessage());
        }
    }

    public Building createBuilding(PropertyDtos.CreateBuildingRequest request) {
        logger.info("Creating building: {}", request.name);
        
        try {
            // Validate required fields
            validateBuildingRequest(request);
            
            Site site = getSiteById(request.siteId);
            
            Building building = new Building();
            building.setName(request.name.trim());
            building.setFloorCount(request.floorCount);
            building.setTotalAreaSqm(request.totalAreaSqm);
            building.setSite(site);
            
            Building savedBuilding = buildingRepo.save(building);
            logger.info("Building created successfully with ID: {}", savedBuilding.getId());
            return savedBuilding;
        } catch (Exception e) {
            logger.error("Error creating building: {}", e.getMessage());
            throw new RuntimeException("Failed to create building: " + e.getMessage());
        }
    }

    private void validateBuildingRequest(PropertyDtos.CreateBuildingRequest request) {
        if (request.name == null || request.name.trim().isEmpty()) {
            throw new IllegalArgumentException("Building name is required");
        }
        if (request.floorCount == null || request.floorCount <= 0) {
            throw new IllegalArgumentException("Floor count must be positive");
        }
        if (request.totalAreaSqm == null || request.totalAreaSqm <= 0) {
            throw new IllegalArgumentException("Total area must be positive");
        }
        if (request.siteId == null) {
            throw new IllegalArgumentException("Site ID is required");
        }
    }

    public Building updateBuilding(UUID id, PropertyDtos.CreateBuildingRequest request) {
        logger.info("Updating building with ID: {}", id);
        try {
            Building building = getBuildingById(id);
            
            if (request.name != null) building.setName(request.name.trim());
            if (request.floorCount != null) building.setFloorCount(request.floorCount);
            if (request.totalAreaSqm != null) building.setTotalAreaSqm(request.totalAreaSqm);
            
            if (request.siteId != null && !request.siteId.equals(building.getSite().getId())) {
                Site site = getSiteById(request.siteId);
                building.setSite(site);
            }
            
            Building updatedBuilding = buildingRepo.save(building);
            logger.info("Building updated successfully");
            return updatedBuilding;
        } catch (Exception e) {
            logger.error("Error updating building: {}", e.getMessage());
            throw new RuntimeException("Failed to update building: " + e.getMessage());
        }
    }

    public void deleteBuilding(UUID id) {
        logger.info("Deleting building with ID: {}", id);
        try {
            if (!buildingRepo.existsById(id)) {
                throw new ResourceNotFoundException("Building not found with ID: " + id);
            }
            buildingRepo.deleteById(id);
            logger.info("Building deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting building: {}", e.getMessage());
            throw new RuntimeException("Failed to delete building: " + e.getMessage());
        }
    }

    private Building getBuildingById(UUID id) {
        return buildingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with ID: " + id));
    }

    // === BUILDING UNIT METHODS ===
    public List<BuildingUnit> getAllUnits() {
        try {
            return unitRepo.findAll();
        } catch (Exception e) {
            logger.error("Error fetching units: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch units: " + e.getMessage());
        }
    }

    public List<BuildingUnit> getUnitsByStatus(BuildingUnit.Status status) {
        try {
            return unitRepo.findByStatus(status);
        } catch (Exception e) {
            logger.error("Error fetching units by status: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch units: " + e.getMessage());
        }
    }

    public List<BuildingUnit> getUnitsByType(BuildingUnit.UnitType type) {
        try {
            return unitRepo.findByType(type);
        } catch (Exception e) {
            logger.error("Error fetching units by type: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch units: " + e.getMessage());
        }
    }

    public List<BuildingUnit> getUnitsByBuilding(UUID buildingId) {
        try {
            Building building = getBuildingById(buildingId);
            return unitRepo.findByBuilding(building);
        } catch (Exception e) {
            logger.error("Error fetching units by building: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch units: " + e.getMessage());
        }
    }

    public BuildingUnit getUnitById(UUID id) {
        return unitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building unit not found with ID: " + id));
    }

    public BuildingUnit createUnit(PropertyDtos.CreateUnitRequest request) {
        logger.info("Creating unit: {}", request.unitNumber);
        try {
            Building building = getBuildingById(request.buildingId);
            
            BuildingUnit unit = new BuildingUnit();
            unit.setUnitNumber(request.unitNumber);
            unit.setType(BuildingUnit.UnitType.valueOf(request.type));
            unit.setFloor(request.floor);
            unit.setAreaSqm(request.areaSqm);
            unit.setParkingSlots(request.parkingSlots != null ? request.parkingSlots : 0);
            unit.setPrice(request.price);
            unit.setStatus(BuildingUnit.Status.valueOf(request.status));
            unit.setBuilding(building);
            
            if (request.ownerId != null) {
                Owner owner = getOwnerById(request.ownerId);
                unit.setOwner(owner);
            }
            
            BuildingUnit savedUnit = unitRepo.save(unit);
            logger.info("Unit created successfully with ID: {}", savedUnit.getId());
            return savedUnit;
        } catch (Exception e) {
            logger.error("Error creating unit: {}", e.getMessage());
            throw new RuntimeException("Failed to create unit: " + e.getMessage());
        }
    }

    public BuildingUnit updateUnit(UUID id, PropertyDtos.CreateUnitRequest request) {
        logger.info("Updating unit with ID: {}", id);
        try {
            BuildingUnit unit = getUnitById(id);
            unit.setUnitNumber(request.unitNumber);
            unit.setType(BuildingUnit.UnitType.valueOf(request.type));
            unit.setFloor(request.floor);
            unit.setAreaSqm(request.areaSqm);
            unit.setParkingSlots(request.parkingSlots != null ? request.parkingSlots : unit.getParkingSlots());
            unit.setPrice(request.price);
            unit.setStatus(BuildingUnit.Status.valueOf(request.status));
            
            if (request.buildingId != null && !request.buildingId.equals(unit.getBuilding().getId())) {
                Building building = getBuildingById(request.buildingId);
                unit.setBuilding(building);
            }
            
            if (request.ownerId != null) {
                Owner owner = getOwnerById(request.ownerId);
                unit.setOwner(owner);
            } else {
                unit.setOwner(null);
            }
            
            BuildingUnit updatedUnit = unitRepo.save(unit);
            logger.info("Unit updated successfully");
            return updatedUnit;
        } catch (Exception e) {
            logger.error("Error updating unit: {}", e.getMessage());
            throw new RuntimeException("Failed to update unit: " + e.getMessage());
        }
    }

    public BuildingUnit updateUnitStatus(UUID id, String status) {
        logger.info("Updating unit status for ID: {} to {}", id, status);
        try {
            BuildingUnit unit = getUnitById(id);
            unit.setStatus(BuildingUnit.Status.valueOf(status));
            BuildingUnit updatedUnit = unitRepo.save(unit);
            logger.info("Unit status updated successfully");
            return updatedUnit;
        } catch (Exception e) {
            logger.error("Error updating unit status: {}", e.getMessage());
            throw new RuntimeException("Failed to update unit status: " + e.getMessage());
        }
    }

    public BuildingUnit assignUnitOwner(UUID unitId, UUID ownerId) {
        logger.info("Assigning owner {} to unit {}", ownerId, unitId);
        try {
            BuildingUnit unit = getUnitById(unitId);
            Owner owner = getOwnerById(ownerId);
            unit.setOwner(owner);
            BuildingUnit updatedUnit = unitRepo.save(unit);
            logger.info("Owner assigned successfully");
            return updatedUnit;
        } catch (Exception e) {
            logger.error("Error assigning owner to unit: {}", e.getMessage());
            throw new RuntimeException("Failed to assign owner to unit: " + e.getMessage());
        }
    }

    public void deleteUnit(UUID id) {
        logger.info("Deleting unit with ID: {}", id);
        try {
            if (!unitRepo.existsById(id)) {
                throw new ResourceNotFoundException("Building unit not found with ID: " + id);
            }
            unitRepo.deleteById(id);
            logger.info("Unit deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting unit: {}", e.getMessage());
            throw new RuntimeException("Failed to delete unit: " + e.getMessage());
        }
    }

    // === OWNER METHODS ===
    public List<Owner> getAllOwners() {
        try {
            return ownerRepo.findAll();
        } catch (Exception e) {
            logger.error("Error fetching owners: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch owners: " + e.getMessage());
        }
    }

    public Owner getOwnerById(UUID id) {
        return ownerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + id));
    }

    public Owner createOwner(PropertyDtos.CreateOwnerRequest request) {
        logger.info("Creating owner: {}", request.name);
        try {
            Owner owner = new Owner();
            owner.setName(request.name);
            owner.setContactPerson(request.contactPerson);
            owner.setEmail(request.email);
            owner.setPhone(request.phone);
            owner.setAddress(request.address);
            owner.setTaxNumber(request.taxNumber);
            owner.setNotes(request.notes);
            
            Owner savedOwner = ownerRepo.save(owner);
            logger.info("Owner created successfully with ID: {}", savedOwner.getId());
            return savedOwner;
        } catch (Exception e) {
            logger.error("Error creating owner: {}", e.getMessage());
            throw new RuntimeException("Failed to create owner: " + e.getMessage());
        }
    }

    public Owner updateOwner(UUID id, PropertyDtos.CreateOwnerRequest request) {
        logger.info("Updating owner with ID: {}", id);
        try {
            Owner owner = getOwnerById(id);
            owner.setName(request.name);
            owner.setContactPerson(request.contactPerson);
            owner.setEmail(request.email);
            owner.setPhone(request.phone);
            owner.setAddress(request.address);
            owner.setTaxNumber(request.taxNumber);
            owner.setNotes(request.notes);
            
            Owner updatedOwner = ownerRepo.save(owner);
            logger.info("Owner updated successfully");
            return updatedOwner;
        } catch (Exception e) {
            logger.error("Error updating owner: {}", e.getMessage());
            throw new RuntimeException("Failed to update owner: " + e.getMessage());
        }
    }

    public void deleteOwner(UUID id) {
        logger.info("Deleting owner with ID: {}", id);
        try {
            if (!ownerRepo.existsById(id)) {
                throw new ResourceNotFoundException("Owner not found with ID: " + id);
            }
            ownerRepo.deleteById(id);
            logger.info("Owner deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting owner: {}", e.getMessage());
            throw new RuntimeException("Failed to delete owner: " + e.getMessage());
        }
    }
}