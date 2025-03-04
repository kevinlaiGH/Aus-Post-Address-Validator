"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/graphql/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
