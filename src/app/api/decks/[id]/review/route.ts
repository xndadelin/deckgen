import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { id: deckId } = params;

    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("id, title, description, is_public, created_at, updated_at")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const { data: cards, error: cardsError } = await supabase
      .from("card_reviews")
      .select(
        "id, card_id, interval, efactor, repetitions, due_at, cards(id, front, back, deck_id, position, extra)"
      )
      .eq("cards.deck_id", deckId)
      .lte("due_at", new Date().toISOString())
      .order("due_at", { ascending: true });

    if (cardsError) {
      return NextResponse.json(
        { error: "Failed to fetch cards for review" + cardsError.message },
        { status: 500 }
      );
    }

    const deckWithCards = {
      ...deck,
      cards: (cards || []).map((row) => row.cards).filter((card) => card !== null),
    };

    return NextResponse.json(deckWithCards);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
