/** Catálogo dos 8 professores. Fonte única para rotas, menu lateral e API. */
export const TEACHER_IDS = [
  'architect',
  'vocabulary',
  'conversation',
  'listening',
  'speaking',
  'pronunciation',
  'thinking',
  'immersion',
] as const;

export type TeacherId = (typeof TEACHER_IDS)[number];

export interface TeacherMeta {
  id: TeacherId;
  order: number;
  name: string;
  shortName: string;
  /** Segmento da URL: /professor/:slug */
  slug: string;
  /** Nome do ícone em lucide-react */
  icon: string;
  /** Classe de cor Tailwind para destaque (texto/borda) */
  color: string;
  tagline: string;
}

export const TEACHERS: readonly TeacherMeta[] = [
  { id: 'architect', order: 1, name: 'Professor Arquiteto da Fluência', shortName: 'Arquiteto', slug: 'arquiteto', icon: 'Compass', color: 'violet', tagline: 'Seu plano de 90 dias' },
  { id: 'vocabulary', order: 2, name: 'Professor de Vocabulário de Alta Frequência', shortName: 'Vocabulário', slug: 'vocabulario', icon: 'BookOpen', color: 'sky', tagline: '300 palavras que mais importam' },
  { id: 'conversation', order: 3, name: 'Professor de Conversação Infinita', shortName: 'Conversação', slug: 'conversacao', icon: 'MessagesSquare', color: 'emerald', tagline: 'Fale o máximo possível' },
  { id: 'listening', order: 4, name: 'Treinador de Ouvido', shortName: 'Ouvido', slug: 'ouvido', icon: 'Ear', color: 'amber', tagline: 'Entenda a fala rápida' },
  { id: 'speaking', order: 5, name: 'Destruidor de Bloqueio na Fala', shortName: 'Fala Rápida', slug: 'fala', icon: 'Zap', color: 'rose', tagline: 'Responda em até 5 segundos' },
  { id: 'pronunciation', order: 6, name: 'Corretor de Pronúncia', shortName: 'Pronúncia', slug: 'pronuncia', icon: 'AudioLines', color: 'fuchsia', tagline: 'Seja entendido de primeira' },
  { id: 'thinking', order: 7, name: 'Tradutor que Impede de Traduzir', shortName: 'Pensamento Direto', slug: 'pensamento', icon: 'Brain', color: 'cyan', tagline: 'Pense direto no idioma' },
  { id: 'immersion', order: 8, name: 'Simulador de Imersão Total', shortName: 'Imersão', slug: 'imersao', icon: 'Globe', color: 'lime', tagline: 'Viva o idioma em casa' },
] as const;

export const teacherById = (id: TeacherId): TeacherMeta =>
  TEACHERS.find((t) => t.id === id)!;

export const teacherBySlug = (slug: string): TeacherMeta | undefined =>
  TEACHERS.find((t) => t.slug === slug);

export const isTeacherId = (v: string): v is TeacherId =>
  (TEACHER_IDS as readonly string[]).includes(v);
