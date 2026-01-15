package pl.edu.pg.roadsign.sign.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pg.roadsign.sign.entity.RoadSign;
import pl.edu.pg.roadsign.sign.entity.SignCategory;
import pl.edu.pg.roadsign.sign.service.RoadSignService;

import java.util.List;

@RestController
@RequestMapping("/signs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoadSignController {

    private final RoadSignService roadSignService;

    @GetMapping
    public ResponseEntity<List<RoadSign>> getAllSigns() {
        return ResponseEntity.ok(roadSignService.getAllSigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoadSign> getSignById(@PathVariable Long id) {
        return roadSignService.getSignById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<RoadSign>> getSignsByCategory(@PathVariable SignCategory category) {
        return ResponseEntity.ok(roadSignService.getSignsByCategory(category));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<RoadSign> getSignByCode(@PathVariable String code) {
        return roadSignService.getSignByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoadSign> createSign(@RequestBody RoadSign sign) {
        RoadSign created = roadSignService.createSign(sign);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoadSign> updateSign(@PathVariable Long id, @RequestBody RoadSign sign) {
        return ResponseEntity.ok(roadSignService.updateSign(id, sign));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSign(@PathVariable Long id) {
        roadSignService.deleteSign(id);
        return ResponseEntity.noContent().build();
    }
}
