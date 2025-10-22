import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { positive } from "zod";

export async function POST(
    request: NextRequest,
    { params } : { params: { id: string }}
) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { user } } = await supabase.auth.getUser();

        if(!user) {
            return NextResponse.json({
                error: 'unauthorized',
            }, { status: 401 })
        }

        const body = await request.json();
        const { front, back } = body;

        if(!front || !back) {
            return NextResponse.json({
                error: 'front and back are required',
            }, { 
                status: 400
            })
        }

        const { data: deck, error: deckError } = await supabase.from('decks').select('owner').eq('id', params.id).single();

        if(deckError || !deck) {
            return NextResponse.json({
                error: 'deck not found'
            }, {
                status: 404
            })
        }

        if(deck.owner !== user.id) {
            return NextResponse.json({
                error: 'forbidden',
            }, {
                status: 403
            })
        }

        const { data: maxCard } = await supabase.from('cards').select('position').eq('deck_id', params.id).order('position', {
            ascending: false
        }).limit(1).single();

        const newPosition = maxCard ? (maxCard.position + 1) : 1;

        const { data: newCard, error: cardError } = await supabase.from('cards').insert([{
            deck_id: params.id,
            front,
            back,
            positive: newPosition,
            extra: {}
        }]).select().single();

        if(cardError || !newCard) {
            return NextResponse.json({
                error: 'error creating card',
            }, {
                status: 500
            })
        }

        return NextResponse.json(newCard, {
            status: 201
        })

    } catch (error) {
        return NextResponse.json({
            error: 'internal server error'
        }, {
            status: 500
        })
    }
}

