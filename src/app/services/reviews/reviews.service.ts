import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review';

@Injectable({
  providedIn: 'root',
})

export class ReviewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://appscript-cors-proxy.misael-delamorena.workers.dev/';

  list(): Observable<Review[]> {
    console.log('🔍 Iniciando petición al API...');
    return this.http.get<Review[]>(this.baseUrl);
  }

  create(payload: Omit<Review, 'id' | 'date'>): Observable<any> {
    console.log('✏️ Creando reseña:', payload);
    return this.http.post<any>(this.baseUrl, payload);
  }

  delete(id: string): Observable<any> {
    console.log('🗑️ Eliminando reseña:', id);
    return this.http.delete<any>(this.baseUrl, { body: { id } });
  }

  update(payload: Omit<Review, 'date'>): Observable<any> {
    console.log('✏️ Actualizando reseña:', payload);
    return this.http.put<any>(this.baseUrl, payload);
  }
}
