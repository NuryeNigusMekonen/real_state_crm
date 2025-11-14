package com.realestatecrm.controller;

import com.realestatecrm.dto.LeadDtos;
import com.realestatecrm.entity.Lead;
import com.realestatecrm.service.LeadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class LeadController {

    private final LeadService leadService;
    
    public LeadController(LeadService leadService) { 
        this.leadService = leadService; 
    }

    // --- Create Lead (POST /api/v1/leads) ---
    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody LeadDtos.CreateLeadRequest req) {
        Lead l = new Lead();
        l.setFirstName(req.firstName);
        l.setLastName(req.lastName);
        l.setEmail(req.email);
        l.setPhone(req.phone);
        l.setSource(req.source);
        Lead saved = leadService.create(l);
        return ResponseEntity.ok(saved);
    }

    // --- List All Leads (GET /api/v1/leads) ---
    @GetMapping
    public ResponseEntity<List<Lead>> listLeads() {
        return ResponseEntity.ok(leadService.list());
    }

    // --- Get Lead by ID (GET /api/v1/leads/{id}) ---
    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable UUID id) {
        Lead lead = leadService.findById(id); 
        return ResponseEntity.ok(lead);
    }
    
    // --- Update Lead (PUT /api/v1/leads/{id}) ---
    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable("id") UUID id, @RequestBody LeadDtos.CreateLeadRequest req) {
        Lead updated = leadService.update(id, req); 
        return ResponseEntity.ok(updated);
    }

    // --- Delete Lead (DELETE /api/v1/leads/{id}) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable("id") UUID id) {
        leadService.delete(id); 
        return ResponseEntity.noContent().build();
    }
    
    // --- Assign Lead (PUT /api/v1/leads/{id}/assign) ---
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable("id") UUID id, @RequestBody LeadDtos.AssignRequest req) {
        Lead updated = leadService.assign(id, req.assignedTo);
        return ResponseEntity.ok(updated);
    }

    // --- Update Status (PATCH /api/v1/leads/{id}/status) ---
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") UUID id, @RequestBody LeadDtos.StatusUpdateRequest req) {
        try {
            Lead.Status s = Lead.Status.valueOf(req.status);
            Lead updated = leadService.updateStatus(id, s);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value: " + req.status);
        }
    }
}