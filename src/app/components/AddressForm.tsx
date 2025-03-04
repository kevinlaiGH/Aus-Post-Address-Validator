import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressFormData, addressSchema } from "@/lib/types";
import { ValidationResult } from "./ValidationResult";
import { useAddressValidation } from "./hooks/useAddressValidation";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"] as const;

export function AddressForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange"
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
      <FormField
        {...register('suburb')}
        label="Suburb"
        id="suburb"
        placeholder="Enter suburb"
        error={errors.suburb}
      />

      <FormField
        {...register('postcode')}
        label="Postcode"
        id="postcode"
        placeholder="Enter postcode"
        error={errors.postcode}
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength={4}
      />

      <FormField
        {...register('state')}
        as="select"
        label="State"
        id="state"
        options={AUSTRALIAN_STATES}
        error={errors.state}
      />

      <SubmitButton loading={loading} control={control} />

      {validationResult && (
        <ValidationResult
          result={validationResult}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </form>
  );
}
