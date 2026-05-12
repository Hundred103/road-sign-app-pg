package pl.edu.pg.roadsign.sign.repository.view;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.edu.pg.roadsign.sign.entity.view.SignTileView;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignTileViewRepository extends JpaRepository<SignTileView, Long> {

    List<SignTileView> findByUserId(Long userId);

    Optional<SignTileView> findByUserIdAndSignId(Long userId, Long signId);
}
