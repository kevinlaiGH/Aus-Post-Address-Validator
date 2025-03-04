import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { VALIDATE_ADDRESS } from "@/lib/graphql/queries";
import {
  AddressFormData,
  AddressValidationResult,
  AddressSuggestion,
  Locality,
} from "@/lib/types";

const SUCCESS_MESSAGE_DURATION = 3000;

export const useAddressValidation = () => {
  const [validationResult, setValidationResult] =
    useState<AddressValidationResult | null>(null);
  const [validateAddress, { loading }] = useLazyQuery(VALIDATE_ADDRESS);

  const getMatchingLocality = (
    localities: Locality[],
    data: AddressFormData
  ): Locality | undefined => {
    // First filter out PO Boxes, then find matching locality
    const deliveryLocalities = localities.filter(
      (loc) => loc.category !== "Post Office Boxes"
    );

    return deliveryLocalities.find(
      (locality) =>
        locality.location.toUpperCase() === data.suburb.toUpperCase() &&
        locality.state === data.state &&
        locality.postcode.toString() === data.postcode
    );
  };

  const getSuggestions = (localities: Locality[]): AddressSuggestion[] => {
    return localities
      .filter((loc) => loc.category !== "Post Office Boxes")
      .map((locality) => ({
        suburb: locality.location,
        postcode: locality.postcode,
        state: locality.state,
      }));
  };

  const validateAddressSubmission = async (
    data: AddressFormData
  ): Promise<boolean> => {
    try {
      const response = await validateAddress({
        variables: {
          q: data.suburb,
          state: data.state,
        },
      });

      const localities: Locality[] =
        response.data?.searchLocalities?.localities?.locality || [];

      // Filter out PO Boxes first
      const deliveryLocalities = localities.filter(
        (loc) => loc.category !== "Post Office Boxes"
      );

      if (deliveryLocalities.length === 0) {
        setValidationResult({
          type: "error",
          message: "No valid delivery addresses found",
        });
        return false;
      }

      const exactMatch = getMatchingLocality(deliveryLocalities, data);

      if (exactMatch) {
        setValidationResult({
          type: "success",
          message: "Address validated successfully",
        });
        setTimeout(() => setValidationResult(null), SUCCESS_MESSAGE_DURATION);
        return true;
      }

      const suggestions = getSuggestions(deliveryLocalities);
      setValidationResult({
        type: "error",
        message: "Address not found. Did you mean one of these?",
        suggestions,
      });
      return false;
    } catch (error) {
      console.error("Error validating address:", error);
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
  };
};
