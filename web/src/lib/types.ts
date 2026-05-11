export type User = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export type QuizAttemptSummary = {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
};

export type AnalyticsOverview = {
  total_subjects: number;
  total_materials: number;
  total_flashcards: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  average_quiz_score: number;
  best_quiz_score: number;
  latest_attempts: QuizAttemptSummary[];
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type SubjectsResponse = {
  subjects: Subject[];
};

export type CreateSubjectRequest = {
  name: string;
  description: string;
};

export type UpdateSubjectRequest = {
  name: string;
  description: string;
};