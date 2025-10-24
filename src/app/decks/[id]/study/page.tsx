"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Container, Title, Button, Group, Stack, Card, Box, Progress, ActionIcon, Text
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconX, IconRotate } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useDeck from "@/utils/queries/useDecks";
import Loading from "@/components/page";
import ErrorPage from "@/components/Error";
import { useQueryClient } from "@tanstack/react-query";

interface FlashCard {
    id: string;
    front: string;
    back: string;
    position: number;
}

interface Deck {
    id: string;
    title: string;
    description: string | null;
    cards: FlashCard[];
}

export default function StudyPage() {
    const params = useParams();
    const deckId = params?.id;
    const router = useRouter();
    const {
        data: deck,
        isLoading,
        error,
        refetch,
      } = useDeck({
        deck_id: deckId as string,
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [studied, setStudied] = useState<number[]>([]);
    const queryClient = useQueryClient();

    const handleFlip = () => {
        setFlipped(!flipped);
    }

    const handleAnswer = async(difficulty: 'easy' | 'hard') => {
        if(!deck) return;
        const currentCard = deck.cards[currentIndex];
        setStudied([...studied, currentCard.id]);

        try {
            await fetch(`/api/cards/${deck.id}/${currentCard.id}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    difficulty
                })
            })
            queryClient.invalidateQueries({
                queryKey: ["home"]
            })
        } catch(error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to submit review.',
                color: 'red'
            })
            queryClient.invalidateQueries({
                queryKey: ["home"]
            })
        }

        if(currentIndex + 1 < deck.cards.length) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
        } else {
            notifications.show({
                title: 'Great job!',
                message: 'You have completed the deck.',
                color: 'green'
            })
            router.push(`/decks/${deck.id}`)
        }
    }

    const handleRestart = () => {
        setCurrentIndex(0);
        setFlipped(false);
        setStudied([]);
    }

    if(isLoading) return <Loading />;
    if(error || !deck) return <ErrorPage number={404} message="Deck not found" />;

    const currentCard = deck.cards[currentIndex];
    const progressValue = ((currentIndex + 1) / deck.cards.length) * 100;

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <Group justify="space-between">
                    <Group gap="md">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={() => router.push(`/decks/${deck.id}`)}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Box>
                            <Title order={3} fw={600}>
                                {deck.title}
                            </Title>
                            <Text c="dimmed" size="sm">
                                Card {currentIndex + 1} of {deck.cards.length}
                            </Text>
                        </Box>
                    </Group>

                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        onClick={handleRestart}
                    >
                        <IconRotate size={20} />
                    </ActionIcon>
                </Group>
                <Progress value={progressValue} color="cyan" size="sm" radius={"xl"} />

                <Card
                    withBorder
                    radius="lg"
                    p="xl"
                    style={{
                        minHeight: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                    onClick={handleFlip}
                >
                    <Stack gap="xl" align="center" style={{
                        width: '100%'
                    }}>
                        <Text
                            size="xs"
                            c="dimmed"
                            fw={500}
                            style={{
                                position: 'absolute',
                                top: 20,
                                left: 20
                            }}
                        >
                            {flipped ? 'BACK' : 'FRONT'}
                        </Text>

                        <Box style={{ textAlign: 'center', padding: '2rem' }}>
                            <Text size="lg" fw={500}>
                                {flipped ? currentCard.back : currentCard.front}
                            </Text>
                        </Box>

                        {!flipped && (
                            <Text size="sm" c="dimmed">
                                Click to reveal answer
                            </Text>
                        )}
                    </Stack>
                </Card>
                {flipped && (
                    <Group justify="center" gap="md">
                        <Button
                            size="lg"
                            color="red"
                            variant="light"
                            leftSection={<IconX size={16} />}
                            onClick={() => handleAnswer('hard')}
                            radius="md"
                            style={{
                                flex: 1, maxWidth: 200
                            }}
                        >
                            Hard
                        </Button>
                        <Button
                            size="lg"
                            color="cyan"
                            leftSection={<IconCheck size={16} />}
                            onClick={() => handleAnswer('easy')}
                            radius="md"
                            style={{
                                flex: 1, maxWidth: 200
                            }}
                        >
                            Easy
                        </Button>
                    </Group>
                )}
                {!flipped && (
                    <Group justify="center">
                        <Button
                            size="lg"
                            variant="light"
                            color="gray"
                            onClick={handleFlip}
                            radius={"md"}
                        >
                            Show answer
                        </Button>
                    </Group>
                )}
            </Stack>
        </Container>
    )

}