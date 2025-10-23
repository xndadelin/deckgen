"use client";

import { useState } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css"

export default function Providers(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider defaultColorScheme="dark" withGlobalClasses>
     <Notifications position="bottom-right" zIndex={1337} limit={3} />
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </MantineProvider>
  );
}
