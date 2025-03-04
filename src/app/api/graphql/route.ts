import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { NextRequest } from "next/server";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

if (!process.env.API_TOKEN) {
  throw new Error("API_TOKEN is not defined");
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export async function POST(req: NextRequest) {
  try {
    return await handler(req);
  } catch (error) {
    console.error("GraphQL Error:", error);
    return new Response(
      JSON.stringify({
        errors: [{ message: "Internal server error" }],
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
}
