import { EntitySchema, type ObjectLiteral } from 'typeorm';

/* ---------- Tipos ---------- */
export interface User { id: string; email: string; name: string; passwordHash: string; createdAt: Date; lastLoginAt: Date | null }
export interface Setting { key: string; value: string | null }
export interface Course {
  id: string; slug: string; title: string; shortDescription: string; description: string | null;
  status: 'soon' | 'open' | 'done'; focus: string | null; dateLabel: string | null;
  modality: string | null; venue: string | null; language: string | null; certificate: string | null;
  imageUrl: string | null; duration: string | null; level: string | null; price: number; currency: string;
  objectives: string | null; audience: string | null; program: string | null; trainerIds: string[] | null;
  gallery: string | null; area: string | null; faq: string | null;
  content: Partial<import('./course-content').CourseContent> | null;
  featured: boolean; published: boolean; position: number; createdAt: Date;
}
export interface HeroSlide {
  id: string; title: string; description: string | null; imageUrl: string;
  link: string | null; buttonText: string | null; published: boolean; position: number;
}
export interface Testimonial {
  id: string; quote: string; name: string; role: string | null; company: string | null;
  photoUrl: string | null; published: boolean; position: number;
}
export interface CourseSession {
  id: string; courseId: string; course?: Course; startDate: string; endDate: string;
  location: string | null; seats: number; published: boolean;
}
export interface Trainer { id: string; name: string; role: string; bio: string | null; photoUrl: string | null; position: number }
export interface Highlight { id: string; value: string; label: string; icon: string; position: number }
export interface WhyItem { id: string; title: string; text: string; icon: string; position: number }
export interface Partner { id: string; name: string; logoUrl: string | null; position: number }
export interface PaymentMethod {
  id: string; name: string; type: 'express' | 'reference' | 'transfer' | 'cash';
  instructions: string | null; details: string | null; enabled: boolean; position: number;
}
export type EnrollmentStatus = 'pending' | 'paid' | 'cancelled';
export interface Enrollment {
  id: string; reference: string; courseId: string | null; sessionId: string | null; paymentMethodId: string | null;
  courseTitle: string; sessionLabel: string; paymentMethodName: string;
  fullName: string; email: string; phone: string; company: string | null; isCompany: boolean; taxId: string | null; participants: number;
  amount: number; currency: string; status: EnrollmentStatus; paymentRef: string | null; paymentUrl: string | null;
  paymentDetails: PaymentDetails | null;
  createdAt: Date; paymentMethod?: PaymentMethod;
}
/** Dados devolvidos pelo gateway (AppyPay): id da cobrança e, no pagamento por referência, entidade/referência. */
export interface PaymentDetails {
  provider: 'appypay';
  chargeId: string;
  entity?: string;
  referenceNumber?: string;
  dueDate?: string;
}
export interface ContactMessage {
  id: string; name: string; email: string; phone: string | null; subject: string | null;
  message: string; read: boolean; createdAt: Date;
}

/* ---------- Helpers de colunas ---------- */
const id = { type: 'uuid', primary: true, generated: 'uuid' } as const;
const createdAt = { type: 'timestamptz', createDate: true } as const;
const str = (length = 255, nullable = false) => ({ type: 'varchar', length, nullable }) as const;
const text = (nullable = true) => ({ type: 'text', nullable }) as const;
const int = (def = 0) => ({ type: 'int', default: def }) as const;
const bool = (def = false) => ({ type: 'boolean', default: def }) as const;
const money = {
  type: 'numeric', precision: 14, scale: 2, default: 0,
  transformer: { to: (v: number | null) => v, from: (v: string | null) => (v == null ? 0 : Number(v)) },
} as const;

/* ---------- Esquemas (EntitySchema evita problemas de decorators no bundler do Next) ---------- */
export const UserEntity = new EntitySchema<ObjectLiteral>({
  name: 'User', tableName: 'users',
  columns: { id, email: { ...str(200), unique: true }, name: str(160), passwordHash: str(200), createdAt, lastLoginAt: { type: 'timestamptz', nullable: true } },
});

export const SettingEntity = new EntitySchema<ObjectLiteral>({
  name: 'Setting', tableName: 'settings',
  columns: { key: { type: 'varchar', length: 120, primary: true }, value: text() },
});

export const CourseEntity = new EntitySchema<ObjectLiteral>({
  name: 'Course', tableName: 'courses',
  columns: {
    id, slug: { ...str(200), unique: true }, title: str(200), shortDescription: text(false),
    description: text(),
    status: { type: 'varchar', length: 10, default: 'soon' },
    focus: text(), dateLabel: str(120, true), modality: str(80, true), venue: str(200, true),
    language: str(60, true), certificate: str(120, true),
    trainerIds: { type: 'simple-array', nullable: true },
    imageUrl: str(500, true), duration: str(120, true), level: str(60, true),
    price: money, currency: { type: 'varchar', length: 8, default: 'AOA' },
    objectives: text(), audience: text(), program: text(), gallery: text(),
    area: str(120, true), faq: text(),
    content: { type: 'jsonb', nullable: true },
    featured: bool(), published: bool(true), position: int(), createdAt,
  },
});

