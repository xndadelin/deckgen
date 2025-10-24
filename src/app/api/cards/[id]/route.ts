import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { success } from "zod";

export async function PATCH(
  request: Request,
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
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { front, back } = body;

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("deck_id, decks!inner(owner)")
      .eq("id", deckId)
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
      .eq("id", deckId)
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
  request: Request,
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
        error: 'unauthorized'
      }, {
        status: 401
      })
    }
    const { data: card, error: cardError } = await supabase.from('cards').select('deck_id, decks!inner(owner)').eq("id", deckId).single();

    if(cardError || !card) {
      return NextResponse.json({
        error: cardError?.message || 'card not found',
      }, {
        status: 404
      })
    }

    const ownerId =
+      Array.isArray((card as any).decks) ? (card as any).decks[0]?.owner : (card as any).decks?.owner;

    if(ownerId !== user.id) {
      return NextResponse.json({
        error: 'forbidden'
      }, {
        status: 403
      })
    }

    const { error: deleteError } = await supabase.from('cards').delete().eq('id', deckId);

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
