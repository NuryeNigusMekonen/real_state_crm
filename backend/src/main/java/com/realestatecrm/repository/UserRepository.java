package com.realestatecrm.repository;

import com.realestatecrm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Finds a User entity by its unique username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a User entity by its unique email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user with the given username exists, excluding the user with the specified ID.
     */
    boolean existsByUsernameAndIdNot(String username, UUID id);

    /**
     * Checks if a user with the given email exists, excluding the user with the specified ID.
     */
    boolean existsByEmailAndIdNot(String email, UUID id);
}