package pl.edu.pg.roadsign.user.ranking.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pg.roadsign.user.ranking.dto.RankingDto;
import pl.edu.pg.roadsign.user.ranking.dto.RankingSaveRequest;
import pl.edu.pg.roadsign.user.ranking.dto.RankingSaveResponse;
import pl.edu.pg.roadsign.user.ranking.service.RankingService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/rankings")
@RequiredArgsConstructor
@Slf4j
public class RankingController {

    private final RankingService rankingService;

    @PostMapping
    public ResponseEntity<RankingSaveResponse> saveResult(@RequestBody RankingSaveRequest request, HttpServletRequest httpRequest) {
        Long userId = SessionHelper.extractUserId(httpRequest);
        
        log.info("Ranking save attempt - userId: {}, quizId: {}, score: {}/{}", 
            userId, request.getQuizId(), request.getScore(), request.getMaxScore());
        
        RankingSaveResponse response = rankingService.trySaveResult(userId, request.getQuizId(), request.getScore(), request.getMaxScore());
        
        log.info("Ranking save result - saved: {}, reason: {}", response.isSaved(), response.getReason());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Map<String, Object>> getRanking(@PathVariable Long quizId, @RequestParam(required = false) Integer limit, HttpServletRequest httpRequest) {
        Long userId = SessionHelper.extractUserId(httpRequest);
        
        log.debug("Ranking fetch - quizId: {}, userId: {}, limit: {}", quizId, userId, limit);

        List<RankingDto> list = rankingService.getTopForQuiz(quizId, limit, userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("top", list);
        return ResponseEntity.ok(resp);
    }
}
