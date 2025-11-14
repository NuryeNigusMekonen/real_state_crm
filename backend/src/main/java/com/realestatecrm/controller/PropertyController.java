package com.realestatecrm.controller;

import com.realestatecrm.dto.PropertyDtos;
import com.realestatecrm.entity.*;
import com.realestatecrm.service.PropertyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/properties")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PropertyController {

    private final PropertyService propertyService;
    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    
    public PropertyController(PropertyService propertyService) { 
        this.propertyService = propertyService; 
    }

    // === HEALTH CHECK ===
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("Health check endpoint called");
        return ResponseEntity.ok("Property service is healthy");
    }

    // === SITE ENDPOINTS ===
    @GetMapping("/sites")
    public ResponseEntity<List<PropertyDtos.SiteResponse>> getAllSites() {
        logger.info("GET /sites - Fetching all sites");
        try {
            List<Site> sites = propertyService.getAllSites();
            List<PropertyDtos.SiteResponse> response = sites.stream()
                .map(PropertyDtos.SiteResponse::fromEntity)
                .collect(Collectors.toList());
            
            logger.info("GET /sites - Successfully returned {} sites", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /sites - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/sites/{id}")
    public ResponseEntity<PropertyDtos.SiteResponse> getSiteById(@PathVariable UUID id) {
        logger.info("GET /sites/{}", id);
        try {
            Site site = propertyService.getSiteById(id);
            PropertyDtos.SiteResponse response = PropertyDtos.SiteResponse.fromEntity(site);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /sites/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/sites")
    public ResponseEntity<?> createSite(@RequestBody PropertyDtos.CreateSiteRequest request) {
        logger.info("POST /sites - Creating site: {}", request.name);
        try {
            Site site = propertyService.createSite(request);
            PropertyDtos.SiteResponse response = PropertyDtos.SiteResponse.fromEntity(site);
            logger.info("POST /sites - Created successfully: {}", site.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("POST /sites - Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("POST /sites - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to create site: " + e.getMessage());
        }
    }

    @PutMapping("/sites/{id}")
    public ResponseEntity<?> updateSite(@PathVariable UUID id, @RequestBody PropertyDtos.CreateSiteRequest request) {
        logger.info("PUT /sites/{} - Updating site", id);
        try {
            Site site = propertyService.updateSite(id, request);
            PropertyDtos.SiteResponse response = PropertyDtos.SiteResponse.fromEntity(site);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PUT /sites/{} - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PUT /sites/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to update site: " + e.getMessage());
        }
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<?> deleteSite(@PathVariable UUID id) {
        logger.info("DELETE /sites/{}", id);
        try {
            propertyService.deleteSite(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("DELETE /sites/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete site: " + e.getMessage());
        }
    }

    // === BUILDING ENDPOINTS ===
    @GetMapping("/buildings")
    public ResponseEntity<List<PropertyDtos.BuildingResponse>> getAllBuildings() {
        logger.info("GET /buildings - Fetching all buildings");
        try {
            List<Building> buildings = propertyService.getAllBuildings();
            List<PropertyDtos.BuildingResponse> response = buildings.stream()
                .map(PropertyDtos.BuildingResponse::fromEntity)
                .collect(Collectors.toList());
            
            logger.info("GET /buildings - Successfully returned {} buildings", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /buildings - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/sites/{siteId}/buildings")
    public ResponseEntity<List<PropertyDtos.BuildingResponse>> getBuildingsBySite(@PathVariable UUID siteId) {
        logger.info("GET /sites/{}/buildings", siteId);
        try {
            List<Building> buildings = propertyService.getBuildingsBySite(siteId);
            List<PropertyDtos.BuildingResponse> response = buildings.stream()
                .map(PropertyDtos.BuildingResponse::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /sites/{}/buildings - Error: {}", siteId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/buildings")
    public ResponseEntity<?> createBuilding(@RequestBody PropertyDtos.CreateBuildingRequest request) {
        logger.info("POST /buildings - Creating building: {}", request.name);
        logger.info("POST /buildings - Request data: name={}, floorCount={}, totalAreaSqm={}, siteId={}", 
            request.name, request.floorCount, request.totalAreaSqm, request.siteId);
        
        try {
            Building building = propertyService.createBuilding(request);
            PropertyDtos.BuildingResponse response = PropertyDtos.BuildingResponse.fromEntity(building);
            logger.info("POST /buildings - Created successfully: {}", building.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("POST /buildings - Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("POST /buildings - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to create building: " + e.getMessage());
        }
    }

    @PutMapping("/buildings/{id}")
    public ResponseEntity<?> updateBuilding(@PathVariable UUID id, @RequestBody PropertyDtos.CreateBuildingRequest request) {
        logger.info("PUT /buildings/{}", id);
        try {
            Building building = propertyService.updateBuilding(id, request);
            PropertyDtos.BuildingResponse response = PropertyDtos.BuildingResponse.fromEntity(building);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PUT /buildings/{} - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PUT /buildings/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to update building: " + e.getMessage());
        }
    }

    @DeleteMapping("/buildings/{id}")
    public ResponseEntity<?> deleteBuilding(@PathVariable UUID id) {
        logger.info("DELETE /buildings/{}", id);
        try {
            propertyService.deleteBuilding(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("DELETE /buildings/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete building: " + e.getMessage());
        }
    }

    // === BUILDING UNIT ENDPOINTS ===
    @GetMapping("/units")
    public ResponseEntity<List<PropertyDtos.UnitResponse>> getAllUnits(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "buildingId", required = false) UUID buildingId) {
        
        logger.info("GET /units - status={}, type={}, buildingId={}", status, type, buildingId);
        
        try {
            List<BuildingUnit> units;
            
            if (status != null) {
                BuildingUnit.Status unitStatus = BuildingUnit.Status.valueOf(status);
                units = propertyService.getUnitsByStatus(unitStatus);
            } else if (type != null) {
                BuildingUnit.UnitType unitType = BuildingUnit.UnitType.valueOf(type);
                units = propertyService.getUnitsByType(unitType);
            } else if (buildingId != null) {
                units = propertyService.getUnitsByBuilding(buildingId);
            } else {
                units = propertyService.getAllUnits();
            }
            
            List<PropertyDtos.UnitResponse> response = units.stream()
                .map(PropertyDtos.UnitResponse::fromEntity)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("GET /units - Invalid parameter: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("GET /units - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/units/{id}")
    public ResponseEntity<PropertyDtos.UnitResponse> getUnitById(@PathVariable UUID id) {
        logger.info("GET /units/{}", id);
        try {
            BuildingUnit unit = propertyService.getUnitById(id);
            PropertyDtos.UnitResponse response = PropertyDtos.UnitResponse.fromEntity(unit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /units/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/units")
    public ResponseEntity<?> createUnit(@RequestBody PropertyDtos.CreateUnitRequest request) {
        logger.info("POST /units - Creating unit: {}", request.unitNumber);
        try {
            BuildingUnit unit = propertyService.createUnit(request);
            PropertyDtos.UnitResponse response = PropertyDtos.UnitResponse.fromEntity(unit);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("POST /units - Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("POST /units - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to create unit: " + e.getMessage());
        }
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable UUID id, @RequestBody PropertyDtos.CreateUnitRequest request) {
        logger.info("PUT /units/{}", id);
        try {
            BuildingUnit unit = propertyService.updateUnit(id, request);
            PropertyDtos.UnitResponse response = PropertyDtos.UnitResponse.fromEntity(unit);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PUT /units/{} - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PUT /units/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to update unit: " + e.getMessage());
        }
    }

    @PatchMapping("/units/{id}/status")
    public ResponseEntity<?> updateUnitStatus(
            @PathVariable UUID id, 
            @RequestBody PropertyDtos.UpdateUnitStatusRequest request) {
        logger.info("PATCH /units/{}/status - {}", id, request.status);
        try {
            BuildingUnit unit = propertyService.updateUnitStatus(id, request.status);
            PropertyDtos.UnitResponse response = PropertyDtos.UnitResponse.fromEntity(unit);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PATCH /units/{}/status - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PATCH /units/{}/status - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to update unit status: " + e.getMessage());
        }
    }

    @PatchMapping("/units/{id}/assign-owner")
    public ResponseEntity<?> assignUnitOwner(
            @PathVariable UUID id, 
            @RequestBody PropertyDtos.AssignOwnerRequest request) {
        logger.info("PATCH /units/{}/assign-owner - {}", id, request.ownerId);
        try {
            BuildingUnit unit = propertyService.assignUnitOwner(id, request.ownerId);
            PropertyDtos.UnitResponse response = PropertyDtos.UnitResponse.fromEntity(unit);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PATCH /units/{}/assign-owner - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PATCH /units/{}/assign-owner - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to assign owner to unit: " + e.getMessage());
        }
    }

    @DeleteMapping("/units/{id}")
    public ResponseEntity<?> deleteUnit(@PathVariable UUID id) {
        logger.info("DELETE /units/{}", id);
        try {
            propertyService.deleteUnit(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("DELETE /units/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete unit: " + e.getMessage());
        }
    }

    // === OWNER ENDPOINTS ===
    @GetMapping("/owners")
    public ResponseEntity<List<PropertyDtos.OwnerResponse>> getAllOwners() {
        logger.info("GET /owners - Fetching all owners");
        try {
            List<Owner> owners = propertyService.getAllOwners();
            List<PropertyDtos.OwnerResponse> response = owners.stream()
                .map(PropertyDtos.OwnerResponse::fromEntity)
                .collect(Collectors.toList());
            
            logger.info("GET /owners - Successfully returned {} owners", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /owners - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/owners/{id}")
    public ResponseEntity<PropertyDtos.OwnerResponse> getOwnerById(@PathVariable UUID id) {
        logger.info("GET /owners/{}", id);
        try {
            Owner owner = propertyService.getOwnerById(id);
            PropertyDtos.OwnerResponse response = PropertyDtos.OwnerResponse.fromEntity(owner);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("GET /owners/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/owners")
    public ResponseEntity<?> createOwner(@RequestBody PropertyDtos.CreateOwnerRequest request) {
        logger.info("POST /owners - Creating owner: {}", request.name);
        try {
            Owner owner = propertyService.createOwner(request);
            PropertyDtos.OwnerResponse response = PropertyDtos.OwnerResponse.fromEntity(owner);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("POST /owners - Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("POST /owners - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to create owner: " + e.getMessage());
        }
    }

    @PutMapping("/owners/{id}")
    public ResponseEntity<?> updateOwner(@PathVariable UUID id, @RequestBody PropertyDtos.CreateOwnerRequest request) {
        logger.info("PUT /owners/{}", id);
        try {
            Owner owner = propertyService.updateOwner(id, request);
            PropertyDtos.OwnerResponse response = PropertyDtos.OwnerResponse.fromEntity(owner);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("PUT /owners/{} - Validation error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("PUT /owners/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to update owner: " + e.getMessage());
        }
    }

    @DeleteMapping("/owners/{id}")
    public ResponseEntity<?> deleteOwner(@PathVariable UUID id) {
        logger.info("DELETE /owners/{}", id);
        try {
            propertyService.deleteOwner(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("DELETE /owners/{} - Error: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete owner: " + e.getMessage());
        }
    }
}