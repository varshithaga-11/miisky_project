/**
 * utils/mockData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fallback/seed data for every section.
 * When real API endpoints are ready, replace component imports with API calls;
 * these mocks become the TypeScript-safe fallbacks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  Doctor,
  Department,
  BlogPost,
  Service,
  PortfolioItem,
  Testimonial,
  PricingPlan,
} from "./types";

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Catherine Denuve",
    specialty: "Optegra Eye",
    department: "Ophthalmology",
    image: "/website/assets/images/team/team-1.jpg",
    bio: "Specialist in eye care and vision correction with over 15 years of experience.",
    available: true,
  },
  {
    id: 2,
    name: "Jenny Wilson",
    specialty: "Lens Replacement",
    department: "Ophthalmology",
    image: "/website/assets/images/team/team-2.jpg",
    bio: "Expert in lens replacement surgery and post-operative care.",
    available: true,
  },
  {
    id: 3,
    name: "Guy Hawkins",
    specialty: "Cataract Surgery",
    department: "Ophthalmology",
    image: "/website/assets/images/team/team-3.jpg",
    bio: "Leading specialist in cataract removal and intraocular lens implants.",
    available: true,
  },
  {
    id: 4,
    name: "Dr. Robert Chase",
    specialty: "Cardiology",
    department: "Cardiology",
    image: "/website/assets/images/team/team-1.jpg",
    bio: "Interventional cardiologist with expertise in complex coronary procedures.",
    available: false,
  },
];

// ─── Departments / Services ───────────────────────────────────────────────────

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Cardiology",        icon: "icon-18", image: "/website/assets/images/service/service-1.jpg", description: "Cardiologists are healthcare professionals specializing in heart conditions." },
  { id: 2, name: "Dental",            icon: "icon-19", image: "/website/assets/images/service/service-2.jpg", description: "Dentists are healthcare professionals specializing in oral health." },
  { id: 3, name: "Gastroenterology",  icon: "icon-20", image: "/website/assets/images/service/service-3.jpg", description: "Gastroenterologists specialize in digestive system disorders." },
  { id: 4, name: "Ophthalmology",     icon: "icon-18", image: "/website/assets/images/service/service-1.jpg", description: "Eye care specialists focusing on vision and ocular health." },
  { id: 5, name: "Neurology",         icon: "icon-19", image: "/website/assets/images/service/service-2.jpg", description: "Neurologists treat disorders of the nervous system." },
  { id: 6, name: "Orthopedics",       icon: "icon-20", image: "/website/assets/images/service/service-3.jpg", description: "Orthopedic surgeons specialize in musculoskeletal conditions." },
];

// Department slugs for routing
export const DEPARTMENT_SLUGS: Record<number, string> = {
  1: "/department-details/1",
  2: "/department-details/2",
  3: "/department-details/3",
  4: "/department-details/4",
  5: "/department-details/5",
  6: "/department-details/6",
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  { id: 1, title: "Heart Health",       icon: "icon-18", image: "/website/assets/images/service/service-1.jpg", description: "Comprehensive heart health monitoring and treatment." },
  { id: 2, title: "Dental Care",        icon: "icon-19", image: "/website/assets/images/service/service-2.jpg", description: "Complete dental care from routine cleaning to orthodontics." },
  { id: 3, title: "Digestive Health",   icon: "icon-20", image: "/website/assets/images/service/service-3.jpg", description: "Diagnostic and therapeutic gastroenterology services." },
];

// ─── Blog / News ──────────────────────────────────────────────────────────────

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Prepare to Speak with Your Eye Specialist",
    slug: "prepare-to-speak-with-your-eye-specialist",
    excerpt: "To provide accessible and equitable healthcare for all individuals, regardless of their socioeconomic status.",
    image: "/website/assets/images/news/news-1.jpg",
    author: "Admin",
    category: "Eye Care",
    published_at: "2023-03-06",
  },
  {
    id: 2,
    title: "Empowering Patients through Medicine",
    slug: "empowering-patients-through-medicine",
    excerpt: "To provide accessible and equitable healthcare for all individuals, regardless of their socioeconomic status.",
    image: "/website/assets/images/news/news-2.jpg",
    author: "Admin",
    category: "General",
    published_at: "2023-03-05",
  },
  {
    id: 3,
    title: "From Diagnosis: The Role of Medical Research",
    slug: "from-diagnosis-role-of-medical-research",
    excerpt: "To provide accessible and equitable healthcare for all individuals, regardless of their socioeconomic status.",
    image: "/website/assets/images/news/news-3.jpg",
    author: "Admin",
    category: "Research",
    published_at: "2023-03-04",
  },
];

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  { id: 1, title: "Eye Surgery",         category: "Ophthalmology",     image: "/website/assets/images/gallery/gallery-1.jpg" },
  { id: 2, title: "Cardiology Unit",     category: "Cardiology",        image: "/website/assets/images/gallery/gallery-2.jpg" },
  { id: 3, title: "Dental Clinic",       category: "Dental",            image: "/website/assets/images/gallery/gallery-3.jpg" },
  { id: 4, title: "Lab Research",        category: "Research",          image: "/website/assets/images/gallery/gallery-4.jpg" },
  { id: 5, title: "Patient Recovery",    category: "General",           image: "/website/assets/images/gallery/gallery-5.jpg" },
  { id: 6, title: "Emergency Wing",      category: "Emergency",         image: "/website/assets/images/gallery/gallery-6.jpg" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Connor",
    role: "Patient",
    avatar: "/website/assets/images/resource/testimonial-1.jpg",
    rating: 5,
    comment: "The medical professionals were outstanding. Their expertise and compassion made all the difference in my recovery.",
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Patient",
    avatar: "/website/assets/images/resource/testimonial-2.jpg",
    rating: 5,
    comment: "Excellent care from start to finish. Booking was easy and the team was incredibly professional.",
  },
  {
    id: 1,
    name: "Emily Thompson",
    role: "Patient",
    avatar: "/website/assets/images/resource/testimonial-3.jpg",
    rating: 4,
    comment: "I would highly recommend this clinic to anyone looking for high-quality, patient-centered care.",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const MOCK_PRICING: PricingPlan[] = [
  {
    id: 1,
    name: "Basic",
    price: 29,
    currency: "USD",
    period: "month",
    is_popular: false,
    features: [
      "1 Consultation/month",
      "Basic health report",
      "Email support",
      "Online prescription",
    ],
  },
  {
    id: 2,
    name: "Standard",
    price: 59,
    currency: "USD",
    period: "month",
    is_popular: true,
    features: [
      "3 Consultations/month",
      "Full health assessment",
      "Priority support",
      "Online prescription",
      "Lab result delivery",
    ],
  },
  {
    id: 3,
    name: "Premium",
    price: 99,
    currency: "USD",
    period: "month",
    is_popular: false,
    features: [
      "Unlimited Consultations",
      "Full health assessment",
      "24/7 Priority support",
      "Home visit scheduling",
      "Lab result delivery",
      "Specialist referrals",
    ],
  },
];

// ─── Banner Slides ─────────────────────────────────────────────────────────────

export interface BannerSlide {
  id: number;
  subTitle: string;
  title: string;
  highlight: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  image: string;
}

export const MOCK_BANNER_SLIDES: BannerSlide[] = [
  {
    id: 1,
    subTitle: "Your Health is our Priority",
    title: "Compassionate Care, Innovative ",
    highlight: "Treatments",
    description: "In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications.",
    buttonLabel: "Read More",
    buttonHref: "/about",
    image: "/website/assets/images/banner/banner-img-1.png",
  },
  {
    id: 2,
    subTitle: "Expert Medical Team",
    title: "Dedicated Doctors, ",
    highlight: "Better Health",
    description: "Our team of experienced specialists works tirelessly to ensure that every patient receives the highest standard of medical care tailored to their individual needs.",
    buttonLabel: "Meet Our Doctors",
    buttonHref: "/doctors",
    image: "/website/assets/images/banner/banner-img-1.png",
  },
  {
    id: 3,
    subTitle: "State-of-the-Art Facilities",
    title: "Modern Equipment, ",
    highlight: "Trusted Care",
    description: "We invest in the latest medical technology so our physicians can diagnose and treat conditions more accurately and efficiently than ever before.",
    buttonLabel: "Our Services",
    buttonHref: "/departments",
    image: "/website/assets/images/banner/banner-img-1.png",
  },
];

// ─── Contact / Clinic Info ────────────────────────────────────────────────────

export const CLINIC_INFO = {
  name: "Miisky Medical Center",
  phone: "+1 (123)-456-155-23",
  email: "info@miisky.com",
  address: "123 Health Avenue, Medical District, NY 10001",
  hours: "Mon–Fri: 8am–8pm | Sat: 9am–5pm | Sun: Closed",
  emergencyPhone: "112",
  googleMapsEmbed: "",   // TODO: add real embed URL
  socialLinks: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
  },
};

// ─── Partners ──────────────────────────────────────────────────────────────────
import type { Partner } from "./types";
export const MOCK_PARTNERS: Partner[] = [
  { id: 1, name: "AARMS Value Chain", logo: "/website/assets/images/logo-2.png" },
  { id: 2, name: "Miisky SVASTH",     logo: "/website/assets/images/logo-miisky.png" },
  { id: 3, name: "Partner 1",         logo: "/website/assets/images/logo.png" },
  { id: 4, name: "Partner 2",         logo: "/website/assets/images/logo-2.png" },
  { id: 5, name: "Partner 3",         logo: "/website/assets/images/logo-miisky.png" },
  { id: 6, name: "Partner 4",         logo: "/website/assets/images/logo.png" },
  { id: 7, name: "Partner 5",         logo: "/website/assets/images/logo-2.png" },
  { id: 8, name: "Partner 6",         logo: "/website/assets/images/logo-miisky.png" },
];
