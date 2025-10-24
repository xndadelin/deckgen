import { useQuery } from "@tanstack/react-query";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type Deck = {
  id: string;
  owner: string;
  title: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Card = {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  position: number;
  extra: Record<string, unknown>;
  created_at?: string;
};

type ContinueItem = {
  card_review: {
    interval: number;
    efactor: number;
    repetitions: number;
    due_at: string;
  };
  card: Card | null;
  deck: Deck | null;
};

type HomePayload = {
  user: User;
  owned: Deck[];
  continueLearningData: ContinueItem[];
  recent: Deck[];
  stats: {
    cardsReviewed: number;
    decksCreated: number;
    streakDays: number;
  };
};

async function fetchHomeData(): Promise<HomePayload> {
  const response = await fetch("/api/home");
  
  if (!response.ok) {
    throw new Error("Failed to fetch home data");
  }
  
  return response.json();
}

export default function useHome() {
  return useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
    staleTime: 1000 * 60 * 5,
  });
}