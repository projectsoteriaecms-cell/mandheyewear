// Shared quiz constants — data-driven from actual product catalog values
// Used by both StyleQuizStep (onboarding) and StyleQuiz page

export const FACE_SHAPES = [
  { id: "oval", label: "Oval", description: "Balanced proportions" },
  { id: "round", label: "Round", description: "Soft, curved features" },
  { id: "square", label: "Square", description: "Strong jawline" },
  { id: "heart", label: "Heart", description: "Wider forehead" },
  { id: "oblong", label: "Oblong", description: "Longer face shape" },
] as const;

// Frame shapes mapped directly to product.style values in the database
// These match via .includes() so "Cat Eye/Round" matches both "cat eye" and "round"
export const FRAME_SHAPES = [
  { id: "rectangular", label: "Rectangular", description: "Classic & versatile" },
  { id: "cat eye", label: "Cat Eye", description: "Bold & feminine" },
  { id: "round", label: "Round", description: "Retro & trendy" },
  { id: "square", label: "Square", description: "Strong & structured" },
  { id: "aviator", label: "Aviator", description: "Iconic & sporty" },
  { id: "geometric", label: "Geometric", description: "Modern & unique" },
] as const;

// Material options mapped to product.material values
export const MATERIALS = [
  { id: "acetate", label: "Acetate / Plastic", description: "Lightweight & colorful" },
  { id: "metal", label: "Metal", description: "Sleek & durable" },
  { id: "titanium", label: "Titanium", description: "Ultra-light & strong" },
  { id: "gold plated", label: "Gold Plated", description: "Luxurious finish" },
] as const;

// "Who is this for?" step
export const GENDER_OPTIONS = [
  { id: "male", label: "Men", description: "Men's frames" },
  { id: "female", label: "Women", description: "Women's frames" },
  { id: "kids", label: "Kids", description: "Children's frames" },
  { id: "unisex", label: "Unisex", description: "For everyone" },
] as const;

export const USAGE_OPTIONS = [
  { id: "everyday", label: "Everyday", description: "All-day wear" },
  { id: "computer", label: "Computer", description: "Screen work" },
  { id: "reading", label: "Reading", description: "Close-up tasks" },
  { id: "outdoor", label: "Outdoor", description: "Sun protection" },
] as const;

// Budget IDs are the canonical format used in both quizzes and the recommendation engine
export const BUDGET_OPTIONS = [
  { id: "under_50k", label: "Under ₦50,000", description: "Budget-friendly" },
  { id: "50k_150k", label: "₦50,000 – ₦150,000", description: "Mid-range" },
  { id: "150k_300k", label: "₦150,000 – ₦300,000", description: "Premium" },
  { id: "over_300k", label: "Over ₦300,000", description: "Luxury" },
] as const;

// The shape of data saved to profiles.frame_preferences
export interface QuizPreferences {
  faceShape?: string;
  frameShape?: string[];   // renamed from frameStyle — now stores actual shapes
  material?: string[];     // new
  gender?: string;         // new
  usage?: string[];
  budget?: string;
}
