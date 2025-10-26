'use client';

import { useQuery } from "@tanstack/react-query";

export default function useCard({
    card_id: { card_id }, deck_id: { deck_id }
}: { card_id: { card_id: string }, deck_id: { deck_id: string } }) {
    return useQuery({
        queryKey: ['card', card_id],
        queryFn: async () => {
            try {
                const response = await fetch(`/api/decks/${encodeURIComponent(deck_id)}/cards/${encodeURIComponent(card_id)}`, {
                    method: 'GET',
                })
                if(!response.ok) throw new Error('failed to get card');
                const data = await response.json();
                return data?.card ?? data;
            } catch (error) {
                throw error;
            }
        },
        enabled: !!card_id && !!deck_id
    })   
}