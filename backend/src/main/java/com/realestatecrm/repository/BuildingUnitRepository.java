package com.realestatecrm.repository;

import com.realestatecrm.entity.Building;
import com.realestatecrm.entity.BuildingUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BuildingUnitRepository extends JpaRepository<BuildingUnit, UUID> {
    List<BuildingUnit> findByStatus(BuildingUnit.Status status);
    List<BuildingUnit> findByType(BuildingUnit.UnitType type);
    List<BuildingUnit> findByBuilding(Building building);
}