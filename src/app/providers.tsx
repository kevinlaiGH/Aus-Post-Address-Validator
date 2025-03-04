"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient as client } from "@/lib/graphql/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
