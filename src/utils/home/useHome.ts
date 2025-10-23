import { useQuery } from "@tanstack/react-query";

export type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type Deck = {
  id: string;
  owner: string;
  title: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Card = {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  position: number;
  extra: Record<string, unknown>;
  created_at?: string;
};

export type ContinueItem = {
  card_review: {
    interval: number;
    efactor: number;
    repetitions: number;
    due_at: string;
  };
  card: Card | null;
  deck: { id: string; title: string; owner: string } | null;
};

export type HomePayload = {
  user: User | null;
  owned: Deck[];
  continueLearning: ContinueItem[];
  recent: Deck[];
  stats: { cardsReviewed: number; streakDays: number; decksCreated: number };
};

export default function useHome() {
  return useQuery<HomePayload, Error>({
    queryKey: ["home"],
    queryFn: async () => {
      const response = await fetch("/api/home");
      if (!response.ok) {
        throw new Error("failed to fetch home data");
      }
      return (await response.json()) as HomePayload;
    },
  });
}
