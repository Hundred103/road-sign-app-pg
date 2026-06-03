import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  answers: { text: string; correct: boolean; imageUrl?: string | null }[];
}

export interface QuizDefinition {
  id: number;
  code: string;
  title: string;
  description: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'DEMO' | string;
  defaultQuiz: boolean;
  questionCount: number;
  imageUrl?: string | null;
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

  getAllSigns(): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(this.apiUrl).pipe(
      catchError(() => this.getSignsFromJson())
    );
  }

  getSignsFromJson(): Observable<RoadSign[]> {
    return this.http.get<{ signs: RoadSign[] }>('/assets/data/road-signs.json').pipe(
      map((data: { signs: RoadSign[] }) => data.signs),
      catchError(() => of([]))
    );
  }

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

  getRankingForQuiz(quizId: number, limit?: number): Observable<{ top: any[] }> {
    let url = `${environment.apiUrl}/users/rankings/${quizId}`;
    if (limit != null) url += `?limit=${limit}`;
    return this.http.get<{ top: any[] }>(url, { withCredentials: true }).pipe(
      catchError(() => of({ top: [] }))
    );
  }

  saveRanking(quizId: number, score: number, maxScore: number, userId?: number): Observable<{ saved: boolean; reason?: string }> {
    const payload = { quizId, score, maxScore };
    let url = `${environment.apiUrl}/users/rankings`;
    const headerObj: { [key: string]: string } = {};
    
    // Add user ID to both header and query param if provided
    if (userId != null) {
      headerObj['X-User-ID'] = userId.toString();
      url += `?userId=${userId}`;
      console.log('[DEBUG] saveRanking - sending userId:', userId);
    } else {
      console.log('[DEBUG] saveRanking - no userId provided, relying on session cookie');
    }
    
    const headers = new HttpHeaders(headerObj);
    
    return this.http.post<{ saved: boolean; reason?: string }>(
      url, 
      payload, 
      { withCredentials: true, headers }
    ).pipe(
          tap((response: { saved: boolean; reason?: string }) => console.log('[DEBUG] saveRanking response:', response)),
          catchError((err: unknown) => {
        console.error('[DEBUG] saveRanking error:', err);
        return of({ saved: false, reason: 'Błąd sieci' });
      })
    );
  }

  getQuizQuestionsForQuiz(quizId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${environment.apiUrl}/quiz/quizzes/${quizId}/questions`);
  }

  getQuizQuestionsFromJson(): Observable<QuizQuestion[]> {
    return this.http.get<{ questions?: QuizQuestion[]; quizzes?: Array<{ questions?: QuizQuestion[] }> }>('/assets/data/quiz-questions.json').pipe(
      map((data: { questions?: QuizQuestion[]; quizzes?: Array<{ questions?: QuizQuestion[] }> }) => {
        if (Array.isArray(data.questions)) {
          return data.questions;
        }

        if (Array.isArray(data.quizzes)) {
          return data.quizzes.flatMap((quiz: { questions?: QuizQuestion[] }) => Array.isArray(quiz.questions) ? quiz.questions : []);
        }

        return [];
      }),
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

  /**
   * Returns a URL that the client can use to fetch the sign image via the backend.
   * Prefer using this in templates to ensure images are served from a reachable origin.
   */
  getSignImageUrl(sign: { id: number; imageUrl?: string | null }): string {
    return `${environment.apiUrl}/signs/${sign.id}/image`;
  }

  /**
   * Returns a proxy URL for arbitrary asset paths (like assets/signs/...).
   * Example: getProxyForAssetPath('assets/signs/prohibition/b1.png')
   */
  getProxyForAssetPath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // If the path looks percent-encoded and contains an already-proxied path, decode and return it
    try {
      const decoded = decodeURIComponent(path);
      if (decoded.startsWith('/api/signs/assets-proxy') || decoded.startsWith('api/signs/assets-proxy') || decoded.startsWith('/api/')) {
        return decoded.startsWith('/') ? decoded : '/' + decoded;
      }
    } catch (e) {
      // ignore decode errors and continue
    }

    // If already a proxied API path, return as-is to avoid double-wrapping
    if (path.startsWith('/api/signs/assets-proxy') || path.startsWith('api/signs/assets-proxy') || path.startsWith('/api/')) {
      return path;
    }

    const cleaned = path.startsWith('/') ? path.substring(1) : path;
    // Encode each segment but keep slashes so gateway paths remain readable
    const encoded = cleaned.split('/').map(encodeURIComponent).join('/');
    return `${environment.apiUrl}/signs/assets-proxy/${encoded}`;
  }
}
