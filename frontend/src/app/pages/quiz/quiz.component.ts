import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignService, QuizQuestion } from '../../services/sign.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  private signService = inject(SignService);

  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswerIndex: number | null = null;
  showResult = false;
  isCorrect = false;
  score = 0;
  quizStarted = false;
  quizFinished = false;
  isLoading = true;

  ngOnInit() {
    this.loadQuestions();
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  /**
   * Load questions from JSON file via SignService
   * Questions are defined in: assets/data/quiz-questions.json
   */
  loadQuestions() {
    this.isLoading = true;
    this.signService.getQuizQuestions().subscribe({
      next: (questions) => {
        this.questions = this.shuffleArray(questions);
        this.isLoading = false;
      },
      error: () => {
        this.questions = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Shuffle array to randomize question order
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  startQuiz() {
    this.quizStarted = true;
    this.quizFinished = false;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.selectedAnswerIndex = null;
    this.showResult = false;
  }

  selectAnswer(index: number) {
    if (this.showResult) return;

    this.selectedAnswerIndex = index;
    this.showResult = true;
    this.isCorrect = this.currentQuestion.answers[index].correct;

    if (this.isCorrect) {
      this.score++;
    }
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.quizFinished = true;
      this.quizStarted = false;
    } else {
      this.currentQuestionIndex++;
      this.selectedAnswerIndex = null;
      this.showResult = false;
    }
  }

  restartQuiz() {
    this.startQuiz();
  }

  getLetterForIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getScoreMessage(): string {
    const percentage = (this.score / this.questions.length) * 100;

    if (percentage === 100) return 'Perfekcyjnie! Jestes ekspertem od znakow drogowych!';
    if (percentage >= 80) return 'Swietny wynik! Znasz znaki bardzo dobrze!';
    if (percentage >= 60) return 'Dobra robota! Jeszcze troche nauki i bedziesz mistrzem!';
    if (percentage >= 40) return 'Nie poddawaj sie! Wroc do kursu i sprobuj ponownie!';
    return 'Czas na nauke! Przejrzyj kurs i wroc do quizu!';
  }
}
