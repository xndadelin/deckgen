import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";

type Deck = {
    id: string;
    title: string;
    description?: string | null;
    owner: string;
    is_public: string;
    created_at: string;
    updated_at: string;
}

async function fetchPublicDecks(): Promise<Deck[]> {
    const response = await fetch('/api/decks');

    if(!response.ok) {
        notifications.show({
            title: 'Error',
            message: 'Failed to fetch public decks.',
            color: 'red'
        })
    }
    const data = await response.json();
    return data.decks ?? [];
}

export default function useDecks() {
    return useQuery({
        queryKey: ['public-decks'],
        queryFn: fetchPublicDecks,
        staleTime: 1000 * 60 * 30,
        retry: 2
    })
}
