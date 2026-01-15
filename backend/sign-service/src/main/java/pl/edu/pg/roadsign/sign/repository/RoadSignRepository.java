package pl.edu.pg.roadsign.sign.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.edu.pg.roadsign.sign.entity.RoadSign;
import pl.edu.pg.roadsign.sign.entity.SignCategory;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadSignRepository extends JpaRepository<RoadSign, Long> {
    
    List<RoadSign> findByCategory(SignCategory category);
    
    Optional<RoadSign> findByCode(String code);
    
    List<RoadSign> findByNameContainingIgnoreCase(String name);
}
