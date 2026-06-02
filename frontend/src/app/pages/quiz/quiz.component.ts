import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { SignService, QuizDefinition, QuizQuestion } from '../../services/sign.service';
import { AuthService, AuthUser } from '../../services/auth.service';

type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DEMO';

interface QuizGroup {
  difficulty: QuizDifficulty;
  label: string;
  quizzes: QuizDefinition[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  private signService = inject(SignService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  currentUserId: number | null = null;
  rankingVisible = false;
  rankingList: any[] = [];
  rankingSaved: boolean | null = null;
  rankingSaveReason: string | null = null;

  quizzes: QuizDefinition[] = [];
  quizGroups: QuizGroup[] = [];
  selectedQuiz: QuizDefinition | null = null;
  // cache questions per quiz id to avoid reloading when picking quizzes
  private quizQuestionsCache: Record<number, QuizQuestion[]> = {};
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

  private readonly difficultyOrder: QuizDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'DEMO'];
  private readonly difficultyLabels: Record<QuizDifficulty, string> = {
    EASY: 'Łatwe',
    MEDIUM: 'Średnie',
    HARD: 'Trudne',
    DEMO: 'Demo'
  };

  ngOnInit() {
    this.authService.currentUser$.subscribe((u: AuthUser | null) => {
      const prev = this.currentUserId;
      this.currentUserId = u?.id ?? null;
      if (u && prev !== this.currentUserId) {
        // user just logged in - refresh quiz best scores
        this.loadQuizzes();
      }
    });

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      if (params.get('tab') === 'list') {
        this.exitQuiz();
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
        this.quizGroups = this.buildQuizGroups(quizzes);
        this.selectedQuiz = quizzes.find((quiz) => quiz.defaultQuiz) ?? quizzes[0] ?? null;
        this.isLoadingQuizzes = false;
        // fetch user's best result for each quiz (prefer session; if session not forwarded, include userId)
        for (const q of this.quizzes) {
          this.signService.getBestResultForQuiz(q.id, this.currentUserId ?? undefined).subscribe((res: { bestScore: number; maxScore: number; percentage: number; achievedAt: string } | null) => {
            if (res) {
              q.bestScore = res.bestScore;
              q.bestMax = res.maxScore;
              q.bestPercentage = res.percentage;
              q.bestAchievedAt = res.achievedAt;
            }
          });
        }

        // background-prefetch questions per quiz to avoid loader when selecting
        for (const q of this.quizzes) {
          this.signService.getQuizQuestionsForQuiz(q.id).subscribe({
            next: (questions: QuizQuestion[]) => {
              this.quizQuestionsCache[q.id] = questions;
              // if this was the initially-selected quiz and we don't have questions yet, set them
              if (this.selectedQuiz && this.selectedQuiz.id === q.id && (!this.questions || this.questions.length === 0)) {
                this.questions = this.shuffleArray(questions);
                this.isLoading = false;
              }
            },
            error: () => {
              // ignore - keep cache empty for this quiz
            }
          });
        }

        if (this.selectedQuiz) {
          // preload questions from local JSON to make quiz selection instant
          this.signService.getQuizQuestionsFromJson().subscribe((allQuestions: QuizQuestion[]) => {
            // Try to index by quizId if that property exists in items
            try {
              const byQuiz: Record<number, QuizQuestion[]> = {};
              for (const q of (allQuestions as any)) {
                const quizId = (q as any).quizId ?? (q as any).quiz ?? null;
                if (quizId != null) {
                  byQuiz[quizId] = byQuiz[quizId] ?? [];
                  byQuiz[quizId].push(q);
                }
              }
              if (Object.keys(byQuiz).length > 0) {
                this.quizQuestionsCache = byQuiz;
              }
            } catch (e) {
              // ignore
            }

            if (this.selectedQuiz && this.quizQuestionsCache[this.selectedQuiz.id]) {
              this.questions = this.shuffleArray(this.quizQuestionsCache[this.selectedQuiz.id]);
              this.isLoading = false;
            } else if (this.selectedQuiz) {
              this.loadQuestionsForQuiz(this.selectedQuiz.id);
            }
          }, () => {
            if (this.selectedQuiz) this.loadQuestionsForQuiz(this.selectedQuiz.id);
          });
        } else {
          this.questions = [];
          this.isLoading = false;
        }
      },
      error: () => {
        this.quizzes = [];
        this.quizGroups = [];
        this.selectedQuiz = null;
        this.isLoadingQuizzes = false;
        this.isLoading = false;
      }
    });
  }

  getQuizImageUrl(quiz: QuizDefinition): string | null {
    return quiz.imageUrl && quiz.imageUrl !== 'null' ? quiz.imageUrl : null;
  }

  selectQuiz(quiz: QuizDefinition) {
    if (this.selectedQuiz?.id === quiz.id) {
      return;
    }

    const scrollTop = window.scrollY;
    this.selectedQuiz = quiz;
    this.rankingVisible = false;

    // If we have cached questions for this quiz, use them immediately to avoid showing loader
    const cached = this.quizQuestionsCache[quiz.id];
    if (cached && cached.length > 0) {
      this.questions = this.shuffleArray(cached);
      this.isLoading = false;
      // restore the scroll position in case selection changed layout
      window.setTimeout(() => window.scrollTo({ top: scrollTop, behavior: 'auto' }), 0);
    } else {
      this.loadQuestionsForQuiz(quiz.id, scrollTop);
    }
  }

  private loadQuestionsForQuiz(quizId: number, restoreScrollTop = 0) {
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
        window.setTimeout(() => window.scrollTo({ top: restoreScrollTop, behavior: 'auto' }), 0);
      },
      error: () => {
        this.questions = [];
        this.isLoading = false;
        window.setTimeout(() => window.scrollTo({ top: restoreScrollTop, behavior: 'auto' }), 0);
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
      this.rankingVisible = true;
      // submit result to backend (will update best if higher)
        if (this.selectedQuiz) {
        this.signService.submitQuizResult(this.selectedQuiz.id, this.score, this.questions.length, this.currentUserId ?? undefined).subscribe({
          next: () => {
            // refresh best for this quiz
            this.signService.getBestResultForQuiz(this.selectedQuiz!.id, this.currentUserId ?? undefined).subscribe((res: { bestScore: number; maxScore: number; percentage: number; achievedAt: string } | null) => {
              if (res) {
                this.selectedQuiz!.bestScore = res.bestScore;
                this.selectedQuiz!.bestMax = res.maxScore;
                this.selectedQuiz!.bestPercentage = res.percentage;
                this.selectedQuiz!.bestAchievedAt = res.achievedAt;
              }
            });
            // try to save ranking (user-service)
            this.signService.saveRanking(this.selectedQuiz!.id, this.score, this.questions.length, this.currentUserId ?? undefined).subscribe((r: { saved: boolean; reason?: string }) => {
              this.rankingSaved = !!r?.saved;
              this.rankingSaveReason = r?.reason ?? 'Błąd przy zapisie wyniku';
              // refresh ranking to show latest result
              this.signService.getRankingForQuiz(this.selectedQuiz!.id, 10).subscribe((res: { top: any[] }) => {
                this.rankingList = res.top ?? [];
              });
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

  toggleRanking() {
    this.rankingVisible = !this.rankingVisible;
    if (this.rankingVisible && this.selectedQuiz) {
      this.signService.getRankingForQuiz(this.selectedQuiz.id, 10).subscribe((res: { top: any[] }) => {
        this.rankingList = res.top ?? [];
      });
    }
  }

  restartQuiz() {
    this.rankingVisible = false;
    this.startQuiz();
  }

  exitQuiz() {
    this.quizStarted = false;
    this.quizFinished = false;
    this.rankingVisible = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswerIndex = null;
    this.showResult = false;
    this.score = 0;
  }

  getLetterForIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getScoreMessage(): string {
    const percentage = (this.score / this.questions.length) * 100;

    if (percentage === 100) return 'Perfekcyjnie! Jesteś ekspertem od znaków drogowych!';
    if (percentage >= 80) return 'Świetny wynik! Znasz znaki bardzo dobrze!';
    if (percentage >= 60) return 'Dobra robota! Jeszcze trochę nauki i będziesz mistrzem!';
    if (percentage >= 40) return 'Nie poddawaj się! Wróć do kursu i spróbuj ponownie!';
    return 'Czas na naukę! Przejrzyj kurs i wróć do quizu!';
  }

  private buildQuizGroups(quizzes: QuizDefinition[]): QuizGroup[] {
    return this.difficultyOrder
      .map((difficulty) => ({
        difficulty,
        label: this.difficultyLabels[difficulty],
        quizzes: quizzes.filter((quiz) => (quiz.difficulty ?? '').toUpperCase() === difficulty)
      }))
      .filter((group) => group.quizzes.length > 0);
  }
}
