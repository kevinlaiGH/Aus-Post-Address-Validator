import { InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: FieldError;
  as?: 'input' | 'select';
  options?: readonly string[];
}

export const FormField = ({ 
  label, 
  error, 
  as = 'input', 
  options,
  id,
  ...props 
}: FormFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    {as === 'select' ? (
      <select
        id={id}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        {...props}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options?.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={id}
        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
        {...props}
      />
    )}
    {error && <p className="text-sm text-red-500">{error.message}</p>}
  </div>
);
