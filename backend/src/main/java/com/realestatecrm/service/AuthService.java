package com.realestatecrm.service;

import com.realestatecrm.dto.AuthDtos;
import com.realestatecrm.entity.User;
import com.realestatecrm.repository.UserRepository;
import com.realestatecrm.config.JwtProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Use BCrypt for password matching
    }

    public AuthDtos.LoginResponse login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtProvider.generateToken(user.getUsername(), user.getRole().name());

        AuthDtos.LoginResponse response = new AuthDtos.LoginResponse();
        response.accessToken = token;
        response.expiresIn = jwtProvider.getExpirationMs();
        response.role = user.getRole().name();

        return response;
    }

    // Helper method for password matching test
    public boolean passwordMatches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
