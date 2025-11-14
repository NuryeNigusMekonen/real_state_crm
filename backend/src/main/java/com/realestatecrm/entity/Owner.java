package com.realestatecrm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "owners")
public class Owner {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String taxNumber;
    private String notes;
    
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // FIX: Add @JsonIgnore to prevent circular reference
    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BuildingUnit> units = new ArrayList<>();

    // Constructors, getters, setters...
    public Owner() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTaxNumber() { return taxNumber; }
    public void setTaxNumber(String taxNumber) { this.taxNumber = taxNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<BuildingUnit> getUnits() { return units; }
    public void setUnits(List<BuildingUnit> units) { this.units = units; }
}