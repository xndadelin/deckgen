import useUser from "@/utils/queries/useUser";
import Loading from "./page";
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
} from "@mantine/core";
import { IconFileUpload, IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import CreateDeckModal from "./CreateDeckModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type Deck = {
  id: string;
  owner: string;
  title: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Card = {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  position: number;
  extra: Record<string, unknown>;
  created_at?: string;
};

type ContinueItem = {
  card_review: {
    interval: number;
    efactor: number;
    repetitions: number;
    due_at: string;
  };
  card: Card | null;
  deck: { id: string; title: string; owner: string } | null;
};

type HomePayload = {
  user: User | null;
  owned: Deck[],
  continueLearning: ContinueItem[],
  recent: Deck[],
  stats: {
    cardsReviewed: number;
  }
}

function SetRow({
  icon,
  title,
  meta,
  progress,
}: {
  icon: string;
  title: string;
  meta: string;
  progress: number;
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

        <Button size="xs" variant="light" color="cyan">
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
}: {
  icon: string;
  title: string;
  meta: string;
}) {
  return (
    <Card p="md" radius="md" withBorder>
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
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  const [createModalOpened, setCreateModalOpened] = useState(false);

  if (isLoading) return <Loading />;
  if (!user) return null;

  const handleDeckCreated = (deckId: string) => {
    router.push(`/decks/${deckId}`);
  }

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
          <Title order={3} fw={600}>
            Deckgen
          </Title>
        </Group>

        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search..."
          style={{ width: 300 }}
          radius="md"
        />

        <Group gap="xs">
          <Button
            component={Link}
            href="/docs"
            variant="subtle"
            color="gray"
            size="sm"
          >
            Docs
          </Button>
          <Button
            component={Link}
            href="/templates"
            variant="subtle"
            color="gray"
            size="sm"
          >
            Templates
          </Button>
          <Avatar
            src={user.user.user_metadata?.avatar_url || undefined}
            alt={user.user.email || "user avatar"}
            radius="xl"
            size="sm"
            color="cyan"
          >
            {user.user.user_metadata?.full_name?.[0] ||
              user.user.email?.[0] ||
              "U"}
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
          <Button onClick={() => {
            setCreateModalOpened(true);
          }} leftSection={<IconPlus size={16} />} color="cyan" radius="md">
            Create flashcards
          </Button>
          <Button
            leftSection={<IconFileUpload size={16} />}
            variant="light"
            color="cyan"
            radius="md"
          >
            Import from PDF
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
                  <SetRow
                    icon="📘"
                    title="Calculus - Integration basics"
                    meta="25/30 cards due"
                    progress={83}
                  />
                  <SetRow
                    icon="🧬"
                    title="Biology - Cell structure"
                    meta="12/20 cards due"
                    progress={60}
                  />
                  <SetRow
                    icon="🌍"
                    title="Geography - World capitals"
                    meta="8/15 cards due"
                    progress={53}
                  />
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
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <MiniSet
                      icon="📗"
                      title="Spanish Vocabulary"
                      meta="Edited 2 hours ago"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <MiniSet
                      icon="💻"
                      title="JavaScript Fundamentals"
                      meta="Edited yesterday"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <MiniSet
                      icon="🎨"
                      title="Art History Timeline"
                      meta="Edited 3 days ago"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <MiniSet
                      icon="⚛️"
                      title="Chemistry Elements"
                      meta="Edited 5 days ago"
                    />
                  </Grid.Col>
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
                    This week
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Cards reviewed
                  </Text>
                  <Text size="xl" fw={600} c="cyan">
                    1,247
                  </Text>
                </Box>

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Study streak
                  </Text>
                  <Text size="xl" fw={600} c="cyan">
                    7 days
                  </Text>
                </Box>

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Decks created
                  </Text>
                  <Text size="xl" fw={600} c="cyan">
                    12
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
