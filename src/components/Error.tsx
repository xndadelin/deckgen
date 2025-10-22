import { Button, Container, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ErrorProps {
    number: number;
    message?: string;
}

export default function Error({ number, message }: ErrorProps) {
    const router = useRouter();
    const errorMessages: { [key: number]: string } = {
        400: "Bad request! The server somehow could not understand the request! This is mostly a problem on our end.",
        401: "Unauthorized! You have to be authenticated to access this resource lol.",
        403: "Forbidden! Hmm, you do not have permission to access this resource.",
        404: "Not found! The resource you requested could not be found on the server.",
        500: "Internal server error! Oh no, something went wrong very badly on our end. We are fixing this ASAP! Or at least we hope so."
    }

    return (
        <Container>
            <div>{number}</div>
            <Title>Something went wrong...</Title>
            <Text c="dimmed" size="lg" ta="center">
                {message || errorMessages[number] || 'An unexpected error occured.'}
            </Text>
            <Group justify="center" mt='xl'>
                <Button onClick={() => router.back()} variant="subtle">
                    Take me back!
                </Button>
            </Group>
        </Container>
    )

}