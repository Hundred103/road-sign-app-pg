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
      map(data => data.signs),
      catchError(() => of([]))
    );
  }

  /**
   * Get quiz questions - tries API first, falls back to local JSON
   */
  getQuizQuestions(): Observable<QuizQuestion[]> {
    const apiUrl = `${environment.apiUrl}/quiz-questions`;
    return this.http.get<QuizQuestion[]>(apiUrl).pipe(
      catchError(() => this.getQuizQuestionsFromJson())
    );
  }

  /**
   * Load quiz questions from local JSON file (assets/data/quiz-questions.json)
   */
  getQuizQuestionsFromJson(): Observable<QuizQuestion[]> {
    return this.http.get<{ questions: QuizQuestion[] }>('/assets/data/quiz-questions.json').pipe(
      map(data => data.questions),
      catchError(() => of([]))
    );
  }

  getSignById(id: number): Observable<RoadSign> {
    return this.http.get<RoadSign>(`${this.apiUrl}/${id}`);
  }

  getSignsByCategory(category: string): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(`${this.apiUrl}/category/${category}`);
  }
}
