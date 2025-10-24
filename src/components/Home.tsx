"use client";

import { useMemo, useState } from "react";
import useUser from "@/utils/queries/useUser";
import useHome from "@/utils/home/useHome";
import Loading from "./page";
import CreateDeckModal from "@/components/CreateDeckModal";
import {
  Container,
  Group,
  Box,
  Avatar,
  TextInput,
  Button,
  Title,
  Text,
  Stack,
  Grid,
  Card,
  Progress,
  Divider,
  Accordion,
} from "@mantine/core";
import { Icon3dCubeSphere, IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Deck = {
  id: string;
  owner: string;
  title: string;
  description: string;
  is_public: boolean;
  settings: Record<string, unknown>;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

type CardT = {
  id: string;
  back: string;
  extra: Record<string, unknown>;
  front: string;
  deck_id: string;
  position: number;
};

type CardReview = {
  interval: number;
  efactor: number;
  repetitions: number;
  due_at: string;
};

type ContinueItem = {
  card_review: CardReview;
  card: CardT;
  deck: Deck;
};

type HomeData = {
  owned: Deck[];
  continueLearningData: ContinueItem[];
  recent: Deck[];
  stats: { cardsReviewed: number; decksCreated: number; streakDays: number };
  user: unknown;
};

type GroupedDeck = {
  deck: Deck;
  items: ContinueItem[];
  nextDueAt?: string;
  progressPct: number;
};

function SetRow({
  icon,
  title,
  meta,
  progress,
  deckId,
}: {
  icon: string;
  title: string;
  meta: string;
  progress: number;
  deckId: string;
}) {
  return (
    <Box>
      <Group wrap="nowrap" align="center" gap="md">
        <Text style={{ fontSize: 24 }}>{icon}</Text>

        <Box style={{ flex: 1 }}>
          <Text fw={500} size="sm">
            {title}
          </Text>
          <Text c="dimmed" size="xs" mt={2}>
            {meta}
          </Text>
        </Box>

        <Button
          component={Link}
          href={`/decks/${deckId}/study`}
          size="xs"
          variant="light"
          color="cyan"
        >
          Review
        </Button>
      </Group>

      <Progress value={progress} size="xs" radius="xl" mt="sm" color="cyan" />
    </Box>
  );
}

function MiniSet({
  icon,
  title,
  meta,
  href,
}: {
  icon: string;
  title: string;
  meta: string;
  href: string;
}) {
  return (
    <Card
      p="md"
      radius="md"
      withBorder
      component={Link}
      href={href}
      style={{ cursor: "pointer" }}
    >
      <Group gap="sm" wrap="nowrap">
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={500} size="sm" truncate>
            {title}
          </Text>
          <Text c="dimmed" size="xs" mt={2}>
            {meta}
          </Text>
        </Box>
      </Group>
    </Card>
  );
}

export default function Home() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: home, isLoading: homeLoading, isError } = useHome();
  const router = useRouter();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const groupedByDeck = useMemo<Record<string, GroupedDeck>>(() => {
    const source = home?.continueLearningData || [];
    const acc: Record<string, GroupedDeck> = {};

    for(const item of source) {
      const deckId = item.deck?.id
      if(!acc[deckId!]) {
        acc[deckId!] = {
          deck: item.deck as Deck,
          items: [],
          nextDueAt: item.card_review.due_at,
          progressPct: 0,
        }
      };
      acc[deckId!].items.push(item as ContinueItem);
      const current = acc[deckId!].nextDueAt!;
      if(!current || new Date(item.card_review.due_at) < new Date(current)) {
        acc[deckId!].nextDueAt = item.card_review.due_at;
      }
    }
    Object.keys(acc).forEach((deckId) => {
      const items = acc[deckId!].items;
      const sumRep = items.reduce((sum, item) => sum + (item.card_review.repetitions || 0), 0);
      const denom = items.length * 5 + sumRep;
      acc[deckId!].progressPct = Math.min(100, Math.round((sumRep / Math.max(1, denom)) * 100));
    })
    return acc
  }, [home])

  if (userLoading || homeLoading) return <Loading />;
  if (isError) {
    return (
      <Container size="lg" py="xl">
        <Text c="red">Failed to load home data</Text>
      </Container>
    );
  }
  if (!user || !home) return null;

  const handleDeckCreated = (deckId: string) => {
    router.push(`/decks/${deckId}`);
  };

  return (
    <Container size="lg" py="xl">
      <CreateDeckModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handleDeckCreated}
      />
      <Group justify="space-between" mb="xl">
        <Group gap="xs">
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--mantine-color-cyan-6)",
            }}
          />
          <Title order={3} fw={600}>Deckgen</Title>
        </Group>

        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search..."
          style={{ width: 300 }}
          radius="md"
        />

        <Group gap="xs">
          <Button component={Link} href="/docs" variant="subtle" color="gray" size="sm">
            Docs
          </Button>
          <Button component={Link} href="/templates" variant="subtle" color="gray" size="sm">
            Templates
          </Button>
          <Avatar 
            src={user.user.user_metadata?.avatar_url || undefined}
            alt={user.user.email || "user avatar"}
            radius="xl" 
            size="sm" 
            color="cyan"
          >
            {user.user.user_metadata?.full_name?.[0] || user.user.email?.[0] || "U"}
          </Avatar>
        </Group>
      </Group>

      <Stack gap="xl">
        <Box>
          <Title order={1} fw={600} mb="xs">
            Hey, {user.user.user_metadata?.full_name || user.user.email}
          </Title>
          <Text c="dimmed" size="sm">
            Ready to learn something new today?
          </Text>
        </Box>

          <Group gap="md">
            <Button
              leftSection={<IconPlus size={16} />}
              color="cyan"
              radius="md"
              onClick={() => setCreateModalOpened(true)}
            >
              Create flashcards
            </Button>
            <Button
              leftSection={<Icon3dCubeSphere size={16} />}
              variant="light"
              color="cyan"
              radius="md"
              onClick={() => router.push('/community_decks') }
            >
              Browse community decks
            </Button>
          </Group>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="xl">
                <Box>
                  <Title order={4} fw={600} mb="xs">
                    Continue learning
                  </Title>
                  <Text c="dimmed" size="sm" mb="lg">
                    Pick up where you left off
                  </Text>

                  <Stack gap="lg">
                    {home.continueLearningData.length === 0 ? (
                      <Text c="dimmed" size="sm">
                        No cards due for review. Great job! 🎉
                      </Text>
                    ) : (
                      <Accordion multiple variant="separated" radius={"md"}>
                        {Object.values(groupedByDeck).map(( { deck, items, nextDueAt, progressPct } ) => (
                          <Accordion.Item key={deck.id} value={deck.id}>
                            <Accordion.Control>
                              <Group justify="space-between" align="center" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap" align="center">
                                  <Text style={{ fontSize: 20 }}>
                                    📗
                                  </Text>
                                  <Box>
                                    <Text fw={600} size="sm">{deck.title}</Text>
                                    <Text c="dimmed" size="xs" mt={2}>
                                      {items.length} cards due • Next: {new Date(nextDueAt!).toLocaleDateString()}
                                    </Text>
                                  </Box>
                                </Group>
                                <Group gap="md" wrap="nowrap" align="center">
                                  <Progress value={progressPct} size="xs" radius={"xl"} w={140} color="cyan" />
                                  <Button
                                    size="xs"
                                    ml="md"
                                    color="cyan"
                                    variant="light"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/decks/${deck.id}/review/`)
                                    }}
                                  >
                                    Review deck
                                  </Button>
                                </Group>
                              </Group>
                            </Accordion.Control>

                            <Accordion.Panel>
                              <Stack gap="sm">
                                {items.map((item) => (
                                  <Card key={item.card.id} withBorder radius="md" p="md">
                                    <Text fw={500} size="sm">
                                      {item.card.front}
                                    </Text>
                                    <Group justify="space-between" mt="xs" align="center">
                                      <Text c="dimmed" size="xs">
                                        Due on {new Date(item.card_review.due_at).toLocaleDateString()}
                                      </Text>
                                      <Button component={Link} href={`/decks/${deck.id}/review/${item.card.id}`} size='xs' variant="light" c='cyan'>
                                        Review card
                                      </Button>
                                    </Group>
                                  </Card>
                                ))}
                              </Stack>
                            </Accordion.Panel>

                          </Accordion.Item>
                        ))}
                      </Accordion>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Title order={4} fw={600} mb="xs">
                    Recent sets
                  </Title>
                  <Text c="dimmed" size="sm" mb="lg">
                    Quick access to your latest work
                  </Text>

                  <Grid>
                    {home.owned.slice(0, 4).map((deck) => (
                      <Grid.Col span={{ base: 12, sm: 6 }} key={deck.id}>
                        <MiniSet
                          icon="📗"
                          title={deck.title}
                          meta={`Updated ${new Date(
                            deck.updated_at
                          ).toLocaleDateString()}`}
                          href={`/decks/${deck.id}`}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Box>
                    <Title order={5} fw={600} mb="xs">
                      Your stats
                    </Title>
                    <Text c="dimmed" size="xs">
                      All time
                    </Text>
                  </Box>

                  <Divider />

                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Cards reviewed
                    </Text>
                    <Text size="xl" fw={600} c="cyan">
                      {home.stats.cardsReviewed.toLocaleString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Study streak
                    </Text>
                    <Text size="xl" fw={600} c="cyan">
                      {home.stats.streakDays} days
                    </Text>
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Decks created
                    </Text>
                    <Text size="xl" fw={600} c="cyan">
                      {home.stats.decksCreated}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    );
  }