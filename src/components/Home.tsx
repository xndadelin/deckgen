import useUser from "@/utils/queries/useUser";
import Loading from "./page";
import {
  Container,
  Group,
  Box,
  Avatar,
  TextInput,
  Button,
  Badge,
  Title,
  Text,
  Stack,
  Grid,
  Card,
  Progress,
  Paper,
  Anchor,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { IconFileUpload, IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { Divide } from "lucide-react";

function SetRow({
  icon,
  title,
  meta,
  progress,
  accent,
}: {
  icon: string;
  title: string;
  meta: string;
  progress: number;
  accent: string;
}) {
  return (
    <Group wrap="nowrap" align="center">
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          border: "1px solid var(--mantine-color-dark-5)",
          background: "var(--mantine-color-dark-7",
          fontSize: 18,
        }}
      >
        {icon}
      </Box>

      <Box style={{ flex: 1 }}>
        <Group justify="space-between" align="center">
          <Text fw={600}>{title}</Text>
          <Text c="dimmed" fz="xs">
            {meta}
          </Text>
        </Group>
        <Progress
          value={progress}
          size="sm"
          radius="xl"
          mt={6}
          color="cyan"
          style={{
            border: "1px solid var(--mantine-color-dark-5)",
          }}
        />
      </Box>
      <Button color={accent}>Review</Button>
    </Group>
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
    <Group
      p="sm"
      gap="sm"
      style={{
        border: "1px solid var(--mantine-color-dark-5)",
        borderRadius: 12,
      }}
    >
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          border: "1px solid var(--mantine-color-dark-5)",
          background: "var(--mantine-color-dark-5)",
          fontSize: 18,
        }}
      >
        {icon}
      </Box>
      <Box style={{ flex: 1 }}>
        <Text fw={600}>{title}</Text>
        <Text c="dimmed" fz="xs">
          {meta}
        </Text>
      </Box>
    </Group>
  );
}

function TemplateRow({ label, pill }: { label: string; pill: string }) {
  <Group
    p="sm"
    justify="space-between"
    style={{
      border: "1px solid var(--mantine-color-dark-5)",
      borderRadius: 12,
    }}
  >
    <Group gap="sm">
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          border: "1px solid var(--mantine-color-dark-5)",
          background: "var(--mantine-color-dark-7)",
          fontSize: 18,
          color: "var(--mantine-color-cyan-5)",
        }}
      >
        📗
      </Box>
      <Text fw={600}>{label}</Text>
    </Group>
    <Badge variant="light" color="gray">
      {pill}
    </Badge>
  </Group>;
}

export default function Home() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <Loading />;
  if (!user) return null;

  return (
    <Container
      size="lg"
      p="md"
      style={{
        minHeight: "100dvh",
      }}
    >
      <Group justify="space-between" wrap="wrap" gap={"md"} mb={"lg"}>
        <Group gap="xs">
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "var(--mantine-color-cyan-6)",
            }}
          />
          <Title order={4}>Deckgen</Title>
        </Group>

        <TextInput
          leftSection={<IconSearch size={18} />}
          placeholder="Search sets, tags, templates..."
          style={{
            flexGrow: 1,
          }}
          variant="filled"
        />

        <Group gap="xs">
          <Button component={Link} href="/docs" variant="light">
            Docs
          </Button>
          <Button component={Link} href="/templates" variant="filed">
            Templates
          </Button>
          <Avatar
            src={user.user.user_metadata?.avatar_url || undefined}
            alt={user.user.email || "user avatar"}
            radius={"xl"}
          />
        </Group>
      </Group>

      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{
          backdropFilter: "saturate(120%)",
        }}
      >
        <Grid align="center">
          <Grid.Col
            span={{
              base: 12,
              md: 8,
            }}
          >
            <Stack gap="xs">
              <Badge variant="light" color="gray" radius={"sm"} size="lg">
                Welcome back!
              </Badge>
              <Title
                order={2}
                style={{
                  lineHeight: 1.1,
                }}
              >
                Hey, {user.user.user_metadata?.full_name || user.user.email},
                are you ready to learn something new today?
              </Title>

              <Box
                style={{
                  height: 3,
                  width: "100%",
                  borderRadius: 6,
                  background: "var(--mantine-color-cyan-6)",
                }}
              />

              <Group gap="sm" mt="md">
                <Badge variant="outline" color="gray">
                  🔥 3 days streak
                </Badge>
                <Badge variant="outline" color="gray">
                  🃏 1200 cards reviewed
                </Badge>
                <Badge variant="outline" color="gray">
                  📚 decks created
                </Badge>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col
            span={{
              base: 12,
              md: 4,
            }}
          >
            <Stack>
              <Button
                leftSection={<IconPlus size={18} />}
                color="cyan"
                variant="filled"
              >
                Create flashcards
              </Button>
              <Button
                leftSection={<IconFileUpload size={18} />}
                variant="light"
                color="indigo"
              >
                Import from text / PDF
              </Button>
              <Button variant="light" component={Link} href="/templates">
                Browse some tamples
              </Button>
            </Stack>
          </Grid.Col>
          <Grid gutter="md" mb="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{
                  marginTop: 12,
                }}
              >
                <Title order={4}>Continue learning</Title>
                <Text c="dimmed" fz="sm" mb={"md"}>
                  Pick up where you left off
                </Text>

                <SetRow
                  icon={"➕"}
                  title="Calculus - Integration basics"
                  meta="25/26 due"
                  progress={62}
                  accent="cyan"
                />
                <Divider my="sm" variant="dashed" />
                <SetRow
                  icon={"➕"}
                  title="Calculus - Integration basics"
                  meta="25/26 due"
                  progress={62}
                  accent="cyan"
                />
                <Divider my="sm" variant="dashed" />
                <SetRow
                  icon={"➕"}
                  title="Calculus - Integration basics"
                  meta="25/26 due"
                  progress={62}
                  accent="cyan"
                />
              </Card>
              <Card withBorder radius="lg" p="lg" mb="md">
                <Title order={4}>Your recent sets</Title>
                <Text c="dimmed" fz="sm" mb="md">
                  Quick access to the latest you edited.
                </Text>

                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <MiniSet
                      icon={"📘"}
                      title="Calculus - Integration basics"
                      meta="Edited 2 days ago"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <MiniSet
                      icon={"📘"}
                      title="Calculus - Integration basics"
                      meta="Edited 2 days ago"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <MiniSet
                      icon={"📘"}
                      title="Calculus - Integration basics"
                      meta="Edited 2 days ago"
                    />
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
