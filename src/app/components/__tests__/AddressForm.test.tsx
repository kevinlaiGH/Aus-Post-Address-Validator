import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AddressForm } from '../AddressForm';
import { useAddressValidation } from '../hooks/useAddressValidation';
import { MockedProvider } from '@apollo/client/testing';

// Mock the custom hook
jest.mock('../hooks/useAddressValidation');
const mockUseAddressValidation = useAddressValidation as jest.Mock;

describe('AddressForm', () => {
  const mockValidationResult = {
    type: 'success' as const,
    message: '✅ Address is valid!'
  };

  const defaultHookReturn = {
    validationResult: null,
    loading: false,
    validateAddressSubmission: jest.fn().mockResolvedValue(true),
    setValidationResult: jest.fn()
  };

  beforeEach(() => {
    mockUseAddressValidation.mockReturnValue(defaultHookReturn);
  });

  it('renders all form fields', () => {
    render(
      <MockedProvider>
        <AddressForm />
      </MockedProvider>
    );

    expect(screen.getByLabelText(/suburb/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const { validateAddressSubmission } = defaultHookReturn;
    render(
      <MockedProvider>
        <AddressForm />
      </MockedProvider>
    );

    await userEvent.type(screen.getByLabelText(/suburb/i), 'Sydney');
    await userEvent.type(screen.getByLabelText(/postcode/i), '2000');
    await userEvent.selectOptions(screen.getByLabelText(/state/i), 'NSW');
    
    await userEvent.click(screen.getByRole('button', { name: /validate/i }));

    await waitFor(() => {
      expect(validateAddressSubmission).toHaveBeenCalledWith({
        suburb: 'Sydney',
        postcode: '2000',
        state: 'NSW'
      });
    });
  });

  it('displays validation result when available', () => {
    mockUseAddressValidation.mockReturnValue({
      ...defaultHookReturn,
      validationResult: mockValidationResult
    });

    render(
      <MockedProvider>
        <AddressForm />
      </MockedProvider>
    );

    expect(screen.getByText(mockValidationResult.message)).toBeInTheDocument();
  });

  it('shows loading state during validation', () => {
    mockUseAddressValidation.mockReturnValue({
      ...defaultHookReturn,
      loading: true
    });

    render(
      <MockedProvider>
        <AddressForm />
      </MockedProvider>
    );

    expect(screen.getByText(/validating/i)).toBeInTheDocument();
  });

  it('handles validation errors correctly', async () => {
    const errorMessage = 'Invalid address';
    mockUseAddressValidation.mockReturnValue({
      ...defaultHookReturn,
      validationResult: {
        type: 'error' as const,
        message: errorMessage
      }
    });

    render(
      <MockedProvider>
        <AddressForm />
      </MockedProvider>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
