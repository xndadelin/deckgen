"use client";

import {
  Container,
  Title,
  Box,
  Group,
  Text,
  TextInput,
  Button,
  Divider,
  Accordion,
} from "@mantine/core";
import { IconHelpCircle, IconHelpHexagon } from "@tabler/icons-react";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = {
    General: [
      {
        question: "What is DeckGen?",
        answer:
          "DeckGen is an AI-powered deck generator that helps you create flashcard decks for studying and learning",
      },
      {
        question: "How do I get started?",
        answer:
          "To get started, simply authenticate, create a deck, and off you go!",
      },
      {
        question: "Is DeckGen free to use?",
        answer:
          "Yes, DeckGen is completely free to use. This platform is open sourced and available for everyone to use and contribute to.",
      },
      {
        question: "Where can I find the source code for DeckGen?",
        answer:
          "You can find the source code for DeckGen on <a href='https://github.com/xndadelin/deckgen'>this link.</a>. You can clone the repository, contribute to the project, or even host you own instance of DeckGen!",
      },
      {
        question: "How can I contact support?",
        answer:
          "If you need assistance or have any questions, please email us at <a href='mailto:adelin@hackclub.app'>adelin@hackclub.app</a>, and I will be happy to help!",
      },
      {
        question: "How is the deck generated?",
        answer:
          "DeckGen simply uses the API from deepseek to generate decks based on your input. I did not make the AI model myself. I dont think I am that smart :)",
      },
    ],
    Features: [
      {
        question: "What features does DeckGen offer?",
        answer:
          "DeckGen offers a variety of features including: AI-powered deck generation, customizable flashcards, spaced repetition scheduling.",
      },
      {
        question: "What is spaced repetition?",
        answer:
          "Spaced repetition is a learning technique that involves reviewing information at increasing intervals to enhance long-term retention. DeckGen uses this method to help you study better.",
      },
    ],
    "Help & Support": [
      {
        question: "How can I report a bug or suggest a feature?",
        answer:
          "If you encounter a bug or have a feature suggestion, please visit our GitHub repository and open an issue. I really appreciate your feedback :3.",
      },
    ],
  };

  const allQuestions = Object.entries(faqs).flatMap(([category, items]) =>
    items.map((item) => ({
      ...item,
      category,
      questionText: item.question,
      answerText: item.answer,
    }))
  );

  const filteredQuery = allQuestions.filter((q) => {
    const query = searchQuery.toLocaleLowerCase();
    return (
      q.questionText.toLocaleLowerCase().includes(query) ||
      q.answerText.toLocaleLowerCase().includes(query)
    );
  });

  return (
    <div>
      <Container>
        <Box
          my={40}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Group
            style={{
              alignItems: "center",
            }}
          >
            <IconHelpCircle size={48} />
            <Text
              style={{
                fontSize: 48,
                fontWeight: 900,
              }}
            >
              Frequently asked questions
            </Text>
          </Group>
          <Text
            w="70%"
            style={{
              textAlign: "center",
            }}
            c="dimmed"
            fw={600}
          >
            Here are some of the most common questions about DeckGen. If you
            need further assistance, feel free to reach out!
          </Text>
          <Group mt={40}>
            <TextInput
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              w={400}
            />
            <Button
              component="a"
              href="mailto:adelin@hackclub.app"
              target="_blank"
              variant="outline"
            >
              Contact support
            </Button>
          </Group>
        </Box>
      </Container>
      <Divider my={40} />
      <Container pb={80}>
        {searchQuery ? (
          filteredQuery.length > 0 ? (
            <Accordion variant="separated" chevronPosition="right">
              {filteredQuery.map((item, index) => (
                <Accordion.Item key={index} value={item.question}>
                  <Accordion.Control>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <span>{item.questionText}</span>
                      <Text c="dimmed" size="sm" mt={2}>
                        {item.category}
                      </Text>
                    </div>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text
                      dangerouslySetInnerHTML={{ __html: item.answerText }}
                      style={{ whiteSpace: "pre-wrap" }}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          ) : (
            <Text ta="center" c="dimmed" fw={500} py={40}>
              No questions found for your search query.
            </Text>
          )
        ) : (
          Object.entries(faqs).map(([category, questions]) =>
            questions.length > 0 ? (
              <Box key={category} mb={40}>
                <Title mb={10} order={2}>
                  {category}
                </Title>
                <Accordion variant="separated" chevronPosition="right">
                  {questions.map((q, index) => (
                    <Accordion.Item key={index} value={q.question}>
                      <Accordion.Control>{q.question}</Accordion.Control>
                      <Accordion.Panel>
                        <Text
                          dangerouslySetInnerHTML={{ __html: q.answer }}
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Box>
            ) : null
          )
        )}
      </Container>
    </div>
  );
}
