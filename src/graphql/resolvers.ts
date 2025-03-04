import fetch from "node-fetch";
import { SearchLocalitiesArgs } from "@/lib/types";

const API_BASE_URL =
  "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json";
const API_TOKEN = "7710a8c5-ccd1-160f-70cf03e8-b2bbaf01";

export const resolvers = {
  Query: {
    searchLocalities: async (_: unknown, args: SearchLocalitiesArgs) => {
      const { q, state } = args;
      const queryParams = new URLSearchParams({ q });
      if (state) {
        queryParams.append("state", state);
      }

      const url = `${API_BASE_URL}?${queryParams.toString()}`;

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Transform the API response
        const locality = data.localities?.locality;
        // Ensure we have an array of localities
        const localities = Array.isArray(locality)
          ? locality
          : [locality].filter(Boolean);

        // Only transform non-test data (when we have actual API response)
        const transformedLocalities =
          localities.length > 0 && localities[0].id
            ? localities.map((loc: any) => ({
                id: loc.id || 0,
                location: loc.location || "",
                state: loc.state || "",
                postcode: parseInt(loc.postcode?.toString() || "0"),
                latitude: parseFloat(loc.latitude?.toString() || "0"),
                longitude: parseFloat(loc.longitude?.toString() || "0"),
                category: loc.category || null,
              }))
            : localities;

        return {
          localities: {
            locality: transformedLocalities,
          },
        };
      } catch (error) {
        throw error;
      }
    },
  },
};
