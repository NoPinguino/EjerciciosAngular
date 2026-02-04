import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('formulario') formulario!: ElementRef;

  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal('');
  submitting = signal(false);
  editingId = signal<string | null>(null);
  selectedImage = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(30)]],
    review: ['', [Validators.required, Validators.maxLength(240)]],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    image: [''],
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
      image: this.selectedImage() || '',
    };

    // Si está editando
    if (this.editingId()) {
      console.log('✏️ Modo edición - Actualizando reseña:', this.editingId());
      
      this.reviewsService.update({ ...payload, id: this.editingId()! }).subscribe({
        next: (response: any) => {
          console.log('✅ Reseña actualizada:', response);
          this.form.reset({ title: '', review: '', rating: 5, image: '' });
          this.selectedImage.set(null);
          this.editingId.set(null);
          this.submitting.set(false);
          this.error.set('');
          // Limpiar input file
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
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
        this.form.reset({ title: '', review: '', rating: 5, image: '' });
        this.selectedImage.set(null);
        this.submitting.set(false);
        this.error.set('');
        // Limpiar input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede exceder 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Comprimir la imagen usando canvas
      this.compressImage(base64);
    };
    reader.readAsDataURL(file);
  }

  private compressImage(base64: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Tamaño máximo más pequeño para reducir el tamaño del archivo
      const maxWidth = 300;
      const maxHeight = 300;
      let width = img.width;
      let height = img.height;

      // Calcular nuevas dimensiones
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a base64 comprimido con menor calidad
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
      this.selectedImage.set(compressedBase64);
      console.log('✅ Imagen comprimida y cargada');
    };
    img.src = base64;
  }

  onEdit(review: Review): void {
    console.log('✏️ Editando reseña:', review);
    // PASO 1: Guardar el ID de la review que se está editando
    this.editingId.set(review.id);
    // PASO 2: Guardar la imagen actual en el signal
    this.selectedImage.set(review.image || null);
    // PASO 3: Cargar los datos en el formulario
    this.form.patchValue({
      title: review.title,
      review: review.review,
      rating: Number(review.rating),
      image: review.image || '',
    });
    // Scroll al formulario de forma suave
    setTimeout(() => {
      this.formulario?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  cancelEdit(): void {
    console.log('❌ Cancelando edición');
    this.editingId.set(null);
    this.selectedImage.set(null);
    this.form.reset({ title: '', review: '', rating: 5, image: '' });
  }

  onDelete(id: string, title: string): void {
    console.log('🚨🚨 MÉTODO onDelete LLAMADO 🚨🚨');
    console.log('🔍 Intentando eliminar - ID:', id, 'Tipo:', typeof id, 'Título:', title);
    
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
