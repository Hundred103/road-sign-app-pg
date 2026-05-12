package pl.edu.pg.roadsign.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.edu.pg.roadsign.quiz.dto.QuizResponse;
import pl.edu.pg.roadsign.quiz.entity.Quiz;
import pl.edu.pg.roadsign.quiz.entity.QuizAnswer;
import pl.edu.pg.roadsign.quiz.entity.QuizQuestion;
import pl.edu.pg.roadsign.quiz.repository.QuizRepository;
import pl.edu.pg.roadsign.quiz.repository.QuizAnswerRepository;
import pl.edu.pg.roadsign.quiz.repository.QuizQuestionRepository;
import pl.edu.pg.roadsign.quiz.repository.QuizResultRepository;
import pl.edu.pg.roadsign.quiz.entity.QuizResult;

import java.time.OffsetDateTime;
import java.util.Optional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuizResultRepository resultRepository;

    @Transactional(readOnly = true)
    public List<QuizQuestion> getAllQuestions() {
        return getDefaultQuizQuestions();
    }

    @Transactional(readOnly = true)
    public Optional<QuizQuestion> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<QuizResponse> getQuizById(Long id) {
        return quizRepository.findById(id).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<Quiz> getDefaultQuiz() {
        return quizRepository.findByDefaultQuizTrue();
    }

    @Transactional(readOnly = true)
    public List<QuizQuestion> getQuestionsForQuiz(Long quizId) {
        return questionRepository.findByQuizIdOrderByIdAsc(quizId);
    }

    @Transactional(readOnly = true)
    public List<QuizQuestion> getDefaultQuizQuestions() {
        Quiz defaultQuiz = getDefaultQuiz()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Default quiz not found"));
        return getQuestionsForQuiz(defaultQuiz.getId());
    }

    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        if (Boolean.TRUE.equals(quiz.getDefaultQuiz())) {
            quizRepository.findByDefaultQuizTrue().ifPresent(existing -> {
                existing.setDefaultQuiz(false);
                quizRepository.save(existing);
            });
        }
        return quizRepository.save(quiz);
    }

    @Transactional
    public Quiz updateQuiz(Long id, Quiz quizDetails) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: " + id));

        if (Boolean.TRUE.equals(quizDetails.getDefaultQuiz()) && !Boolean.TRUE.equals(quiz.getDefaultQuiz())) {
            quizRepository.findByDefaultQuizTrue().ifPresent(existing -> {
                existing.setDefaultQuiz(false);
                quizRepository.save(existing);
            });
        }

        quiz.setCode(quizDetails.getCode());
        quiz.setTitle(quizDetails.getTitle());
        quiz.setDescription(quizDetails.getDescription());
        quiz.setDefaultQuiz(quizDetails.getDefaultQuiz());
        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    public QuizQuestion createQuestion(QuizQuestion question) {
        Quiz defaultQuiz = getDefaultQuiz()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Default quiz not found"));
        question.setQuiz(defaultQuiz);
        // ensure bi-directional relation
        if (question.getAnswers() != null) {
            question.getAnswers().forEach(a -> a.setQuestion(question));
        }
        return questionRepository.save(question);
    }

    public QuizQuestion updateQuestion(Long id, QuizQuestion questionDetails) {
        QuizQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found: " + id));

        q.setQuestionText(questionDetails.getQuestionText());
        q.setImageUrl(questionDetails.getImageUrl());

        // replace answers: clear and add
        q.getAnswers().clear();
        if (questionDetails.getAnswers() != null) {
            questionDetails.getAnswers().forEach(a -> {
                a.setQuestion(q);
                q.getAnswers().add(a);
            });
        }

        return questionRepository.save(q);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public QuizQuestion createQuestionForQuiz(Long quizId, QuizQuestion question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: " + quizId));
        question.setQuiz(quiz);
        if (question.getAnswers() != null) {
            question.getAnswers().forEach(a -> a.setQuestion(question));
        }
        return questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public List<QuizAnswer> getAnswersForQuestion(Long questionId) {
        return answerRepository.findByQuestionId(questionId);
    }

    public QuizAnswer addAnswerToQuestion(Long questionId, QuizAnswer answer) {
        QuizQuestion q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found: " + questionId));
        answer.setQuestion(q);
        return answerRepository.save(answer);
    }

    public void deleteAnswer(Long answerId) {
        answerRepository.deleteById(answerId);
    }

    @Transactional(readOnly = true)
    public QuizResponse toResponse(Quiz quiz) {
        return QuizResponse.from(quiz, questionRepository.countByQuizId(quiz.getId()));
    }

    @Transactional
    public QuizResult submitResult(Long quizId, Long userId, int score, int maxScore) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }

        double pct = maxScore == 0 ? 0.0 : (100.0 * score) / maxScore;
        OffsetDateTime now = OffsetDateTime.now();

        Optional<QuizResult> existing = resultRepository.findByUserIdAndQuizId(userId, quizId);
        if (existing.isPresent()) {
            QuizResult r = existing.get();
            if (score > r.getBestScore()) {
                r.setBestScore(score);
                r.setMaxScore(maxScore);
                r.setPercentage(pct);
                r.setAchievedAt(now);
                return resultRepository.save(r);
            }
            return r;
        } else {
            QuizResult r = new QuizResult();
            r.setUserId(userId);
            r.setQuizId(quizId);
            r.setBestScore(score);
            r.setMaxScore(maxScore);
            r.setPercentage(pct);
            r.setAchievedAt(now);
            return resultRepository.save(r);
        }
    }

    @Transactional(readOnly = true)
    public Optional<QuizResult> getBestResult(Long quizId, Long userId) {
        if (userId == null) return Optional.empty();
        return resultRepository.findByUserIdAndQuizId(userId, quizId);
    }
}
