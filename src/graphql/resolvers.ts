import fetch from "node-fetch";

interface SearchLocalitiesArgs {
  q: string;
  state?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

export const resolvers = {
  Query: {
    searchLocalities: async (_: unknown, args: SearchLocalitiesArgs) => {
      const { q, state } = args;
      const queryParams = new URLSearchParams({ q });

      if (state) {
        queryParams.append("state", state);
      }

      const response = await fetch(
        `${API_BASE_URL}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    },
  },
};
