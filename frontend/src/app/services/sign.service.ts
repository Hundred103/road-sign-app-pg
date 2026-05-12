import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface RoadSign {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  kidFriendlyDescription: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  imageUrl?: string;
  answers: { text: string; correct: boolean }[];
}

export interface QuizDefinition {
  id: number;
  code: string;
  title: string;
  description: string | null;
  defaultQuiz: boolean;
  questionCount: number;
  bestScore?: number | null;
  bestMax?: number | null;
  bestPercentage?: number | null;
  bestAchievedAt?: string | null;
}

export interface TileViewStatus {
  signId: number;
  lastViewedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignService {
  private apiUrl = `${environment.apiUrl}/signs`;

  constructor(private http: HttpClient) {}

  /**
   * Get all road signs - tries API first, falls back to local JSON
   */
  getAllSigns(): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(this.apiUrl).pipe(
      catchError(() => this.getSignsFromJson())
    );
  }

  /**
   * Load signs from local JSON file (assets/data/road-signs.json)
   */
  getSignsFromJson(): Observable<RoadSign[]> {
    return this.http.get<{ signs: RoadSign[] }>('/assets/data/road-signs.json').pipe(
      map((data: { signs: RoadSign[] }) => data.signs),
      catchError(() => of([]))
    );
  }

  /**
   * Get quiz questions - tries API first, falls back to local JSON
   */
  getQuizQuestions(): Observable<QuizQuestion[]> {
    const apiUrl = `${environment.apiUrl}/quiz`;
    return this.http.get<QuizQuestion[]>(apiUrl).pipe(
      catchError(() => this.getQuizQuestionsFromJson())
    );
  }

  getQuizzes(): Observable<QuizDefinition[]> {
    return this.http.get<QuizDefinition[]>(`${environment.apiUrl}/quiz/quizzes`);
  }

  getBestResultForQuiz(quizId: number, userId?: number): Observable<{ bestScore: number; maxScore: number; percentage: number; achievedAt: string } | null> {
    let url = `${environment.apiUrl}/quiz/quizzes/${quizId}/best`;
    if (userId != null) url += `?userId=${userId}`;
    return this.http.get<{ bestScore: number; maxScore: number; percentage: number; achievedAt: string }>(
      url, { withCredentials: true }
    ).pipe(
      catchError(() => of(null))
    );
  }

  submitQuizResult(quizId: number, score: number, maxScore: number, userId?: number): Observable<any> {
    const payload = { score, maxScore };
    let url = `${environment.apiUrl}/quiz/quizzes/${quizId}/results`;
    if (userId != null) url += `?userId=${userId}`;
    return this.http.post(url, payload, { withCredentials: true });
  }

  getQuizQuestionsForQuiz(quizId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${environment.apiUrl}/quiz/quizzes/${quizId}/questions`);
  }

  /**
   * Load quiz questions from local JSON file (assets/data/quiz-questions.json)
   */
  getQuizQuestionsFromJson(): Observable<QuizQuestion[]> {
    return this.http.get<{ questions: QuizQuestion[] }>('/assets/data/quiz-questions.json').pipe(
      map((data: { questions: QuizQuestion[] }) => data.questions),
      catchError(() => of([]))
    );
  }

  getSignById(id: number): Observable<RoadSign> {
    return this.http.get<RoadSign>(`${this.apiUrl}/${id}`);
  }

  getSignsByCategory(category: string): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(`${this.apiUrl}/category/${category}`);
  }

  getTileViews(userId: number): Observable<TileViewStatus[]> {
    return this.http.get<TileViewStatus[]>(`${this.apiUrl}/views?userId=${userId}`);
  }

  markTileViewed(signId: number, userId: number): Observable<TileViewStatus> {
    return this.http.post<TileViewStatus>(`${this.apiUrl}/${signId}/views?userId=${userId}`, {});
  }
}
