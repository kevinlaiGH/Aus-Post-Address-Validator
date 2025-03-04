import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLazyQuery } from "@apollo/client";
import { VALIDATE_ADDRESS } from "@/graphql/queries";
import {
  AddressFormData,
  addressSchema,
  AddressValidationResult,
  AddressSuggestion,
  Locality
} from "../types";
import { useState } from "react";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"] as const;
const SUCCESS_MESSAGE_DURATION = 3000;

export function AddressForm() {
  const [validationResult, setValidationResult] = useState<AddressValidationResult>();
  const [validateAddress, { loading }] = useLazyQuery(VALIDATE_ADDRESS);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const fillAndValidateAddress = (suggestion: AddressSuggestion) => {
    setValue('suburb', suggestion.suburb);
    setValue('postcode', suggestion.postcode.toString());
    setValue('state', suggestion.state);
    handleSubmit(validateAddressSubmission)();
  };

  const getMatchingLocality = (localities: Locality[], formData: AddressFormData) => {
    const normalizedSuburb = formData.suburb.toUpperCase().trim();
    
    return localities.find(loc => {
      const apiLocation = loc.location.toUpperCase().trim();
      return apiLocation === normalizedSuburb &&
             loc.state === formData.state &&
             loc.postcode === parseInt(formData.postcode);
    });
  };

  const getLocalitiesForPostcode = (localities: Locality[], postcode: string) => {
    return localities.filter(loc => loc.postcode === parseInt(postcode));
  };

  const createSuccessResult = (): AddressValidationResult => ({
    type: 'success',
    message: "✅ Address is valid!"
  });

  const createPostcodeSuggestionsResult = (
    suburb: string,
    postcode: string,
    suggestions: AddressSuggestion[]
  ): AddressValidationResult => ({
    type: 'error',
    message: `❌ "${suburb}" not found. Click a valid suburb for postcode ${postcode}:`,
    suggestions
  });

  const createNearbySuggestionsResult = (
    postcode: string,
    suggestions: AddressSuggestion[]
  ): AddressValidationResult => ({
    type: 'error',
    message: `❌ No suburbs found for postcode ${postcode}. Click a nearby suburb:`,
    suggestions
  });

  const createErrorResult = (error: Error): AddressValidationResult => ({
    type: 'error',
    message: "Error validating address. Please try again."
  });

  const validateAddressSubmission = async (formData: AddressFormData) => {
    try {
      const result = await validateAddress({
        variables: {
          q: formData.suburb.toUpperCase(),
          state: formData.state,
        },
      });

      const localities = (result.data?.searchLocalities?.localities?.locality || [])
        .filter((loc): loc is Locality => 
          typeof loc === 'object' && 
          loc !== null && 
          'location' in loc && 
          'state' in loc && 
          'postcode' in loc &&
          loc.category !== "Post Office Boxes"
        );

      const matchingLocality = getMatchingLocality(localities, formData);

      if (matchingLocality) {
        setValidationResult(createSuccessResult());
        reset();
        setTimeout(() => setValidationResult(undefined), SUCCESS_MESSAGE_DURATION);
        return;
      }

      const suburbsForPostcode = getLocalitiesForPostcode(localities, formData.postcode);
      const suggestions = localities.map(loc => ({
        suburb: loc.location,
        postcode: loc.postcode,
        state: loc.state
      }));

      setValidationResult(
        suburbsForPostcode.length > 0
          ? createPostcodeSuggestionsResult(formData.suburb, formData.postcode, suggestions)
          : createNearbySuggestionsResult(formData.postcode, suggestions)
      );

    } catch (error) {
      setValidationResult(createErrorResult(error as Error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(validateAddressSubmission)}
      className="flex flex-col gap-4 w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="suburb" className="text-sm font-medium text-gray-700">
          Suburb
        </label>
        <input
          {...register("suburb")}
          type="text"
          id="suburb"
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
          placeholder="Enter suburb"
        />
        {errors.suburb && (
          <p className="text-sm text-red-500">{errors.suburb.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="postcode" className="text-sm font-medium text-gray-700">
          Postcode
        </label>
        <input
          {...register("postcode")}
          type="text"
          id="postcode"
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
          placeholder="Enter postcode"
        />
        {errors.postcode && (
          <p className="text-sm text-red-500">{errors.postcode.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="state" className="text-sm font-medium text-gray-700">
          State
        </label>
        <select
          {...register("state")}
          id="state"
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select state</option>
          {AUSTRALIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="text-sm text-red-500">{errors.state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Validating..." : "Validate Address"}
      </button>

      {validationResult && (
        <div className={`mt-4 text-center ${
          validationResult.type === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          <p className="mb-2">{validationResult.message}</p>
          {validationResult.suggestions && (
            <div className="flex flex-wrap gap-2 justify-center">
              {validationResult.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillAndValidateAddress(suggestion)}
                  className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
                >
                  {suggestion.suburb} ({suggestion.postcode})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
