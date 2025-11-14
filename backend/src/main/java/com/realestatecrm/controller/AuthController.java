package com.realestatecrm.controller;

import com.realestatecrm.dto.AuthDtos;
import com.realestatecrm.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest req) {
        try {
            log.info("Received login request for username: {}", req.username);
            AuthDtos.LoginResponse resp = authService.login(req.username, req.password);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException ex) {
            log.warn("Login failed for username {}: {}", req.username, ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid username or password"));
        } catch (Exception ex) {
            log.error("Unexpected error during login for username {}: {}", req.username, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error"));
        }
    }
    
    @GetMapping("/test-password-match")
    public ResponseEntity<Boolean> testPasswordMatch(
            @RequestParam String raw,
            @RequestParam String encoded) {
        boolean matches = authService.passwordMatches(raw, encoded);
        return ResponseEntity.ok(matches);
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
