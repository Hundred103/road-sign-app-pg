package pl.edu.pg.roadsign.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pg.roadsign.quiz.dto.QuizResponse;
import pl.edu.pg.roadsign.quiz.dto.QuizResultResponse;
import pl.edu.pg.roadsign.quiz.entity.QuizAnswer;
import pl.edu.pg.roadsign.quiz.entity.Quiz;
import pl.edu.pg.roadsign.quiz.entity.QuizQuestion;
import pl.edu.pg.roadsign.quiz.service.QuizService;
import pl.edu.pg.roadsign.quiz.entity.QuizResult;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/quiz", "/quiz-questions"})
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/quizzes")
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quizzes")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody Quiz quiz) {
        Quiz created = quizService.createQuiz(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.toResponse(created));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.toResponse(quizService.updateQuiz(id, quiz)));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/quizzes/{id}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsForQuiz(@PathVariable Long id) {
        List<Map<String, Object>> dto = quizService.getQuestionsForQuiz(id).stream().map(this::toDto).toList();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/quizzes/{id}/questions")
    public ResponseEntity<Map<String, Object>> createQuestionForQuiz(@PathVariable Long id, @RequestBody Object payload) {
        QuizQuestion qEntity = fromPayload(payload);
        QuizQuestion created = quizService.createQuestionForQuiz(id, qEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    @PostMapping("/quizzes/{id}/results")
    public ResponseEntity<QuizResultResponse> submitResult(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestParam(required = false) Long userId, HttpSession session) {
        Integer score = payload.get("score") instanceof Number ? ((Number) payload.get("score")).intValue() : null;
        Integer maxScore = payload.get("maxScore") instanceof Number ? ((Number) payload.get("maxScore")).intValue() : null;
        if (score == null || maxScore == null) {
            return ResponseEntity.badRequest().build();
        }

        if (userId == null) {
            Object sid = session.getAttribute("userId");
            if (sid instanceof Number) userId = ((Number) sid).longValue();
            else if (sid instanceof String) {
                try { userId = Long.valueOf((String) sid); } catch (NumberFormatException ignored) {}
            }
        }

        QuizResult result = quizService.submitResult(id, userId, score, maxScore);
        return ResponseEntity.ok(QuizResultResponse.from(result));
    }

    @GetMapping("/quizzes/{id}/best")
    public ResponseEntity<QuizResultResponse> getBestForQuiz(@PathVariable Long id, @RequestParam(required = false) Long userId, HttpSession session) {
        if (userId == null) {
            Object sid = session.getAttribute("userId");
            if (sid instanceof Number) userId = ((Number) sid).longValue();
            else if (sid instanceof String) {
                try { userId = Long.valueOf((String) sid); } catch (NumberFormatException ignored) {}
            }
        }
        if (userId == null) return ResponseEntity.badRequest().build();
        return quizService.getBestResult(id, userId)
                .map(r -> ResponseEntity.ok(QuizResultResponse.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllQuestions() {
        List<Map<String, Object>> dto = quizService.getAllQuestions().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getQuestionById(@PathVariable Long id) {
        return quizService.getQuestionById(id)
                .map(q -> ResponseEntity.ok(toDto(q)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuestion(@RequestBody Object payload) {
        QuizQuestion qEntity = fromPayload(payload);
        QuizQuestion created = quizService.createQuestion(qEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateQuestion(@PathVariable Long id, @RequestBody Object payload) {
        QuizQuestion qEntity = fromPayload(payload);
        QuizQuestion updated = quizService.updateQuestion(id, qEntity);
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/answers")
    public ResponseEntity<List<QuizAnswer>> getAnswersForQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getAnswersForQuestion(id));
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<QuizAnswer> addAnswerToQuestion(@PathVariable Long id, @RequestBody QuizAnswer answer) {
        QuizAnswer created = quizService.addAnswerToQuestion(id, answer);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long answerId) {
        quizService.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }

    // --- Mapping helpers to match frontend DTO shape ---
    private Map<String, Object> toDto(QuizQuestion q) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", q.getId());
        dto.put("question", q.getQuestionText());
        dto.put("imageUrl", q.getImageUrl());
        List<Map<String, Object>> answers = q.getAnswers().stream().map(a -> {
            Map<String, Object> am = new HashMap<>();
            am.put("text", a.getAnswerText());
            am.put("correct", a.getIsCorrect() != null ? a.getIsCorrect() : false);
            return am;
        }).collect(Collectors.toList());
        dto.put("answers", answers);
        return dto;
    }

    @SuppressWarnings("unchecked")
    private QuizQuestion fromPayload(Object payload) {
        QuizQuestion q = new QuizQuestion();

        if (payload instanceof QuizQuestion) {
            return (QuizQuestion) payload;
        }

        if (payload instanceof Map) {
            Map<String, Object> p = (Map<String, Object>) payload;
            Object qText = p.getOrDefault("question", p.get("questionText"));
            q.setQuestionText(qText != null ? qText.toString() : null);
            Object img = p.getOrDefault("imageUrl", p.get("image_url"));
            q.setImageUrl(img != null ? img.toString() : null);

            q.getAnswers().clear();
            Object ansObj = p.get("answers");
            if (ansObj instanceof Iterable) {
                for (Object ao : (Iterable<Object>) ansObj) {
                    if (ao instanceof Map) {
                        Map<String, Object> am = (Map<String, Object>) ao;
                        QuizAnswer a = new QuizAnswer();
                        a.setAnswerText(Objects.toString(am.getOrDefault("text", am.get("answerText")), null));
                        Object cor = am.getOrDefault("correct", am.get("isCorrect"));
                        a.setIsCorrect(Boolean.valueOf(Objects.toString(cor, "false")));
                        a.setQuestion(q);
                        q.getAnswers().add(a);
                    }
                }
            }
        }

        return q;
    }
}
