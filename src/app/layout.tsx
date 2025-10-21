import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
