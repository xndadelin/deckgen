"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface GenerateDeckInput {
  title: string;
  description?: string;
  content: string;
  cardCount: number;
  isPublic: boolean;
}

interface FlashCard {
  front: string;
  back: string;
}

async function generateFlashcards(
  content: string,
  cardCount: number
): Promise<FlashCard[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("generateFlashcards: missing DEEPSEEK_API_KEY");
    throw new Error("hello, api key is missing");
  }

  const prompt = `
You are an expert flashcards generator. Based on the following content, generate ${cardCount} high-quality flashcards:

Content:
${content}

Requirements:
- Generate EXACTLY ${cardCount} flashcards.
- Each flashcards should have a clear, concise question on the front.
- Each answer on the back should be informative yet brief.
- Cover the most important concepts from the content.
- Ensure questions are not ambiguous and answers are accurate.

Respond in JSON format as an array of objects with "front" and "back" properties:
[
    {
        "front: "Question here?",
        "back": "Answer here."
    }
]

Do not include any other text, explanations, or formatting outside of the JSON array. Just the JSON array.
`;

  let response;
  try {
    response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
  } catch (err) {
    console.error("generateFlashcards: network error calling Deepseek API", err);
    return [];
  }

  if (!response.ok) {
    try {
      const text = await response.text();
      console.error("generateFlashcards: Deepseek API returned non-ok", response.status, text);
    } catch (err) {
      console.error("generateFlashcards: Deepseek API returned non-ok and failed to read body", err);
    }
    return [];
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error("generateFlashcards: failed to parse Deepseek response as JSON", err);
    return [];
  }

  const generatedData = data?.choices?.[0]?.message?.content;
  if (!generatedData) {
    console.error("generateFlashcards: no generated content in Deepseek response", { data });
    return [];
  }

  try {
    let parsed: any;
    const trimmed = generatedData.trim();

    if (trimmed.startsWith("[")) {
      parsed = JSON.parse(trimmed);
    } else {
      const start = generatedData.indexOf("[");
      const end = generatedData.lastIndexOf("]");
      if (start === -1 || end === -1 || end <= start) {
        console.error("generateFlashcards: could not find JSON array boundaries", { generatedData });
        return [];
      }
      const jsonStr = generatedData.slice(start, end + 1);
      parsed = JSON.parse(jsonStr);
    }

    const flashcards: FlashCard[] = parsed;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      console.error("generateFlashcards: parsed flashcards invalid or empty", { flashcards });
      return [];
    }

    for (const card of flashcards) {
      if (!card.front || !card.back) {
        console.error("generateFlashcards: card missing front/back", { card });
        return [];
      }
    }

    return flashcards;
  } catch (error) {
    console.error("generateFlashcards: error parsing/generated flashcards", error, { generatedData });
    return [];
  }
}

async function generateDeck(input: GenerateDeckInput) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("generateDeck: unauthorized or error fetching user", error);
      return {
        success: false, error: 'unauthorized'
      }
    }

    if (!input.title || !input.content || input.cardCount <= 0) {
      console.error("generateDeck: invalid input", input);
      return {
        success: false, error: 'invalid input'
      }
    }

    const flascards = await generateFlashcards(input.content, input.cardCount);

    if (flascards.length === 0) {
      console.error("generateDeck: generateFlashcards returned no cards", { contentPreview: input.content?.slice?.(0,200), cardCount: input.cardCount });
      return {
        success: false, error: 'failed to generate flashcards'
      }
    }

    const { data: deck, error: deckError } = await supabase.from('decks')
      .insert({
        owner: user.id,
        title: input.title,
        description: input.description || '',
        is_public: input.isPublic,
        settings : {},
      }).select().single();

    if (deckError || !deck) {
      console.error("generateDeck: failed to create deck", deckError);
      return {
        success: false, error: 'failed to create deck'
      }
    }

    const cards = flascards.map((card, index) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      position: index,
      extra: {}
    }))

    const { error: cardsError } = await supabase.from('cards')
      .insert(cards);

    if (cardsError) {
      console.error("generateDeck: failed to insert cards, rolling back deck", cardsError);
      try {
        await supabase.from('decks').delete().eq('id', deck.id);
      } catch (rollbackErr) {
        console.error("generateDeck: rollback failed", rollbackErr);
      }
      return {
        success: false, error: 'failed to create cards'
      }
    }
    return {
      success: true, deckId: deck.id, cardCount: flascards.length
    }
  } catch (error) {
    console.error("generateDeck: unexpected error", error);
    return { success: false, error: 'an unexpected error occured' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, content, cardCount, isPublic
    } = body;

    if (!title || !content || !cardCount || cardCount <= 0) {
      console.error("POST /api/decks/create: invalid request body", body);
      return NextResponse.json({
        error: 'title and content are required, cardCounts >= 0!',
      }, {
        status: 400
      })
    }
    const result = await generateDeck({
      title, description, content, cardCount: cardCount || 10, isPublic: isPublic || false
    });
    if (!result?.success) {
      console.error("POST /api/decks/create: generateDeck failed", result);
      return NextResponse.json({
        error: result?.error || 'failed to generate deck',
      }, {
        status: 400
      })
    }
    return NextResponse.json({
      success: true,
      deckId: result.deckId,
      cardCount: result.cardCount
    });
  } catch (error) {
    console.error("POST /api/decks/create: unexpected error", error);
    return NextResponse.json({
      error: 'an unexpected error occured' + error,
    }, {
      status: 500
    })
  }
}