import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignService, QuizDefinition, QuizQuestion } from '../../services/sign.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  private signService = inject(SignService);
  private authService = inject(AuthService);

  private currentUserId: number | null = null;

  quizzes: QuizDefinition[] = [];
  selectedQuiz: QuizDefinition | null = null;
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswerIndex: number | null = null;
  showResult = false;
  isCorrect = false;
  score = 0;
  quizStarted = false;
  quizFinished = false;
  isLoading = true;
  isLoadingQuizzes = true;

  ngOnInit() {
    this.authService.currentUser$.subscribe((u: AuthUser | null) => {
      const prev = this.currentUserId;
      this.currentUserId = u?.id ?? null;
      if (u && prev !== this.currentUserId) {
        // user just logged in - refresh quiz best scores
        this.loadQuizzes();
      }
    });
    this.loadQuizzes();
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get selectedQuizTitle(): string {
    return this.selectedQuiz?.title ?? 'Quiz o znakach drogowych';
  }

  /**
   * Load quizzes from the quiz API, then fetch questions for the default quiz.
   */
  loadQuizzes() {
    this.isLoading = true;
    this.isLoadingQuizzes = true;

    this.signService.getQuizzes().subscribe({
      next: (quizzes: QuizDefinition[]) => {
        this.quizzes = quizzes;
        this.selectedQuiz = quizzes.find((quiz) => quiz.defaultQuiz) ?? quizzes[0] ?? null;
        this.isLoadingQuizzes = false;
        // fetch user's best result for each quiz (prefer session; if session not forwarded, include userId)
        for (const q of this.quizzes) {
          this.signService.getBestResultForQuiz(q.id, this.currentUserId ?? undefined).subscribe((res) => {
            if (res) {
              q.bestScore = res.bestScore;
              q.bestMax = res.maxScore;
              q.bestPercentage = res.percentage;
              q.bestAchievedAt = res.achievedAt;
            }
          });
        }

        if (this.selectedQuiz) {
          this.loadQuestionsForQuiz(this.selectedQuiz.id);
        } else {
          this.questions = [];
          this.isLoading = false;
        }
      },
      error: () => {
        this.quizzes = [];
        this.selectedQuiz = null;
        this.isLoadingQuizzes = false;
        this.isLoading = false;
      }
    });
  }

  selectQuiz(quiz: QuizDefinition) {
    if (this.selectedQuiz?.id === quiz.id) {
      return;
    }

    this.selectedQuiz = quiz;
    this.loadQuestionsForQuiz(quiz.id);
  }

  private loadQuestionsForQuiz(quizId: number) {
    this.isLoading = true;
    this.quizStarted = false;
    this.quizFinished = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswerIndex = null;
    this.showResult = false;
    this.score = 0;

    this.signService.getQuizQuestionsForQuiz(quizId).subscribe({
      next: (questions: QuizQuestion[]) => {
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
    if (!this.selectedQuiz || this.questions.length === 0) {
      return;
    }

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
      // submit result to backend (will update best if higher)
        if (this.selectedQuiz) {
        this.signService.submitQuizResult(this.selectedQuiz.id, this.score, this.questions.length, this.currentUserId ?? undefined).subscribe({
          next: () => {
            // refresh best for this quiz
            this.signService.getBestResultForQuiz(this.selectedQuiz!.id, this.currentUserId ?? undefined).subscribe((res) => {
              if (res) {
                this.selectedQuiz!.bestScore = res.bestScore;
                this.selectedQuiz!.bestMax = res.maxScore;
                this.selectedQuiz!.bestPercentage = res.percentage;
                this.selectedQuiz!.bestAchievedAt = res.achievedAt;
              }
            });
          }
        });
      }
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
