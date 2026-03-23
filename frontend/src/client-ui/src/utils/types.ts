// ─── Generic API Shapes ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "admin" | "staff";
  avatar?: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export interface AppointmentPayload {
  name: string;
  email: string;
  phone: string;
  date: string;       // ISO date string "YYYY-MM-DD"
  time?: string;
  department?: string;
  doctor?: string;
  message?: string;
}

export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  department?: string;
  doctor?: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  department: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  experience_years?: number;
  available?: boolean;
}

// ─── Departments ─────────────────────────────────────────────────────────────

export interface Department {
  id: number;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
}

// ─── Blog / News ──────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author?: string;
  category?: string;
  tags?: string[];
  published_at: string;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
}

// ─── Portfolio / Gallery ─────────────────────────────────────────────────────

export interface PortfolioItem {
  id: number;
  title: string;
  category?: string;
  image: string;
  description?: string;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: number;
  name: string;
  role?: string;
  avatar?: string;
  rating?: number;
  comment: string;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface PricingPlan {
  id: number;
  name: string;
  price: number;
  currency?: string;
  period?: string;
  features: string[];
  is_popular?: boolean;
}
