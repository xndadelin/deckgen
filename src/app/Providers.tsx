"use client";

import { useState } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider defaultColorScheme="dark" withGlobalClasses>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </MantineProvider>
  );
}
