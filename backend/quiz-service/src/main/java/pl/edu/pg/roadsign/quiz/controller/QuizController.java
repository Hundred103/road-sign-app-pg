package pl.edu.pg.roadsign.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pg.roadsign.quiz.entity.QuizAnswer;
import pl.edu.pg.roadsign.quiz.entity.QuizQuestion;
import pl.edu.pg.roadsign.quiz.service.QuizService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Objects;
import java.util.List;

@RestController
@RequestMapping({"/quiz", "/quiz-questions"})
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Object>> getAllQuestions() {
        List<QuizQuestion> list = quizService.getAllQuestions();
        List<Object> dto = list.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getQuestionById(@PathVariable Long id) {
        return quizService.getQuestionById(id)
                .map(q -> ResponseEntity.ok((Object) toDto(q)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Object> createQuestion(@RequestBody Object payload) {
        QuizQuestion qEntity = fromPayload(payload);
        QuizQuestion created = quizService.createQuestion(qEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateQuestion(@PathVariable Long id, @RequestBody Object payload) {
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
