package com.realestatecrm.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "commission_records")
public class CommissionRecord {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    private BigDecimal amount;
    private String details; // JSON or free text
    private Instant issuedAt = Instant.now();

    // getters/setters
    public UUID getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Instant getIssuedAt() { return issuedAt; }
}
