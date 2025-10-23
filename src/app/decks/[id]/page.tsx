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
import ErrorPage from "@/components/Error"

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
  const router = useRouter();
  const {
    data: deck,
    isLoading,
    error,
    refetch,
  } = useDeck({
    deck_id: params.id as string,
  });
  const [loading, setLoading] = useState<boolean>(true);
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
      setEditingCard(null);
      editForm.reset();
    } catch (error) {
      console.error("error");
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

  const confirmDeleteDeck = async () => {
    if (!cardToDelete) return;
    try {
      const response = await fetch(`/api/cards/${cardToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("failed to delete card");

      await refetch();
      setDeleteModalOpened(false);
      setCardToDelete(null);
    } catch (error) {
      console.error("failed to delete card", error);
    }
  };

  const addCard = newCardForm.onSubmit(async (values) => {
    try {
        const response = await fetch(`/api/decks/${deck.id}/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })

        if(!response.ok) throw new Error('failed to add card');

        await refetch();
        newCardForm.reset();
    } catch (error) {
        console.error('error adding card', error);
    }
  })

  if(isLoading) return <Loading />;
  if(!deck) return <ErrorPage number={404} message="Deck not found" />;

}
