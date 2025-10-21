"use client";

import authenticateUser from "@/utils/auth/main";
import { Button, Container, Text, Group } from "@mantine/core";

export default function Home() {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
      size={"md"}
    >
      <Text
        style={{
          fontSize: 52,
          textAlign: "center",
        }}
        fw={700}
      >
        A web platform that leverages{" "}
        <span
          style={{
            display: "inline-block",
            fontWeight: "bold",
            fontSize: 60,
            background:
              "linear-gradient(90deg, #4c9aff 0%, #7dd3fc 50%, #a6b7b9ff 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          AI
        </span>{" "}
        to help you create{" "}
        <span
          style={{
            display: "inline-block",
            fontWeight: "bold",
            fontSize: 60,
            background:
              "linear-gradient(90deg, #8ba9d1ff 0%, #7dd3fc 50%, #b7c8c9ff 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          effective flashcard
        </span>{" "}
        decks for learning.
      </Text>
      <Group justify="space-between">
        <Button variant="light" my={50} color="cyan" size="lg" radius={"md"} onClick={authenticateUser}>
          Want to try it? Sign in and start!
        </Button>
        <Button variant="light" my={50} color="grape" size="lg" radius="md">
          Don't know what you getting into? Learn more! ➡️
        </Button>
      </Group>
    </Container>
  );
}
