'use client'
import { useState } from "react";
import {
    Modal, TextInput, Textarea, Button, Stack, Group, Text, NumberInput, Switch, Box, Progress, Alert
} from "@mantine/core";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form"

interface CreateDeckModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: (deckId: string) => void;
}

export default function CreateDeckModal({
    opened, onClose, onSuccess
} : CreateDeckModalProps ) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            content: '',
            cardCount: 10,
            isPublic: false
        }
    });

    const handleCreateDeck = async () => {
        if(!form.values.title.trim() || !form.values.content.trim()) {
            notifications.show({
                title: 'Error',
                message: 'Title & content are required',
                color: 'red',
                icon: <IconAlertCircle />
            })
            return;
        }
        setLoading(true);
        setProgress(10);
        try {
            const response = await fetch('/api/decks/create', {
                method: 'POST',
                headers : {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: form.values.title,
                    description: form.values.description,
                    content: form.values.content,
                    cardCount: form.values.cardCount,
                    isPublic: form.values.isPublic
                })
            })
            setProgress(50);
            if(!response.ok) {
                const data = await response.json();
                notifications.show({
                    title: 'Error',
                    message: data.error || 'failed to create deck',
                    color: 'red',
                    icon: <IconAlertCircle />
                });
                return ;
            }
            const data = await response.json();
            setProgress(100);
            
            form.reset();
            onSuccess?.(data.deckId)
            onClose();
            notifications.show({
                title: 'Success',
                message: "Deck created successfully!",
                color: 'green',
                icon: <IconSparkles />
            });
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'an unexpcted error occured',
                color: 'red',
                icon: <IconAlertCircle />
            })
        } finally {
            setLoading(false);
        }
    
    }

    const handleClose = () => {
        if(!loading) {
            form.reset();
            setProgress(0);
            onClose();
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={() => handleClose()}
            title={
                <Group gap={"xs"}>
                    <IconSparkles size={20} color="var(--mantine-color-cyan-6)" />
                    <Text fw={600}>Generate flashcards</Text>
                </Group>
            }
            size="lg"
            radius="md"
            centered
        >
            <form onSubmit={handleCreateDeck}>
                <Stack gap="md">
                    <TextInput
                        label="Deck title"
                        placeholder=".e.g., Calculus - Feynman technique"
                        disabled={loading}
                        required
                        radius="md"
                        {...form.getInputProps('title')}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Paste your text, notes, or lecture materials here."
                        disabled={loading}
                        required
                        radius={"md"}
                        rows={8}
                        description="Minimum 100 characters recommended."
                        {...form.getInputProps('content')}
                    />

                    <NumberInput
                        label="Number of flashcards to generate"
                        min={5}
                        max={50}
                        disabled={loading}
                        radius="md"
                        {...form.getInputProps('cardCount')}
                    />

                    <Switch
                        label="Make this deck public"
                        description="Allow other users to view and use this deck."
                        disabled={loading}
                        color="cyan"
                        {...form.getInputProps('isPublic', {
                            type: 'checkbox'
                        })}
                    />
                    {loading && (
                        <Box>
                            <Text size="xs" c="dimmed" mb={4}>
                                Generating flashcards...
                            </Text>
                            <Progress value={progress} color="cyan" radius="xl" size="sm" />
                        </Box>
                    )}

                    <Group justify="flex-end" mt="md" gap={"xs"}>
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={handleClose}
                            disabled={loading}
                            radius="md"
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="cyan"
                            type="submit"
                            loading={loading}
                            leftSection={<IconSparkles size={16} />}
                            radius={"md"}
                        >
                            Generate
                        </Button>
                    </Group>

                </Stack>
            </form>

        </Modal>
    )

}