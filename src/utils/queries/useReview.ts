import { useQuery } from "@tanstack/react-query";

type Card = {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    position: number;
    extra: Record<string, unknown>;
    created_at?: string
} 

type DeckWithCards = {
    id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    cards: Card[];
};

async function fetchReviewCards(deckId: string): Promise<DeckWithCards> {
    const response = await fetch(`/api/decks/${deckId}/review`);
    
    if(!response.ok) throw new Error('failed to fetch review cards')

    return response.json();
}

export default function useReview(deckId: string) {
    return useQuery({
        queryKey: ['review-cards', deckId],
        queryFn: () => fetchReviewCards(deckId),
        enabled: !!deckId,
        staleTime: 100 * 60 * 5
    })
}