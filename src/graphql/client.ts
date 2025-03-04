import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "/api/graphql",
  credentials: "same-origin",
});

const errorLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    return response;
  });
});

export const apolloClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
    },
  },
});
