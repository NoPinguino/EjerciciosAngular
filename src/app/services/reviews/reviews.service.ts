import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review';

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
  private readonly baseUrl = 'https://script.google.com/macros/s/AKfycbyvuBACHttpWBdDfTN3xFoYKutTwUHOgSpHCQxr5vygpxhLIo7jzU9Kw3pZv8JZr9vH/exec';

  list(): Observable<any> {
    console.log('🔍 Iniciando petición al API...');
    return this.http.get<any>(this.baseUrl);
  }

  create(payload: CreateReviewPayload): Observable<any> {
    console.log('✏️ Creando reseña:', payload);
    
    const params = new HttpParams()
      .set('action', 'create')
      .set('title', payload.title)
      .set('review', payload.review)
      .set('rating', payload.rating.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }

  delete(id: string): Observable<any> {
    console.log('🗑️ Eliminando reseña:', id);
    
    const params = new HttpParams()
      .set('action', 'delete')
      .set('id', id);

    return this.http.get<any>(this.baseUrl, { params });
  }

  update(payload: UpdateReviewPayload): Observable<any> {
    console.log('✏️ Actualizando reseña:', payload);
    
    const params = new HttpParams()
      .set('action', 'update')
      .set('id', payload.id)
      .set('title', payload.title)
      .set('review', payload.review)
      .set('rating', payload.rating.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }
}
