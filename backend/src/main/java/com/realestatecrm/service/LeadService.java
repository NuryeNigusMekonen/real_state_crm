package com.realestatecrm.service;

import com.realestatecrm.dto.LeadDtos;
import com.realestatecrm.entity.Lead;
import com.realestatecrm.entity.User;
import com.realestatecrm.repository.LeadRepository;
import com.realestatecrm.repository.UserRepository;
import com.realestatecrm.exception.ResourceNotFoundException; // 💡 CRITICAL: Ensure this class exists

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.Optional; // Still needed for internal repository use

@Service
public class LeadService {
    private final LeadRepository leadRepo;
    private final UserRepository userRepo;

    public LeadService(LeadRepository leadRepo, UserRepository userRepo) {
        this.leadRepo = leadRepo;
        this.userRepo = userRepo;
    }

    public Lead create(Lead l) { 
        return leadRepo.save(l); 
    }
    
    public List<Lead> list() { 
        return leadRepo.findAll(); 
    }
    
    // 🛑 FIX 1: Removed the original findById method that returned Optional<Lead>.
    // It caused the Type Mismatch error in the Controller.
    
    // ✅ NEW: Safe findById method for external calls (Controller/other Services)
    // This is what the LeadController now calls. It resolves the Type Mismatch.
    public Lead findById(UUID id) { 
        return leadRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with ID: " + id));
    }

    // You can keep the original repository proxy if you still need the Optional for internal logic:
    public Optional<Lead> findByIdOptional(UUID id) { 
        return leadRepo.findById(id); 
    }

    // --- Assign Lead ---
    public Lead assign(UUID leadId, UUID userId) {
        // Use the safe findById method
        Lead lead = findById(leadId); 
        
        // Standardize exception for User lookup
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
                
        lead.setAssignedTo(u);
        lead.setUpdatedAt(Instant.now()); 
        return leadRepo.save(lead);
    }

    // --- Update Status ---
    public Lead updateStatus(UUID leadId, Lead.Status status) {
        // Use the safe findById method
        Lead lead = findById(leadId);
        
        lead.setStatus(status);
        lead.setUpdatedAt(Instant.now()); 
        return leadRepo.save(lead);
    }

    // --- Update (PUT request) ---
    public Lead update(UUID id, LeadDtos.CreateLeadRequest req) {
        // Use the safe findById method (which will throw 404 if not found)
        Lead existingLead = findById(id);

        // Update fields from the request DTO
        existingLead.setFirstName(req.firstName);
        existingLead.setLastName(req.lastName);
        existingLead.setEmail(req.email);
        existingLead.setPhone(req.phone);
        existingLead.setSource(req.source);
        
        existingLead.setUpdatedAt(Instant.now());

        return leadRepo.save(existingLead);
    }

    // --- Delete (DELETE request) ---
    public void delete(UUID id) {
        if (!leadRepo.existsById(id)) {
            // Standardize exception type
            throw new ResourceNotFoundException("Lead not found with ID: " + id);
        }
        leadRepo.deleteById(id);
    }
}