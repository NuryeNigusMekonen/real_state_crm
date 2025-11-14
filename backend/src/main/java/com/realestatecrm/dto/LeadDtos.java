package com.realestatecrm.dto;

import java.util.UUID;

public class LeadDtos {
    public static class CreateLeadRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String source;
    }

    public static class LeadResponse {
        public UUID id;
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String source;
        public String status;
        public UUID assignedTo;
    }

    public static class StatusUpdateRequest {
        public String status;
        public String note;
    }

    public static class AssignRequest {
        public UUID assignedTo;
    }
}
