import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressFormData, addressSchema } from "../types";
import { ValidationResult } from "./ValidationResult";
import { useAddressValidation } from "./hooks/useAddressValidation";
import { AddressFormFields } from "./AddressFormFields";
import { SubmitButton } from "./SubmitButton";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"] as const;

export function AddressForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const { 
    validationResult, 
    loading, 
    validateAddressSubmission 
  } = useAddressValidation();

  const handleValidation = async (formData: AddressFormData) => {
    const isValid = await validateAddressSubmission(formData);
    if (isValid) reset();
  };

  const handleSuggestionClick = (suggestion: { suburb: string; postcode: number; state: string }) => {
    setValue('suburb', suggestion.suburb);
    setValue('postcode', suggestion.postcode.toString());
    setValue('state', suggestion.state);
    handleSubmit(handleValidation)();
  };

  return (
    <form
      onSubmit={handleSubmit(handleValidation)}
      className="flex flex-col gap-4 w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
    >
      <AddressFormFields register={register} errors={errors} />
      <SubmitButton loading={loading} />
      {validationResult && (
        <ValidationResult 
          result={validationResult}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </form>
  );
}
