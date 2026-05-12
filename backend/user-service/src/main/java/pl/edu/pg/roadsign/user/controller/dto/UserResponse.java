package pl.edu.pg.roadsign.user.controller.dto;

import pl.edu.pg.roadsign.user.entity.User;
import pl.edu.pg.roadsign.user.entity.UserRole;

public record UserResponse(
        Long id,
        String username,
        String email,
        String displayName,
        UserRole role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole()
        );
    }
}
