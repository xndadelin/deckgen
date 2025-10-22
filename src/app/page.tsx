"use client";

import authenticateUser from "@/utils/auth/main";
import { Button, Container, Text, Group, Stack, Title, Badge, Anchor } from "@mantine/core";
import useUser from "@/utils/queries/useUser";
import Loading from "@/components/page";
import PostLoginHome from "@/components/Home";
export default function Home() {
  const { data: user, isLoading } = useUser();

  if(isLoading) return <Loading />
  if(user) return <PostLoginHome />

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: '100dvh',
        textAlign: 'center'
      }}
      size={"md"}
    >
      <Stack gap={"xl"} align="center" ta="center">
        <Badge size="lg" variant="light" color="blue" radius="sm">
          Flashcards powered by AI!
        </Badge>
        <Title
          order={1}
          style={{
            lineHeight: 1.1,
            letterSpacing: '-0.4',
            fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 700
          }}
        >
          A web platform that leverages{" "}
          <Text
            span
            variant="gradient"
            gradient={{ from: '#06b6d4', to: '#3b82f6', deg: 90 }}
            style={{
              fontWeight: 900,
              fontSize: '1.2em',
              display: 'inline-block'
            }}
          >AI</Text>{" "}
          to help you create{" "}
          <Text
            span
            variant="gradient"
            gradient={{ from: '#06b6d4', to: '#3b82f6', deg: 90 }}
            style={{
              fontWeight: 900,
              fontSize: '1.2em',
              display: 'inline-block'
            }}
          >
            effective flashcards
          </Text>{" "} for learning.
        </Title>

        <Text c="dimmed" fz="lg" maw={720}>
          Paste your resources, pick a few options, and let it generate flashcards for you! And export it anywhere you want.
        </Text>

        <Group gap="md" justify="center" wrap="wrap">
          <Button
            variant="filled"
            color="green"
            size="lg"
            radius="md"
            onClick={authenticateUser}
          >
            Convinced? Let's get started!
          </Button>

          <Anchor href="/learn-more" underline="never">
            <Button variant="light" color="blue" size="lg" radius={"md"}>
              Learn more ➜
            </Button>
          </Anchor>
        </Group>


          <Text c="dimmed" fz="sm">
            No credit card required. Free forever & open sourced! 🚀
          </Text>

      </Stack>
    </Container>
  );
}
