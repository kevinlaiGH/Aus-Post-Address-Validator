import React from 'react';
import { useFormState, Control } from 'react-hook-form';
import { AddressFormData } from '@/lib/types';

interface SubmitButtonProps {
  loading: boolean;
  control: Control<AddressFormData>;
}

export const SubmitButton = ({ loading, control }: SubmitButtonProps) => {
  const { isValid, isDirty } = useFormState({
    control
  });

  return (
    <button
      type="submit"
      disabled={loading || !isValid || !isDirty}
      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Validating..." : "Validate Address"}
    </button>
  );
};
