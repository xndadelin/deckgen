import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { success } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { front, back } = body;

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("deck_id, decks!inner(owner)")
      .eq("id", params.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: cardError?.message || "card not found" },
        {
          status: 404,
        }
      );
    }
    if (card.decks && card.decks[0]?.owner) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: updatedCard, error: updateError } = await supabase
      .from("cards")
      .update({
        front,
        back,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "failed to update card",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params } : { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if(!user) {
      return NextResponse.json({
        error: 'unauthorized'
      }, {
        status: 401
      })
    }
    const { data: card, error: cardError } = await supabase.from('cards').select('deck_id, decks!inner(owner)').eq("id", params.id).single();

    if(cardError || !card) {
      return NextResponse.json({
        error: cardError?.message || 'card not found',
      }, {
        status: 404
      })
    }

    if(card.decks[0]?.owner !== user.id) {
      return NextResponse.json({
        error: 'forbidden'
      }, {
        status: 403
      })
    }

    const { error: deleteError } = await supabase.from('cards').delete().eq('id', params.id);

    if(deleteError) {
      return NextResponse.json({
        error: deleteError.message
      }, {
        status: 500
      })
    }

    return NextResponse.json({
      success: true
    }, {
      status: 200
    }) 
  } catch(error) {
    return NextResponse.json({
      error: 'failed to delete card'
    }, {
      status: 500
    })
  }
}
