package com.realestatecrm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "building_units")
public class BuildingUnit {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "unit_number", nullable = false)
    private String unitNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType type;

    @Column(nullable = false)
    private Integer floor;

    @Column(name = "area_sqm", nullable = false)
    private Double areaSqm;

    @Column(name = "parking_slots")
    private Integer parkingSlots = 0;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.AVAILABLE;

    // FIX: Add @JsonIgnore to prevent circular reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    @JsonIgnore
    private Building building;

    // FIX: Add @JsonIgnore to prevent circular reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private Owner owner;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public enum UnitType { 
        APARTMENT, OFFICE, SHOP, MIXED 
    }

    public enum Status { 
        AVAILABLE, RESERVED, LEASED, SOLD 
    }

    // Constructors, getters, setters...
    public BuildingUnit() {}

    public BuildingUnit(String unitNumber, UnitType type, Integer floor, Double areaSqm, Double price, Building building) {
        this.unitNumber = unitNumber;
        this.type = type;
        this.floor = floor;
        this.areaSqm = areaSqm;
        this.price = price;
        this.building = building;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }
    public UnitType getType() { return type; }
    public void setType(UnitType type) { this.type = type; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    public Double getAreaSqm() { return areaSqm; }
    public void setAreaSqm(Double areaSqm) { this.areaSqm = areaSqm; }
    public Integer getParkingSlots() { return parkingSlots; }
    public void setParkingSlots(Integer parkingSlots) { this.parkingSlots = parkingSlots; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }
    public Owner getOwner() { return owner; }
    public void setOwner(Owner owner) { this.owner = owner; }
    public Instant getCreatedAt() { return createdAt; }
}