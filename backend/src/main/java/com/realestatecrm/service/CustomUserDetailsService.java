package com.realestatecrm.service;

import com.realestatecrm.entity.User;
import com.realestatecrm.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public CustomUserDetailsService(UserRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = repo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(),
                u.getPasswordHash() == null ? "" : u.getPasswordHash(),
                authorities(u)
        );
    }

    private Collection<? extends GrantedAuthority> authorities(User u) {
        return List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()));
    }
}
