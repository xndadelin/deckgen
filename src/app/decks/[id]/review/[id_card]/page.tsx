"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Card,
  Box,
  Progress,
  ActionIcon,
  Text,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconRotate,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Loading from "@/components/Loading";
import ErrorPage from "@/components/Error";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import useCard from "@/utils/queries/useCard";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  position: number;
}

export default function ReviewCardPage() {
  const params = useParams();
  const router = useRouter();
  const deck_id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const card_id = Array.isArray(params?.id_card)
    ? params.id_card[0]
    : params?.id_card ?? "";

  const {
    data: card,
    isLoading,
    error,
  } = useCard({
    card_id: { card_id: card_id },
    deck_id: { deck_id: deck_id },
  });

  const [flipped, setFlipped] = useState(false);
  const queryClient = useQueryClient();

  const handleFlip = () => setFlipped((s) => !s);

  const handleAnswer = async (difficulty: "easy" | "hard") => {
    if (!card) return;

    try {
      const res = await fetch(
        `/api/cards/${encodeURIComponent(deck_id)}/${encodeURIComponent(
          card.id
        )}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty }),
        }
      );

      if (!res.ok) throw new Error("failed to submit review");

      queryClient.invalidateQueries({ queryKey: ["home"] });
      notifications.show({
        title: "Saved",
        message: "Review submitted",
        color: "green",
      });
      router.push(`/decks/${deck_id}`);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to submit review.",
        color: "red",
      });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    }
  };

  if (isLoading) return <Loading />;
  if (error || !card)
    return <ErrorPage number={404} message="Card not found" />;

  const progressValue = 100;

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Group gap="md">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => router.push(`/decks/${deck_id}`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Box>
              <Title order={3} fw={600}>
                {card.deck_title}
              </Title>
              <Text c="dimmed" size="sm">
                Single card review
              </Text>
            </Box>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => {
              setFlipped(false);
            }}
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
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={handleFlip}
        >
          <Stack gap="xl" align="center" style={{ width: "100%" }}>
            <Text
              size="xs"
              c="dimmed"
              fw={500}
              style={{ position: "absolute", top: 20, left: 20 }}
            >
              {flipped ? "BACK" : "FRONT"}
            </Text>

            <Box style={{ textAlign: "center", padding: "2rem" }}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {flipped ? card.back : card.front}
              </ReactMarkdown>
            </Box>

            {!flipped && (
              <Text size="sm" c="dimmed">
                Click to reveal answer
              </Text>
            )}
          </Stack>
        </Card>

        {flipped ? (
          <Group justify="center" gap="md">
            <Button
              size="lg"
              color="red"
              variant="light"
              leftSection={<IconX size={16} />}
              onClick={() => handleAnswer("hard")}
              radius="md"
              style={{ flex: 1, maxWidth: 200 }}
            >
              Hard
            </Button>
            <Button
              size="lg"
              color="cyan"
              leftSection={<IconCheck size={16} />}
              onClick={() => handleAnswer("easy")}
              radius="md"
              style={{ flex: 1, maxWidth: 200 }}
            >
              Easy
            </Button>
          </Group>
        ) : (
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
  );
}
