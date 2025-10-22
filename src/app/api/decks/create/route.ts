"use server";

import { createClient } from "@/utils/supabase/server";
import { notifications } from "@mantine/notifications";
import { cookies } from "next/headers";

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
  if (!apiKey) throw new Error("hello, api key is missing");

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

  const response = await fetch("https://api.deepseek.com/v1/generate", {
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

  if(!response.ok) {
    const error = await response.text();
    notifications.show({
        title: 'Error',
        message: `failed to generate flashcards: ${error}`,
        color: 'red',
    });
    return [];
  }

  const data = await response.json();
  const generatedData = data.choices[0].message.content;

  if(!generatedData) {
    notifications.show({
        title: 'Error',
        message: `failed to generate flashcards: no data received`,
        color: 'red'
    })
  }

  try {
    const jsonMatch = generatedData.match('/\[[\s\S]*\]/');
    if(!jsonMatch) {
        notifications.show({
            title: 'Error',
            message: 'failed to generate flashcards: invalid format received',
            color: 'red'
        })
        return [];
    }

    const flashcards: FlashCard[] = JSON.parse(jsonMatch[0]);

    if(!Array.isArray(flashcards) || flashcards.length === 0) {
        notifications.show({
            title: 'Error',
            message: 'failed to generate flashcards: no flashcards found in response',
            color: 'red'
        })
        return []
    }
    
    for(const card of flashcards) {
        if(!card.front || !card.back) {
            notifications.show({
                title: 'error',
                message: 'failed to generate flashcards: invalid flashcards format received',
                color: 'red'
            })
            return []
        }
    }

    return flashcards

  } catch (error) {
    notifications.show({
        title: 'Error',
        message: `failed to parse generated flashcards: ${error}`,
        color: 'red'
    })
    return []
  }
}

async function generateDeck(input: GenerateDeckInput) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { user }, error } = await supabase.auth.getUser();

        if(error || !user) {
            return {
                success: false, error: 'unauthorized'
            }
        }

        if(!input.title || !input.content || input.cardCount <= 0) {
            return {
                success: false, error: 'invalid input'
            }
        }

        const flascards = await generateFlashcards(input.content, input.cardCount);

        if(flascards.length === 0) {
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

        if((deckError) || !deck) {
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
        
        if(cardsError) {
            await supabase.from('decks').delete().eq('id', deck.id);
            return {
                success: false, error: 'failed to create cards'
            }
        }
        return {
            success: true, deckId: deck.id, cardCount: flascards.length
        }
    } catch (error) {
        notifications.show({
            title: 'Error',
            message: 'an unexpected error occured while generating deck',
            color: 'red'
        })
    }
}
