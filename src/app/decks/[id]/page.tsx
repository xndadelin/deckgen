"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Box,
  Divider,
  ActionIcon,
  Textarea,
  TextInput,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import useDeck from "@/utils/queries/useDecks";
import Loading from "@/components/page";
import ErrorPage from "@/components/Error";
import { notifications } from "@mantine/notifications";

interface Deck {
  id: string;
  title: string;
  description: string | null;
  cards: Card[];
  is_public: boolean;
  created_at: string;
}

interface Card {
  id: string;
  front: string;
  back: string;
  positions: number;
}

export default function DeckPage() {
  const params = useParams();
  const deckId = params?.id
  const {
    data: deck,
    isLoading,
    error,
    refetch,
  } = useDeck({
    deck_id: deckId as string,
  });
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const editForm = useForm({
    initialValues: {
      front: "",
      back: "",
    },
  });

  const newCardForm = useForm({
    initialValues: {
      front: "",
      back: "",
    },
    validate: {
      front: (value) => (!value.trim() ? "front cannot be empty" : null),
      back: (value) => (!value.trim() ? "back cannot be empty" : null),
    },
  });

  const startEditingCard = (card: Card) => {
    setEditingCard(card);
    editForm.setValues({
      front: card.front,
      back: card.back,
    });
  };

  const saveEditedCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm.values),
      });
      if (!response.ok) throw new Error("failed to save card");
      await refetch();
      notifications.show({
        title: 'Success',
        color: 'green',
        message: 'Card saved successfully.'
      })
      setEditingCard(null);
      editForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        color: 'red',
        message: 'FAILED to save card.'
      })
    }
  };

  const cancelEditing = () => {
    setEditingCard(null);
    editForm.reset();
  };

  const openDeleteModal = (cardId: string) => {
    setCardToDelete(cardId);
    setDeleteModalOpened(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    try {
      const response = await fetch(`/api/cards/${cardToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("failed to delete card");

      await refetch();
      setDeleteModalOpened(false);
      setCardToDelete(null);
      notifications.show({
        title: 'Success',
        color: 'green',
        message: 'Card deleted successfully.'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        color: 'red',
        message: 'FAILED to delete card.'
      })
    }
  };

  const addCard = newCardForm.onSubmit(async (values) => {
    try {
      const response = await fetch(`/api/decks/${deck.id}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("failed to add card");
      notifications.show({
        title: 'Success',
        color: 'green',
        message: 'Card added successfully.'
      })

      await refetch();
      newCardForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        color: 'red',
        message: 'FAILED to add card.'
      })
    }
  });

  if (isLoading) return <Loading />;
  if (!deck) return <ErrorPage number={404} message="Deck not found" />;

  return (
    <Container size="lg" py="xl">
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirm delete"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">Are you sure you want to delete this?</Text>
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setDeleteModalOpened(false)}
              radius="md"
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteCard} radius={"md"}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack gap="xl">
        <Group justify="space-between">
          <Group gap="md">
            <ActionIcon
              component={Link}
              href="/"
              variant="subtle"
              color="gray"
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Box>
              <Group gap="xs" mb={4}>
                <Title order={2}>{deck.title}</Title>
                {deck.is_public && (
                  <Badge color="cyan" variant="light" size="sm">
                    Public
                  </Badge>
                )}
              </Group>
              {deck.description && (
                <Text c="dimmed" size="sm">
                  {deck.description}
                </Text>
              )}
            </Box>
          </Group>

          <Button
            component={Link}
            href={`/decks/${deck.id}/study`}
            radius={"md"}
            color="cyan"
          >
            Start studying
          </Button>
        </Group>

        <Divider />

        <Box>
          <Group justify="space-between" mb="md">
            <Title order={4} fw={600}>
              Cards ({deck.cards.length})
            </Title>
          </Group>

          <Stack gap="md">
            {deck.cards.map((card: Card) => (
              <Card key={card.id} withBorder radius={"md"} p="md">
                {editingCard?.id === card.id ? (
                  <Stack gap="sm">
                    <TextInput
                      label="Front"
                      {...editForm.getInputProps("front")}
                      radius="md"
                    />
                    <Textarea
                      label="Back"
                      {...editForm.getInputProps("back")}
                      radius="md"
                      placeholder="Answer"
                      rows={3}
                    />
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="cyan"
                        leftSection={<IconCheck size={16} />}
                        onClick={() => saveEditedCard(card.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconX size={16} />}
                        onClick={cancelEditing}
                        radius="md"
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text fw={500} size="sm" mb={4}>
                        {card.front}
                      </Text>
                      <Text c="dimmed" size="sm">
                        {card.back}
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => startEditingCard(card)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => openDeleteModal(card.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                )}
              </Card>
            ))}

            <Card withBorder radius={"md"} p="md">
              <form onSubmit={addCard}>
                <Stack gap="sm">
                  <Text fw={500} size="sm">
                    Add new card
                  </Text>
                  <TextInput
                    placeholder="Front (question)"
                    {...newCardForm.getInputProps("front")}
                    radius="md"
                  />
                  <Textarea
                    placeholder="Back (answer)"
                    {...newCardForm.getInputProps("back")}
                    radius="md"
                    rows={3}
                  />
                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPlus size={16} />}
                      radius="md"
                    >
                      Add card
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
