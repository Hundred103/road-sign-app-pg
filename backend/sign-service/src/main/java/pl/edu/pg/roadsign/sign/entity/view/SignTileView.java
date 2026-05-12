package pl.edu.pg.roadsign.sign.entity.view;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sign_tile_views",
        uniqueConstraints = @UniqueConstraint(name = "uk_sign_tile_view_user_sign", columnNames = {"user_id", "sign_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignTileView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "sign_id", nullable = false)
    private Long signId;

    @Column(name = "last_viewed_at", nullable = false)
    private LocalDateTime lastViewedAt;
}
