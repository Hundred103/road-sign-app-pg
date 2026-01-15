package pl.edu.pg.roadsign.sign.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "road_signs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadSign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignCategory category;

    private String imageUrl;

    @Column(name = "kid_friendly_description", length = 1000)
    private String kidFriendlyDescription;
}
