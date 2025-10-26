import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { id } from "zod/locales";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; card_id: string }> }
) {
    const { id: deckId, card_id: cardId } = await params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore)
    const {
        data: { user }
    } = await supabase.auth.getUser();

    try {

        const { data: card, error} = await supabase.from('cards').select('*').eq('id', cardId).single();
        const { data: deck, error: errorDeck } = await supabase.from('decks').select('owner, is_public, title').eq('id', deckId).single();
        if(!deck) {
            throw new Error('Deck not found')
        }
        if(error || errorDeck) {
            throw new Error(error?.message || String(errorDeck));
        }
        if(!card) {
            throw new Error('Card not found')
        }

        if(deck.is_public) {
            return NextResponse.json({
                ...card,
                deck_title: deck.title
            })
        }else {
            if(deck.owner !== user?.id) {
                return NextResponse.json({
                    card: null
                })
            }
            return NextResponse.json({
                ...card,
                deck_title: deck.title
            })
        }

    } catch(error) {
        return NextResponse.json({
            error: 'Unexpected error' + String(error)
        }, {
            status: 500
        })
    }

}