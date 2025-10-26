import { Button, Container, Group, Text, Title } from "@mantine/core";
import classes from "./Error.module.css"
import Link from "next/link";

interface ErrorProps {
  number: number;
  message: string
}

export default function Error({ number, message }: ErrorProps) {
  const errorMessages: { [key: number]: string } = {
    400: "Bad request! The server could not understand the request! This is due to malformed syntax.",
    401: "Unauthorized! You must be authenticated to access the requested resource.",
    403: "Forbidden! You don't have permission to access the requested resource.",
    404: "Not found! The requested resource could not be found on this server.",
    500: "Internal server error! The server encountered an unexpected condition that prevented it from fulfilling the request.",
  };

  return (
    <Container className={classes.wrapper} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
      <div className={classes.label}>{number}</div>
      <Title className={classes.title}>Something went wrong...</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {errorMessages[number]}
      </Text>
      <Group justify="center">
        <Link href="/">
          <Button variant="subtle" size="md">
            Take me back to home page, pls!
          </Button>
        </Link>
      </Group>
    </Container>
  );
}
