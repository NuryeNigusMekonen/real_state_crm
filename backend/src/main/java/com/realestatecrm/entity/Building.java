package com.realestatecrm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "buildings")
public class Building {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "floor_count", nullable = false)
    private Integer floorCount;

    @Column(name = "total_area_sqm", nullable = false)
    private Double totalAreaSqm;

    // FIX: Add @JsonIgnore to prevent circular reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    @JsonIgnore
    private Site site;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // FIX: Add @JsonIgnore to prevent circular reference
    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BuildingUnit> buildingUnits = new ArrayList<>();

    // Constructors, getters, setters...
    public Building() {}

    public Building(String name, Integer floorCount, Double totalAreaSqm, Site site) {
        this.name = name;
        this.floorCount = floorCount;
        this.totalAreaSqm = totalAreaSqm;
        this.site = site;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getFloorCount() { return floorCount; }
    public void setFloorCount(Integer floorCount) { this.floorCount = floorCount; }
    public Double getTotalAreaSqm() { return totalAreaSqm; }
    public void setTotalAreaSqm(Double totalAreaSqm) { this.totalAreaSqm = totalAreaSqm; }
    public Site getSite() { return site; }
    public void setSite(Site site) { this.site = site; }
    public Instant getCreatedAt() { return createdAt; }
    public List<BuildingUnit> getBuildingUnits() { return buildingUnits; }
    public void setBuildingUnits(List<BuildingUnit> buildingUnits) { this.buildingUnits = buildingUnits; }
}