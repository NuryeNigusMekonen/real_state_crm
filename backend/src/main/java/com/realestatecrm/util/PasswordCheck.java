package com.realestatecrm.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordCheck {
    public static void main(String[] args) {
        String rawPassword = "Nurye123"; // input possword
        String storedHash = "$2a$10$rZm95ZNtMUm/hy1aLcvRRePhEW7jRE1jzJn/CD0XxUBQ00c3/LEta"; // From DB

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean matches = encoder.matches(rawPassword, storedHash);

        System.out.println("Password match: " + matches);
    }
}
