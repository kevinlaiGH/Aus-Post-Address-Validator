import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { VALIDATE_ADDRESS } from "@/lib/graphql/queries";
import { AddressFormData } from "@/app/types";

interface Locality {
  location: string;
  state: string;
  postcode: number;
  category: string;
}

interface ValidationResult {
  type: "success" | "error";
  message: string;
  suggestions?: Array<{
    suburb: string;
    postcode: number;
    state: string;
  }>;
}

const SUCCESS_MESSAGE_DURATION = 3000;

export const useAddressValidation = () => {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [validateAddress, { loading }] = useLazyQuery(VALIDATE_ADDRESS);

  const getMatchingLocality = (
    localities: Locality[],
    formData: AddressFormData
  ) => {
    const normalizedSuburb = formData.suburb.toUpperCase().trim();

    return localities.find((loc) => {
      const apiLocation = loc.location.toUpperCase().trim();
      return (
        apiLocation === normalizedSuburb &&
        loc.state === formData.state &&
        loc.postcode === parseInt(formData.postcode)
      );
    });
  };

  const getLocalitiesForPostcode = (localities: Locality[], postcode: string) =>
    localities.filter((loc) => loc.postcode === parseInt(postcode));

  const validateAddressSubmission = async (
    formData: AddressFormData
  ): Promise<boolean> => {
    try {
      const result = await validateAddress({
        variables: {
          q: formData.suburb.toUpperCase(),
          state: formData.state,
        },
      });

      const localities = (
        result.data?.searchLocalities?.localities?.locality || []
      ).filter(
        (loc: Locality): loc is Locality => loc.category !== "Post Office Boxes"
      );

      if (!localities?.length) {
        setValidationResult({
          type: "error",
          message: "❌ Address not found",
        });
        return false;
      }

      const exactMatch = localities.find(
        (loc: Locality) =>
          loc.location === formData.suburb.toUpperCase() &&
          loc.state === formData.state &&
          loc.postcode.toString() === formData.postcode
      );

      if (exactMatch) {
        setValidationResult({
          type: "success",
          message: "✅ Address is valid!",
        });
        setTimeout(() => setValidationResult(null), SUCCESS_MESSAGE_DURATION);
        return true;
      }

      const suburbsForPostcode = getLocalitiesForPostcode(
        localities,
        formData.postcode
      );
      const suggestions = localities.map((loc: Locality) => ({
        suburb: loc.location,
        postcode: loc.postcode,
        state: loc.state,
      }));

      setValidationResult(
        suburbsForPostcode.length > 0
          ? {
              type: "error",
              message: `❌ "${formData.suburb}" not found. Click a valid suburb for postcode ${formData.postcode}:`,
              suggestions,
            }
          : {
              type: "error",
              message: `❌ Suburbs not found for postcode ${formData.postcode}. Click a nearby suburb:`,
              suggestions,
            }
      );
      return false;
    } catch (error) {
      setValidationResult({
        type: "error",
        message: "Error validating address. Please try again.",
      });
      return false;
    }
  };

  return {
    validationResult,
    loading,
    validateAddressSubmission,
    setValidationResult,
  };
};
