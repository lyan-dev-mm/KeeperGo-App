import { Timestamp } from 'firebase/firestore';

export type CommunityVisibility = 'public' | 'private';

export interface CommunityRule {
  title: string;
  description: string;
}

export interface CommunityCoverImage {
  url: string;
  publicId: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
}

export interface CommunityEntity {
  id: string;
  name: string;
  description: string;
  // Opcional: para dar continuidad al mock anterior (data/seed/communities.ts
  // traía "category") y dejar la puerta abierta a filtros futuros.
  category?: string;
  visibility: CommunityVisibility;
  coverImage: CommunityCoverImage | null;
  // Color de respaldo cuando no hay foto de portada.
  color: string;
  rules: CommunityRule[];
  createdBy: string;
  createdAt: Timestamp | null;
  memberCount: number;
}

// Datos que pide el formulario de "Crear comunidad"; el resto
// (id, createdAt, memberCount) lo llena el repositorio.
export interface CreateCommunityInput {
  name: string;
  description: string;
  category?: string;
  visibility: CommunityVisibility;
  color: string;
  coverImage: CommunityCoverImage | null;
  rules: CommunityRule[];
}