export const CourseSessionEntity = new EntitySchema<ObjectLiteral>({
  name: 'CourseSession', tableName: 'course_sessions',
  columns: {
    id, courseId: { type: 'uuid', name: 'course_id' },
    startDate: { type: 'date' }, endDate: { type: 'date' },
    location: str(200, true), seats: int(20), published: bool(true),
  },
  relations: {
    course: { type: 'many-to-one', target: 'Course', joinColumn: { name: 'course_id' }, onDelete: 'CASCADE' },
  },
});

export const TrainerEntity = new EntitySchema<ObjectLiteral>({
  name: 'Trainer', tableName: 'trainers',
  columns: { id, name: str(160), role: str(200), bio: text(), photoUrl: str(500, true), position: int() },
});

export const HighlightEntity = new EntitySchema<ObjectLiteral>({
  name: 'Highlight', tableName: 'highlights',
  columns: { id, value: str(60), label: str(120), icon: { type: 'varchar', length: 40, default: 'users' }, position: int() },
});

export const WhyItemEntity = new EntitySchema<ObjectLiteral>({
  name: 'WhyItem', tableName: 'why_items',
  columns: { id, title: str(160), text: text(false), icon: { type: 'varchar', length: 40, default: 'hands' }, position: int() },
});

export const PartnerEntity = new EntitySchema<ObjectLiteral>({
  name: 'Partner', tableName: 'partners',
  columns: { id, name: str(120), logoUrl: str(500, true), position: int() },
});

export const PaymentMethodEntity = new EntitySchema<ObjectLiteral>({
  name: 'PaymentMethod', tableName: 'payment_methods',
  columns: {
    id, name: str(160), type: { type: 'varchar', length: 20, default: 'transfer' },
    instructions: text(), details: text(), enabled: bool(true), position: int(),
  },
});

export const EnrollmentEntity = new EntitySchema<ObjectLiteral>({
  name: 'Enrollment', tableName: 'enrollments',
  columns: {
    id, reference: { ...str(30), unique: true },
    courseId: { type: 'uuid', name: 'course_id', nullable: true },
    sessionId: { type: 'uuid', name: 'session_id', nullable: true },
    paymentMethodId: { type: 'uuid', name: 'payment_method_id', nullable: true },
    courseTitle: str(200), sessionLabel: str(200), paymentMethodName: str(160),
    fullName: str(160), email: str(200), phone: str(40), company: str(200, true),
    isCompany: { ...bool(), name: 'is_company' }, taxId: { ...str(40, true), name: 'tax_id' },
    participants: int(1), amount: money, currency: { type: 'varchar', length: 8, default: 'AOA' },
    status: { type: 'varchar', length: 20, default: 'pending' },
    paymentRef: str(200, true), paymentUrl: str(600, true),
    paymentDetails: { type: 'jsonb', name: 'payment_details', nullable: true },
    createdAt,
  },
  relations: {
    course: { type: 'many-to-one', target: 'Course', joinColumn: { name: 'course_id' }, onDelete: 'SET NULL', nullable: true },
    session: { type: 'many-to-one', target: 'CourseSession', joinColumn: { name: 'session_id' }, onDelete: 'SET NULL', nullable: true },
    paymentMethod: { type: 'many-to-one', target: 'PaymentMethod', joinColumn: { name: 'payment_method_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

export const ContactMessageEntity = new EntitySchema<ObjectLiteral>({
  name: 'ContactMessage', tableName: 'contact_messages',
  columns: {
    id, name: str(160), email: str(200), phone: str(40, true), subject: str(200, true),
    message: text(false), read: bool(), createdAt,
  },
});

export const HeroSlideEntity = new EntitySchema<ObjectLiteral>({
  name: 'HeroSlide', tableName: 'hero_slides',
  columns: {
    id, title: str(200), description: text(), imageUrl: str(500), link: str(500, true),
    buttonText: str(80, true), published: bool(true), position: int(),
  },
});

export const TestimonialEntity = new EntitySchema<ObjectLiteral>({
  name: 'Testimonial', tableName: 'testimonials',
  columns: {
    id, quote: text(false), name: str(160), role: str(160, true), company: str(160, true),
    photoUrl: str(500, true), published: bool(true), position: int(),
  },
});

export const entities = [
  UserEntity, SettingEntity, CourseEntity, CourseSessionEntity, TrainerEntity, HighlightEntity,
  WhyItemEntity, PartnerEntity, PaymentMethodEntity, EnrollmentEntity, ContactMessageEntity,
  HeroSlideEntity, TestimonialEntity,
];
