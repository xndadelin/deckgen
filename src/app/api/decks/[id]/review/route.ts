import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { id: deckId } = await params;
        
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if(!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, {
                status: 401
            })
        }

        const { data: cards, error } = await supabase.from('card_reviews').select('id,card_id,interval,efactor,repetitions,due_at,cards(id,front,back,deck_id,position,extra)').eq('deck_id', deckId).eq('user_id', user.id).lte("due_at", new Date().toISOString()).order("due_at", {
            ascending: true
        })

        if(error) {
            return NextResponse.json({
                error: 'error fetching reviews',
            }, {
                status: 500
            })
        }

        const reviewsCards = cards?.map(card => card.cards);

        return NextResponse.json(reviewsCards || [])

    } catch (error) {
        return NextResponse.json(
            { error: 'internal server error' },
            { status: 500 }
        )
    }


}