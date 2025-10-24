'use client';

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function useDeck({ deck_id } : {
    deck_id: string;
}) {
    return useQuery({
        queryKey: ['deck', deck_id],
        queryFn: async () => {
            try {
                const response = await fetch(`/api/decks/${deck_id}`);
                if(!response.ok) throw new Error('failed to fetch deck');
                const data = await response.json();
                return data;
            } catch (error) {
                throw error;
            }
        }
    })
}