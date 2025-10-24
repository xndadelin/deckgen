import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Deck = {
  id: string;
  owner: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Card = {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  position: number;
  extra: Record<string, unknown>;
  created_at?: string;
};

type CardReviewRow = {
  card_id: string;
  interval: number;
  efactor: number;
  repetitions: number;
  due_at: string;
  cards: Card | null;
};

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: ownedData, error: ownedError } = await supabase
      .from("decks")
      .select("*")
      .eq("owner", user.id)
      .order("updated_at", { ascending: false })
      .limit(12);

    if (ownedError) {
      return NextResponse.json(
        { error: "Failed to fetch decks" },
        { status: 500 }
      );
    }

    const owned = (ownedData as Deck[]) ?? [];

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("card_reviews")
      .select(`
        card_id,
        interval,
        efactor,
        repetitions,
        due_at,
        cards (
          id,
          front,
          back,
          deck_id,
          position,
          extra
        )
      `)
      .eq("user_id", user.id)
      .lte("due_at", new Date().toISOString())
      .order("due_at", { ascending: true })
      .limit(20)
      .returns<CardReviewRow[]>();

    if (reviewsError) {
      return NextResponse.json(
        { error: "Failed to fetch card reviews" },
        { status: 500 }
      );
    }

    const reviewsRows = reviewsData ?? [];

    const deckIds = Array.from(
      new Set(
        reviewsRows
          .map((r) => r.cards?.deck_id)
          .filter((id): id is string => !!id)
      )
    );

    const decksById: Record<string, Deck> = {};
    if (deckIds.length > 0) {
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select("*")
        .in("id", deckIds)
        .returns<Deck[]>();

      if (!decksError && decksData) {
        for (const d of decksData) {
          decksById[d.id] = d;
        }
      }
    }

    const continueLearningData = reviewsRows.map((row) => ({
      card_review: {
        interval: row.interval,
        efactor: row.efactor,
        repetitions: row.repetitions,
        due_at: row.due_at,
      },
      card: row.cards ?? null,
      deck: row.cards?.deck_id ? decksById[row.cards.deck_id] ?? null : null,
    }));

    const { data: recentData, error: recentError } = await supabase
      .from("decks")
      .select("*")
      .or(`is_public.eq.true,owner.eq.${user.id}`)
      .order("updated_at", { ascending: false })
      .limit(6)
      .returns<Deck[]>();

    if (recentError) {
      return NextResponse.json(
        { error: "Failed to fetch recent decks" },
        { status: 500 }
      );
    }

    const recent = (recentData as Deck[]) ?? [];

    const [reviewedCount, decksCount] = await Promise.all([
      supabase
        .from("card_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then((res) => res.count ?? 0),
      supabase
        .from("decks")
        .select("*", { count: "exact", head: true })
        .eq("owner", user.id)
        .then((res) => res.count ?? 0),
    ]);

    const stats = {
      cardsReviewed: reviewedCount,
      decksCreated: decksCount,
      streakDays: 0,
    };

    return NextResponse.json({
      user,
      owned,
      continueLearningData,
      recent,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
