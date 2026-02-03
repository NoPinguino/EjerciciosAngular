export interface Review {
    id: string;
    title: string;
    review: string;
    rating: number | string;
    image?: string; // Base64 de la imagen
    date: string;
}