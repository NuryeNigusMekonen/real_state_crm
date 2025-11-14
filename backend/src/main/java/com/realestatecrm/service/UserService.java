package com.realestatecrm.service;

import com.realestatecrm.dto.UserDto;
import com.realestatecrm.entity.User;
import com.realestatecrm.mapper.UserMapper;
import com.realestatecrm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    public UserDto create(UserDto dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent())
            throw new IllegalArgumentException("Username already taken");
        if (userRepository.findByEmail(dto.getEmail()).isPresent())
            throw new IllegalArgumentException("Email already registered");

        User user = userMapper.toEntity(dto);
        user.setId(null);
        user.setPasswordHash(passwordEncoder.encode(dto.getPasswordHash()));
        return userMapper.toDto(userRepository.save(user));
    }

    public UserDto update(UUID id, UserDto dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        userMapper.updateEntityFromDto(dto, existing);
        return userMapper.toDto(userRepository.save(existing));
    }

    public void delete(UUID id) {
        if (!userRepository.existsById(id))
            throw new EntityNotFoundException("User not found");
        userRepository.deleteById(id);
    }
}
