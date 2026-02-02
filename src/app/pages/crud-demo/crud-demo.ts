import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReviewsService } from '../../services/reviews/reviews.service';
import { Review } from '../../models/review';

@Component({
  selector: 'app-crud-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud-demo.html',
})

export class CrudDemo implements OnInit {
  private reviewsService = inject(ReviewsService);
  private fb = inject(FormBuilder);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal('');
  submitting = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(30)]],
    review: ['', [Validators.required, Validators.maxLength(240)]],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  constructor() {
    console.log('🎬 CrudDemo constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit ejecutado');
    this.loadReviews();
  }

  loadReviews(): void {
    console.log('📋 loadReviews() ejecutándose');
    this.loading.set(true);
    this.error.set('');
    
    this.reviewsService.list().subscribe({
      next: (data: any) => {
        console.log('✅ Datos recibidos:', data);
        const reviewsArray = Array.isArray(data) ? data : [data];
        this.reviews.set(reviewsArray);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error:', err);
        this.error.set('Error: ' + JSON.stringify(err));
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('❌ Formulario inválido');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const payload = {
      title: this.form.value.title || '',
      review: this.form.value.review || '',
      rating: Number(this.form.value.rating) || 5,
    };

    // Si está editando
    if (this.editingId()) {
      console.log('✏️ Modo edición - Actualizando reseña:', this.editingId());
      
      this.reviewsService.update({ ...payload, id: this.editingId()! }).subscribe({
        next: (response: any) => {
          console.log('✅ Reseña actualizada:', response);
          this.form.reset({ title: '', review: '', rating: 5 });
          this.editingId.set(null);
          this.submitting.set(false);
          this.error.set('');
          setTimeout(() => this.loadReviews(), 500);
        },
        error: (err: any) => {
          console.error('❌ Error al actualizar:', err);
          this.error.set('Error al actualizar: ' + (err?.message || 'Error desconocido'));
          this.submitting.set(false);
        },
      });
      return;
    }

    // Si está creando
    console.log('📤 Enviando payload:', payload);

    this.reviewsService.create(payload).subscribe({
      next: (response: any) => {
        console.log('✅ Reseña creada exitosamente:', response);
        this.form.reset({ title: '', review: '', rating: 5 });
        this.submitting.set(false);
        this.error.set('');
        setTimeout(() => this.loadReviews(), 500);
      },
      error: (err: any) => {
        console.error('❌ Error completo al crear:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error object:', JSON.stringify(err, null, 2));
        this.error.set('Error al crear: ' + (err?.message || err?.statusText || 'Error desconocido'));
        this.submitting.set(false);
      },
    });
  }

  onEdit(review: Review): void {
    console.log('✏️ Editando reseña:', review);
    this.editingId.set(review.id);
    this.form.patchValue({
      title: review.title,
      review: review.review,
      rating: Number(review.rating),
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    console.log('❌ Cancelando edición');
    this.editingId.set(null);
    this.form.reset({ title: '', review: '', rating: 5 });
  }

  onDelete(id: string, title: string): void {
    console.log('�🚨🚨 MÉTODO onDelete LLAMADO 🚨🚨🚨');
    console.log('�🔍 Intentando eliminar - ID:', id, 'Tipo:', typeof id, 'Título:', title);
    
    if (!confirm(`¿Seguro que quieres eliminar la reseña de "${title}"?`)) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }

    console.log('🗑️ Eliminando reseña con id:', id);
    this.error.set('');

    this.reviewsService.delete(id).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta completa del servidor:', JSON.stringify(response, null, 2));
        console.log('response.ok:', response.ok);
        console.log('response:', response);
        
        // Aceptar respuesta exitosa si tiene ok:true o cualquier respuesta sin error
        if (response.ok === true || response.ok === 'true' || !response.error) {
          console.log('✅ Reseña eliminada exitosamente');
          setTimeout(() => this.loadReviews(), 500);
        } else {
          console.error('⚠️ El servidor respondió con error:', response);
          this.error.set('No se pudo eliminar: ' + (response.error || JSON.stringify(response)));
        }
      },
      error: (err: any) => {
        console.error('❌ Error completo al eliminar:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        this.error.set('Error al eliminar la reseña: ' + (err?.message || 'Error desconocido'));
      },
    });
  }
}
