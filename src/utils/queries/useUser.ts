'use client';

import { useQuery } from "@tanstack/react-query";
import { createClient } from "../supabase/client";

export default function useUser() {
    const supabase = createClient();
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data;
        }
    })
}