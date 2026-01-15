import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class SignService {
  private apiUrl = `${environment.apiUrl}/signs`;

  constructor(private http: HttpClient) {}

  getAllSigns(): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(this.apiUrl);
  }

  getSignById(id: number): Observable<RoadSign> {
    return this.http.get<RoadSign>(`${this.apiUrl}/${id}`);
  }

  getSignsByCategory(category: string): Observable<RoadSign[]> {
    return this.http.get<RoadSign[]>(`${this.apiUrl}/category/${category}`);
  }
}
