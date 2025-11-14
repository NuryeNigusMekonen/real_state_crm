package com.realestatecrm.mapper;

import com.realestatecrm.dto.UserDto;
import com.realestatecrm.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setCompensationType(user.getCompensationType());
        dto.setBaseSalary(user.getBaseSalary());
        return dto;
    }

    public User toEntity(UserDto dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPasswordHash());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(dto.getRole());
        user.setCompensationType(dto.getCompensationType());
        user.setBaseSalary(dto.getBaseSalary());
        return user;
    }

    public void updateEntityFromDto(UserDto dto, User user) {
        if (dto == null || user == null) return;

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(dto.getRole());
        user.setCompensationType(dto.getCompensationType());
        user.setBaseSalary(dto.getBaseSalary());
    }
}
