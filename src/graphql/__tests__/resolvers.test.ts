import { resolvers } from "../resolvers";
import fetch from "node-fetch";

// Mock fetch
jest.mock("node-fetch", () => jest.fn());

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("Resolvers", () => {
  describe("searchLocalities", () => {
    beforeEach(() => {
      mockedFetch.mockClear();
      mockedFetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ localities: [] })
        } as any)
      );
    });

    it("should construct correct URL with q parameter only", async () => {
      await resolvers.Query.searchLocalities(null, { q: "2000" });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining("q=2000"),
        expect.any(Object)
      );
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.not.stringContaining("state="),
        expect.any(Object)
      );
    });

    it("should construct correct URL with both q and state parameters", async () => {
      await resolvers.Query.searchLocalities(null, { q: "2000", state: "NSW" });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining("q=2000"),
        expect.any(Object)
      );
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining("state=NSW"),
        expect.any(Object)
      );
    });

    it("should include correct authorization header", async () => {
      await resolvers.Query.searchLocalities(null, { q: "2000" });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
    });

    it("should throw error when API returns non-ok response", async () => {
      mockedFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({})
        } as any)
      );

      await expect(
        resolvers.Query.searchLocalities(null, { q: "2000" })
      ).rejects.toThrow("API request failed with status 404");
    });

    it("should return parsed JSON response on success", async () => {
      const mockData = {
        localities: {
          locality: [{ location: "Sydney", state: "NSW", postcode: "2000" }],
        },
      };
      
      mockedFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData)
        } as any)
      );

      const result = await resolvers.Query.searchLocalities(null, {
        q: "2000",
      });

      expect(result).toEqual(mockData);
    });
  });
});
