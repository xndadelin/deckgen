import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type DeckObj = { owner: string };
type DeckRel = DeckObj | DeckObj[];

type CardWithDeckOwner = {
  deck_id: string;
  decks: DeckRel;
};

function getOwnerId(rel: DeckRel): string | undefined {
  return Array.isArray(rel) ? rel[0]?.owner : rel.owner;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { id: cardId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as { front?: unknown }).front !== "string" ||
      typeof (body as { back?: unknown }).back !== "string"
    ) {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
    const { front, back } = body as { front: string; back: string };

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("deck_id, decks!inner(owner)")
      .eq("id", cardId)
      .returns<CardWithDeckOwner[]>();
    if (cardError || !card || card.length === 0) {
      return NextResponse.json(
        { error: cardError?.message ?? "card not found" },
        { status: 404 }
      );
    }

    const ownerId = getOwnerId(card[0].decks);
    if (!ownerId || ownerId !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: updatedCard, error: updateError } = await supabase
      .from("cards")
      .update({ front, back })
      .eq("id", cardId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedCard, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed to update card" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { id: cardId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("deck_id, decks!inner(owner)")
      .eq("id", cardId)
      .returns<CardWithDeckOwner[]>();

    if (cardError || !card || card.length === 0) {
      return NextResponse.json(
        { error: cardError?.message ?? "card not found" },
        { status: 404 }
      );
    }

    const ownerId = getOwnerId(card[0].decks);
    if (!ownerId || ownerId !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("cards")
      .delete()
      .eq("id", cardId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed to delete card" }, { status: 500 });
  }
}
