package com.realestatecrm.repository;

import com.realestatecrm.entity.Building;
import com.realestatecrm.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BuildingRepository extends JpaRepository<Building, UUID> {
    List<Building> findBySite(Site site);
}