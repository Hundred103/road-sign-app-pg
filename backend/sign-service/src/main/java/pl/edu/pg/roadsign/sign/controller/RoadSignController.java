package pl.edu.pg.roadsign.sign.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pg.roadsign.sign.dto.TileViewResponse;
import pl.edu.pg.roadsign.sign.entity.RoadSign;
import pl.edu.pg.roadsign.sign.entity.SignCategory;
import pl.edu.pg.roadsign.sign.service.RoadSignService;

import java.util.List;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/signs")
@RequiredArgsConstructor
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

    @GetMapping("/views")
    public ResponseEntity<List<TileViewResponse>> getUserTileViews(@RequestParam Long userId) {
        return ResponseEntity.ok(roadSignService.getUserTileViews(userId).stream().map(TileViewResponse::from).toList());
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<TileViewResponse> markTileViewed(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(TileViewResponse.from(roadSignService.markTileViewed(id, userId)));
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

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getSignImage(@PathVariable Long id) {
        return roadSignService.getSignById(id)
                .map(sign -> {
                    String imageUrl = sign.getImageUrl();
                    if (imageUrl == null || imageUrl.isBlank()) {
                        return ResponseEntity.notFound().<byte[]>build();
                    }

                    // Normalize path (strip leading /) and URL-decode in case it was encoded
                    String path = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl;
                    String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);

                    String[] backends = new String[]{
                            // try container name, service name, and localhost as fallbacks
                            "http://road-sign-frontend/",
                            "http://frontend/",
                            "http://127.0.0.1:4200/"
                    };

                    // If imageUrl already looks like an absolute URL, try it first
                    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                        backends = new String[]{""};
                        path = imageUrl;
                    }

                    for (String backend : backends) {
                        try {
                            String target = backend + decodedPath;
                            URL url = new URL(target);
                            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                            conn.setConnectTimeout(3000);
                            conn.setReadTimeout(5000);
                            conn.setRequestMethod("GET");
                            int rc = conn.getResponseCode();
                            if (rc != 200) {
                                continue;
                            }
                            String contentType = conn.getContentType();
                            try (InputStream in = conn.getInputStream()) {
                                byte[] bytes = in.readAllBytes();
                                HttpHeaders headers = new HttpHeaders();
                                if (contentType != null) {
                                    headers.setContentType(MediaType.parseMediaType(contentType));
                                }
                                return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
                            }
                        } catch (Exception e) {
                            // try next backend
                        }
                    }

                    return ResponseEntity.notFound().<byte[]>build();
                })
                .orElse(ResponseEntity.notFound().<byte[]>build());
    }

    @GetMapping("/assets-proxy/**")
    public ResponseEntity<byte[]> proxyAsset(HttpServletRequest request) {
    String uri = request.getRequestURI();
    String marker = "/assets-proxy/";
    int idx = uri.indexOf(marker);
    if (idx < 0) return ResponseEntity.badRequest().<byte[]>build();
    String path = uri.substring(idx + marker.length());
    if (path.isBlank()) return ResponseEntity.badRequest().<byte[]>build();

    // decode encoded path segments (e.g. assets%2Fsigns%2F...)
    String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);

        String[] backends = new String[]{
                "http://road-sign-frontend/",
                "http://frontend/",
                "http://127.0.0.1:4200/"
        };

        for (String backend : backends) {
                try {
                String target = backend + decodedPath;
                URL url = new URL(target);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(5000);
                conn.setRequestMethod("GET");
                int rc = conn.getResponseCode();
                if (rc != 200) continue;
                String contentType = conn.getContentType();
                try (InputStream in = conn.getInputStream()) {
                    byte[] bytes = in.readAllBytes();
                    HttpHeaders headers = new HttpHeaders();
                    if (contentType != null) headers.setContentType(MediaType.parseMediaType(contentType));
                    return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
                }
            } catch (Exception e) {
                // try next
            }
        }

        return ResponseEntity.notFound().<byte[]>build();
    }
}
