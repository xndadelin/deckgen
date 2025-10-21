import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "Generate decks with AI!",
  description: "DeckGen is an AI-powered tool that helps you create flashcards for effective learning."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="dark" withGlobalClasses>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
