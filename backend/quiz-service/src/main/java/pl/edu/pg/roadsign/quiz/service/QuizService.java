package pl.edu.pg.roadsign.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pg.roadsign.quiz.entity.QuizAnswer;
import pl.edu.pg.roadsign.quiz.entity.QuizQuestion;
import pl.edu.pg.roadsign.quiz.repository.QuizAnswerRepository;
import pl.edu.pg.roadsign.quiz.repository.QuizQuestionRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;

    @Transactional(readOnly = true)
    public List<QuizQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<QuizQuestion> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    public QuizQuestion createQuestion(QuizQuestion question) {
        // ensure bi-directional relation
        if (question.getAnswers() != null) {
            question.getAnswers().forEach(a -> a.setQuestion(question));
        }
        return questionRepository.save(question);
    }

    public QuizQuestion updateQuestion(Long id, QuizQuestion questionDetails) {
        QuizQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));

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

    @Transactional(readOnly = true)
    public List<QuizAnswer> getAnswersForQuestion(Long questionId) {
        return answerRepository.findByQuestionId(questionId);
    }

    public QuizAnswer addAnswerToQuestion(Long questionId, QuizAnswer answer) {
        QuizQuestion q = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
        answer.setQuestion(q);
        return answerRepository.save(answer);
    }

    public void deleteAnswer(Long answerId) {
        answerRepository.deleteById(answerId);
    }
}
