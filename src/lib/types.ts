import { z } from "zod";

export const addressSchema = z.object({
  postcode: z
    .string()
    .min(4, "Postcode must be 4 digits")
    .max(4, "Postcode must be 4 digits")
    .regex(/^\d+$/, "Postcode must be numeric"),
  suburb: z
    .string()
    .min(2, "Suburb must be at least 2 characters")
    .max(50, "Suburb must be less than 50 characters"),
  state: z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"], {
    errorMap: () => ({ message: "Please select a valid state" }),
  }),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export interface AddressValidationResult {
  type: "success" | "error";
  message: string;
  suggestions?: AddressSuggestion[];
}

export interface AddressSuggestion {
  suburb: string;
  postcode: number;
  state: string;
}

export interface Locality {
  location: string;
  state: string;
  postcode: number;
  category: string;
}

export interface SearchLocalitiesArgs {
  q: string;
  state?: string;
}
