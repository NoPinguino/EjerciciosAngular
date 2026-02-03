import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReviewPayload {
  title: string;
  review: string;
  rating: number;
}

export interface UpdateReviewPayload extends CreateReviewPayload {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://appscript-cors-proxy.misael-delamorena.workers.dev/';

  list(): Observable<any> {
    console.log('🔍 Iniciando petición al API...');
    return this.http.get<any>(this.baseUrl);
  }

  create(payload: CreateReviewPayload): Observable<any> {
    console.log('✏️ Creando reseña:', payload);

    return this.http.post<any>(this.baseUrl, payload);
  }

  delete(id: string): Observable<any> {
    console.log('🗑️ Eliminando reseña:', id);

    return this.http.delete<any>(this.baseUrl, { body: { id } });
  }

  update(payload: UpdateReviewPayload): Observable<any> {
    console.log('✏️ Actualizando reseña:', payload);

    return this.http.put<any>(this.baseUrl, payload);
  }
}
