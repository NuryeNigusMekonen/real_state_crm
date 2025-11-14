package com.realestatecrm.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Usage: java PasswordHashGenerator <raw-password>");
            System.exit(1);
        }
        String rawPassword = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode(rawPassword);
        System.out.println("BCrypt hash: " + hashed);
    }
}
