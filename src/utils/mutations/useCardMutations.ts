import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

type CardValues = {
  front: string;
  back: string;
};

type AddCardPayload = {
  deckId: string;
  values: CardValues;
};

type EditCardPayload = {
  cardId: string;
  values: Partial<CardValues>;
};

type DeleteCardPayload = {
  cardId: string;
};

type ReviewPayload = {
  deckId: string;
  cardId: string;
  difficulty: "easy" | "hard";
};

export default function useCardMutations() {
  const queryClient = useQueryClient();

  const addCard = useMutation({
    mutationFn: async ({ deckId, values }: AddCardPayload) => {
      const response = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.text()) || "failed to add card";
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      notifications.show({
        title: "Card added",
        message: "The card was added successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Card adding failed",
        message: error.message,
        color: "red",
      });
    },
  });

  const editCard = useMutation({
    mutationFn: async ({ cardId, values }: EditCardPayload) => {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.text()) || "failed to edit card";
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      notifications.show({
        title: "Card edited",
        message: "The card was edited successfully",
        color: "green",
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Card editing failed",
        message: error.message,
        color: "red",
      });
    },
  });

  const deleteCard = useMutation({
    mutationFn: async ({ cardId }: DeleteCardPayload) => {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.text()) || "failed to delete card";
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      notifications.show({
        title: "Card deleted",
        message: "The card was deleted successfully",
        color: "green",
      });
    },
  });

  const reviewCard = useMutation({
    mutationFn: async ({ deckId, cardId, difficulty }: ReviewPayload) => {
      const response = await fetch(
        `/api/decks/${encodeURIComponent(deckId)}/${encodeURIComponent(
          cardId
        )}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            difficulty,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.text()) || "failed to review card";
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      notifications.show({
        title: "Card reviewed",
        message: "The card was reviewed successfully",
        color: "green",
      });
    },
  });

  return {
    addCard,
    editCard,
    deleteCard,
    reviewCard,
  };
}
