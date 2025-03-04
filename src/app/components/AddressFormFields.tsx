import { FormField } from './FormField';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddressFormData } from '../types';

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"] as const;

const FORM_FIELDS = [
  {
    name: 'suburb' as const,
    label: 'Suburb',
    placeholder: 'Enter suburb',
    type: 'text'
  },
  {
    name: 'postcode' as const,
    label: 'Postcode',
    placeholder: 'Enter postcode',
    type: 'text'
  },
  {
    name: 'state' as const,
    label: 'State',
    type: 'select',
    options: AUSTRALIAN_STATES
  }
] as const;

interface AddressFormFieldsProps {
  register: UseFormRegister<AddressFormData>;
  errors: FieldErrors<AddressFormData>;
}

export const AddressFormFields = ({ register, errors }: AddressFormFieldsProps) => (
  <>
    {FORM_FIELDS.map(({ name, label, placeholder, type, options }) => (
      <FormField
        key={name}
        {...register(name)}
        label={label}
        id={name}
        placeholder={placeholder}
        as={type === 'select' ? 'select' : 'input'}
        options={options}
        error={errors[name]}
      />
    ))}
  </>
);
