export type UserRole = 'cliente' | 'trainer' | 'admin';

export type AuthScreenMode =
  | 'onboarding_1'
  | 'onboarding_2'
  | 'onboarding_3'
  | 'welcome'
  | 'role_select'
  | 'login'
  | 'register';

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Pernas'
  | 'Abdómen';

export type PaymentStatus = 'Pago' | 'Pendente' | 'Em atraso';
export type PaymentMethod =
  | 'Multicaixa Express'
  | 'Referência Multicaixa'
  | 'Transferência Bancária'
  | 'Pagamento Presencial';

export type SessionStatus = 'Confirmada' | 'Pendente' | 'Concluída' | 'Cancelada';

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  birthDate?: string;
  gender?: string;
  authorized: boolean;
  status: 'Ativo' | 'Inativo';
  joinDate: string;
  // Client specific
  goal?: string;
  level?: 'Iniciante' | 'Intermédio' | 'Avançado';
  planId?: string;
  trainerId?: string;
  weeklyCompleted?: number;
  weeklyTarget?: number;
  streakDays?: number;
  // Trainer specific
  specialties?: string[];
  bio?: string;
  availabilitySlots?: string[];
  workingHours?: string;
  rating?: number;
  experienceYears?: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  image: string;
  sets: number;
  reps: string;
  restSeconds: number;
  recommendedWeightKg: number;
  instructions: string;
  dayLabel: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  goal: string;
  level: 'Iniciante' | 'Intermédio' | 'Avançado';
  trainingDays: string[];
  progressPercent: number;
  nextWorkoutName: string;
  trainerId: string;
  clientId?: string;
  needsReview?: boolean;
  exercises: ExerciseItem[];
}

export interface WorkoutSetLog {
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface EvolutionRecord {
  id: string;
  clientId: string;
  dateLabel: string;
  period: 'semanal' | 'mensal';
  bodyWeightKg: number;
  benchLoadKg: number;
  squatLoadKg: number;
  workoutsCount: number;
  chestCm: number;
  waistCm: number;
  armCm: number;
  thighCm: number;
}

export interface TrainingSession {
  id: string;
  clientId: string;
  trainerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: string;
  location: string;
  status: SessionStatus;
  notes?: string;
}

export interface GymPlan {
  id: string;
  name: string;
  priceKz: number;
  durationLabel: string;
  durationMonths: number;
  description: string;
  benefits: string[];
  active: boolean;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  planId: string;
  monthLabel: string;
  dueDate: string;
  paidDate?: string;
  amountKz: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  isDemoSimulation?: boolean;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  category: 'Conquista' | 'Treino' | 'Dica do Treinador' | 'Objetivo';
  content: string;
  image?: string;
  likes: string[];
  comments: CommunityComment[];
  createdAt: string;
  reported?: boolean;
  reportReason?: string;
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  unitLabel: string;
  currentProgress: number;
  participantsCount: number;
  endsAt: string;
  joined: boolean;
}

export interface AppNotification {
  id: string;
  role: UserRole;
  userId?: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  category: 'pagamento' | 'sessao' | 'treino' | 'comunidade' | 'sistema';
}

export interface GymSettings {
  gymName: string;
  slogan: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  iban: string;
  multicaixaEntity: string;
  allowCommunityPosts: boolean;
  autoConfirmSessions: boolean;
  notificationsEnabled: boolean;
}
