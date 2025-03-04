import { renderHook, act } from "@testing-library/react";
import { useAddressValidation } from "../useAddressValidation";
import { AddressFormData } from "@/lib/types";

// Mock Apollo Client and gql
jest.mock("@apollo/client", () => ({
  useLazyQuery: () => [mockValidateAddress, { loading: false }],
  gql: (template: TemplateStringsArray) => template[0],
}));

// Mock the query import to avoid gql parsing
jest.mock("@/lib/graphql/queries", () => ({
  VALIDATE_ADDRESS: "mocked query",
}));

// Mock console.error to avoid polluting test output
jest.spyOn(console, "error").mockImplementation(() => {});

const mockValidateAddress = jest.fn();

describe("useAddressValidation", () => {
  const mockFormData: AddressFormData = {
    suburb: "SYDNEY",
    postcode: "2000",
    state: "NSW" as const,
  };

  const mockApiResponse = {
    data: {
      searchLocalities: {
        localities: {
          locality: [
            {
              location: "SYDNEY",
              state: "NSW",
              postcode: 2000,
              category: "Delivery Area",
            },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validates matching address successfully", async () => {
    mockValidateAddress.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(
        mockFormData
      );
      expect(isValid).toBe(true);
    });

    const { validationResult } = result.current;
    expect(validationResult?.type).toBe("success");
    expect(validationResult?.message).toContain("successfully");
  });

  it("handles non-matching addresses with suggestions", async () => {
    const nonMatchingResponse = {
      data: {
        searchLocalities: {
          localities: {
            locality: [
              {
                location: "NORTH SYDNEY",
                state: "NSW",
                postcode: 2060,
                category: "Delivery Area",
              },
            ],
          },
        },
      },
    };

    mockValidateAddress.mockResolvedValue(nonMatchingResponse);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(
        mockFormData
      );
      expect(isValid).toBe(false);
    });

    const { validationResult } = result.current;
    expect(validationResult?.type).toBe("error");
    expect(validationResult?.message).toContain("Did you mean");
    expect(validationResult?.suggestions).toHaveLength(1);
    expect(validationResult?.suggestions?.[0]).toEqual({
      suburb: "NORTH SYDNEY",
      postcode: 2060,
      state: "NSW",
    });
  });

  it("filters out PO Box localities and returns error", async () => {
    const responseWithPOBox = {
      data: {
        searchLocalities: {
          localities: {
            locality: [
              {
                location: "SYDNEY",
                state: "NSW",
                postcode: 2000,
                category: "Post Office Boxes",
              },
              {
                location: "SYDNEY",
                state: "NSW",
                postcode: 2001,
                category: "Delivery Area",
              },
            ],
          },
        },
      },
    };

    mockValidateAddress.mockResolvedValue(responseWithPOBox);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(
        mockFormData
      );
      expect(isValid).toBe(false);
    });

    const { validationResult } = result.current;
    expect(validationResult?.type).toBe("error");
    expect(validationResult?.suggestions).toHaveLength(1);
    expect(validationResult?.suggestions?.[0]).toEqual({
      suburb: "SYDNEY",
      postcode: 2001,
      state: "NSW",
    });
  });

  it("handles API errors gracefully", async () => {
    mockValidateAddress.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(
        mockFormData
      );
      expect(isValid).toBe(false);
    });

    const { validationResult } = result.current;
    expect(validationResult?.type).toBe("error");
    expect(validationResult?.message).toContain("Error validating");
  });
});
