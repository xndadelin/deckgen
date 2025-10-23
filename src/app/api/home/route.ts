import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type User = {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    }
}

type Deck = {
    id: string;
    owner: string;
    title: string;
    description?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

type Card = {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    position: number;
    extra: Record<string, unknown>;
    created_at?: string;
}
type CardReviewRow = {
    card_id: string;
    interval: number;
    efactor: number;
    repetitions: number;
    duet_at: string;
    cards?: Card | null;
    decks?: {
        id: string;
        title: string;
        owner: string;
    } | null;
}

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const {
            data: authData ,
            error: authError
        } = await supabase.auth.getUser();

        const user = (authData?.user ?? null) as User | null;

        if(!user) {
            return NextResponse.json({
                error: 'unauthorized'
            }, {
                status: 401
            })
        }

        const { data: ownedData, error: ownedError } = await supabase.from('decks').select('*').eq('owner', user.id).order('updated_at', {
            ascending: false
        }).limit(12);

        if(ownedError) {
            return NextResponse.json({
                error: 'failed to fetch decks',
            }, { 
                status: 500
            })
        }
        const owned = ownedData as Deck[] ?? [];

        const { data: continueLearning, error: learningError } = await supabase.from('card_reviews').select('*').eq('user_id', user.id).lte("due_at", new Date().toISOString()).order('due_at', {
            ascending: true
        }).limit(20);

        if(learningError) {
            return NextResponse.json({
                error: 'failed to fetch data',
            }, { 
                status: 500
            })
        }

        const continueLearningRows = continueLearning ?? [];
        const continueLearningData = continueLearning.map((row) => ({
            card_review: {
                interval: row.interval,
                efactor: row.efactor,
                repetitions: row.repetitions,
                due_at: row.due_at
            },
            card: row.cards ?? null,
            deck: row.decks ?? null
        }))

        const recentFilter = `is_public.eq.true,owner.eq.${user.id}`
        const { data: recentData, error: recentError } = await supabase.from('decks').select('*').or(recentFilter).order('updated_at', {
            ascending: false
        }).limit(6);

        if(recentError) {
            return NextResponse.json({
                error: 'failed to fetch decks',
            }, { 
                status: 500
            })
        }

        const recent = recentData as Deck[] ?? [];

        const stats = {
            cardsReview: 0, streakDays: 0, decksCreated: 0
        };

        
    const [{ count: reviewedCount } = { count: 0 }, { count: decksCount } = { count: 0 }] =
      await Promise.all([
        (async () => {
          const { count } = await supabase
            .from("card_reviews")
            .select("*", { count: "exact", head: false })
            .eq("user_id", user.id);
          return { count: count ?? 0 };
        })(),
        (async () => {
          const { count } = await supabase
            .from("decks")
            .select("*", { count: "exact", head: false })
            .eq("owner", user.id);
          return { count: count ?? 0 };
        })(),
      ]);

      stats.cardsReview = reviewedCount;
      stats.decksCreated = decksCount;

      return NextResponse.json({
        user, owned, continueLearning, recent, stats
      })

    } catch (error) {
        return NextResponse.json({
            error: 'internal_server_error'
        }, {
            status: 500
        })
    }
}