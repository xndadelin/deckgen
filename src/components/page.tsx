import { Center, Loader, Stack, Text } from "@mantine/core"

export default function Loading () {
    return (
        <Center style={{ minHeight: '100dvh' }} aria-live="polite">
            <Stack align="center" gap="xs">
                <Loader size="lg" />
                <Text c="dimmed" size="sm">Loading...</Text>
            </Stack>
        </Center>
    )
}