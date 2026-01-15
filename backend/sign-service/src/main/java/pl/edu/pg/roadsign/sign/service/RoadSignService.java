package pl.edu.pg.roadsign.sign.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pg.roadsign.sign.entity.RoadSign;
import pl.edu.pg.roadsign.sign.entity.SignCategory;
import pl.edu.pg.roadsign.sign.repository.RoadSignRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoadSignService {

    private final RoadSignRepository roadSignRepository;

    public List<RoadSign> getAllSigns() {
        return roadSignRepository.findAll();
    }

    public Optional<RoadSign> getSignById(Long id) {
        return roadSignRepository.findById(id);
    }

    public List<RoadSign> getSignsByCategory(SignCategory category) {
        return roadSignRepository.findByCategory(category);
    }

    public Optional<RoadSign> getSignByCode(String code) {
        return roadSignRepository.findByCode(code);
    }

    @Transactional
    public RoadSign createSign(RoadSign sign) {
        return roadSignRepository.save(sign);
    }

    @Transactional
    public RoadSign updateSign(Long id, RoadSign signDetails) {
        RoadSign sign = roadSignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sign not found with id: " + id));
        
        sign.setCode(signDetails.getCode());
        sign.setName(signDetails.getName());
        sign.setDescription(signDetails.getDescription());
        sign.setCategory(signDetails.getCategory());
        sign.setImageUrl(signDetails.getImageUrl());
        sign.setKidFriendlyDescription(signDetails.getKidFriendlyDescription());
        
        return roadSignRepository.save(sign);
    }

    @Transactional
    public void deleteSign(Long id) {
        roadSignRepository.deleteById(id);
    }
}
