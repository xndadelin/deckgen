import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { id: deckId } = await params;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 })
        }

        const { data: deck, error: deckError } = await supabase.from('decks').select('*').eq('id', deckId).single();

        if(deckError || !deck) {
            return NextResponse.json({
                error: 'deck not found'
            }, {
                status: 404
            })
        }

        if(deck.owner !== user.id && !deck.is_public) {
            return NextResponse.json({
                error: 'Forbidden'
            }, {
                status: 403
            })
        }

        const { data: cards, error: cardsError } = await supabase.from('cards').select('*').eq('deck_id', deckId).order('position', {
            ascending: true
        })

        if(cardsError) {
            return NextResponse.json({
                error: 'Error fetching cards',
            }, { status: 500 })
        }

        return NextResponse.json({
            ...deck,
            cards: cards || []
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Internal Server Error'
        }, {
            status: 500
        })
    }
}