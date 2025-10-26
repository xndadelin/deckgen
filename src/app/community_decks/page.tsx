"use client";

import { Container, Grid, Card, Title, Text, Group, Anchor, Stack, TextInput, ActionIcon } from "@mantine/core";
import usePublicDecks from "@/utils/queries/useDecks";
import Loading from "@/components/Loading";
import Error from "@/components/Error";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";

export default function CommunityDecksPage() {
  const { data: decks = [], isLoading, isError, error } = usePublicDecks();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useDebouncedValue(search, 1200);

    
  const filteredDecks = useMemo(() => {
    const q = debouncedSearch.toLocaleLowerCase().trim();
    if(!q) return decks;

    return decks.filter((deck) => {
        const title = (deck.title ?? "").toLocaleLowerCase();
        const description = (deck.description ?? "").toLocaleLowerCase();
        return title.includes(q) || description.includes(q);
    })
  }, [decks, debouncedSearch] ) 


  if (isLoading) return <Loading />;
  if (isError) {
    return (
      <Error
        number={500}
        message={error instanceof Error ? error.message : "An unknown error occurred."}
      />
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">
        Community decks
      </Title>

      <Stack mb="md" gap="xs">
        <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search decks by title or description..."
            aria-label="search community decks"
            leftSection={<IconSearch size={18} aria-hidden="true" />}
            __clearable
            rightSection={
                search ? (
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setSearch('')}
                    >
                        <IconX size={16} />   
                    </ActionIcon>
                ) : null
            }
        />

        {search && (
            <Text size="xs" c="dimmed">
                Searching for: <Text span fw={600} c="cyan">
                    {debouncedSearch || "..."}
                </Text>
            </Text>
        )}


      </Stack>

      {filteredDecks.length === 0 ? (
        <Text c="dimmed">No public decks yet.</Text>
      ) : (
        <Grid gutter="md">
          {filteredDecks.map((deck) => (
            <Grid.Col
              key={deck.id}
              span={{
                base: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Card p="md" radius="md" withBorder>
                <Group mb="sm" align="center">
                  <div style={{ minWidth: 0 }}>
                    <Text fw={600} truncate>
                      <Anchor
                        component={Link}
                        href={`/decks/${deck.id}`}
                        underline="hover"
                        aria-label={`Open deck ${deck.title}`}
                      >
                        {deck.title}
                      </Anchor>
                    </Text>

                    <Text c="dimmed" size="xs" truncate title={deck.description ?? "No description"}>
                      {deck.description ?? "No description"}
                    </Text>
                  </div>
                </Group>

                <Group justify="space-between" mt="sm">
                  <Text size="xs" c="dimmed">
                    Created at:{" "}
                    {deck.created_at ? new Date(deck.created_at).toLocaleDateString() : "-"}
                  </Text>

                  <Anchor
                    component={Link}
                    href={`/decks/${deck.id}`}
                    size="xs"
                    c="cyan"
                    underline="hover"
                    aria-label={`View deck ${deck.title}`}
                  >
                    View deck
                  </Anchor>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
