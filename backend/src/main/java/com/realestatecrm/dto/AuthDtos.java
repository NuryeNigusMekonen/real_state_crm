package com.realestatecrm.dto;

import java.util.UUID;

public class AuthDtos {
    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class LoginResponse {
        public String accessToken;
        public long expiresIn;
        public String role;  
    }

    public static class UserDto {
        public UUID id;
        public String username;
        public String email;
        public String firstName;
        public String lastName;
        public String role;}}
    

