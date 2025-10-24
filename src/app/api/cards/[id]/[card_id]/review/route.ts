import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

function calculateNextReview(
  difficulty: "easy" | "hard",
  currentInterval: number,
  currentEfactor: number,
  currentRepetitions: number
) {
  let efactor = currentEfactor;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  if (difficulty === "easy") {
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }

    efactor = Math.max(1.3, efactor + 0.1);
  } else {
    repetitions = 0;
    interval = 1;
    efactor = Math.max(1.3, efactor - 0.2);
  }

  return {
    interval,
    efactor,
    repetitions,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ card_id: string }> }
) {
  try {
    const { card_id: id } = await params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { difficulty } = body as { difficulty: "easy" | "hard" };

    if (!["easy", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "invalid difficulty" },
        { status: 400 }
      );
    }

    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id")
      .eq("id", id)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "card not found" }, { status: 404 });
    }

    const { data: reviewData, error: reviewError } = await supabase
      .from("card_reviews")
      .select("*")
      .eq("card_id", id)
      .eq("user_id", user.id)
      .single();

    const currentInterval = reviewData?.interval || 0;
    const currentEfactor = reviewData?.efactor || 2.5;
    const currentRepetitions = reviewData?.repetitions || 0; 

    const { interval, efactor, repetitions } = calculateNextReview(
      difficulty,
      currentInterval,
      currentEfactor,
      currentRepetitions
    );

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + interval);

    if (reviewData) {
      console.log('exist!')
      const { data: updatedReview, error: updateError } = await supabase
        .from("card_reviews")
        .update({
          interval,
          efactor,
          repetitions,
          due_at: dueAt.toISOString(),
        })
        .eq("card_id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (updateError) {
        return NextResponse.json(
          { error: "failed to update review" },
          { status: 500 }
        );
      }
      return NextResponse.json(updatedReview);
    } else {
      const { data: newReview, error: insertError } = await supabase
        .from("card_reviews")
        .insert({
          card_id: id,
          user_id: user.id,
          interval,
          efactor,
          repetitions,
          due_at: dueAt.toISOString(),
          metadata: {},
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: "failed to create review" },
          { status: 500 }
        );
      }
      return NextResponse.json(newReview);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
