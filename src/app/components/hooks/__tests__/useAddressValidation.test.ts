import { renderHook, act } from '@testing-library/react';
import { useAddressValidation } from '../useAddressValidation';

// Mock Apollo Client and gql
jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [
    mockValidateAddress,
    { loading: false }
  ],
  gql: (template: TemplateStringsArray) => template[0]
}));

// Mock the query import to avoid gql parsing
jest.mock('@/lib/graphql/queries', () => ({
  VALIDATE_ADDRESS: 'mocked query'
}));

const mockValidateAddress = jest.fn();

describe('useAddressValidation', () => {
  const mockFormData: AddressFormData = {
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW' as const
  };

  const mockApiResponse = {
    data: {
      searchLocalities: {
        localities: {
          locality: [
            {
              location: 'SYDNEY',
              state: 'NSW',
              postcode: 2000,
              category: 'Delivery Area'
            }
          ]
        }
      }
    }
  };

  beforeEach(() => {
    mockValidateAddress.mockReset();
  });

  it('validates matching address successfully', async () => {
    mockValidateAddress.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(mockFormData);
      expect(isValid).toBe(true);
    });

    expect(result.current.validationResult?.type).toBe('success');
    expect(result.current.validationResult?.message).toContain('valid');
  });

  it('handles non-matching addresses with suggestions', async () => {
    const nonMatchingResponse = {
      data: {
        searchLocalities: {
          localities: {
            locality: [
              {
                location: 'NORTH SYDNEY',
                state: 'NSW',
                postcode: 2060,
                category: 'Delivery Area'
              }
            ]
          }
        }
      }
    };

    mockValidateAddress.mockResolvedValue(nonMatchingResponse);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(mockFormData);
      expect(isValid).toBe(false);
    });

    expect(result.current.validationResult?.type).toBe('error');
    expect(result.current.validationResult?.message).toContain('not found');
    expect(result.current.validationResult?.suggestions).toHaveLength(1);
  });

  it('filters out PO Box localities', async () => {
    const responseWithPOBox = {
      data: {
        searchLocalities: {
          localities: {
            locality: [
              {
                location: 'SYDNEY',
                state: 'NSW',
                postcode: 2000,
                category: 'Post Office Boxes'
              },
              {
                location: 'SYDNEY',
                state: 'NSW',
                postcode: 2000,
                category: 'Delivery Area'
              }
            ]
          }
        }
      }
    };

    mockValidateAddress.mockResolvedValue(responseWithPOBox);

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      await result.current.validateAddressSubmission(mockFormData);
    });

    const suggestions = result.current.validationResult?.suggestions || [];
    expect(suggestions.every(s => s.suburb !== 'Post Office Boxes')).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    mockValidateAddress.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAddressValidation());

    await act(async () => {
      const isValid = await result.current.validateAddressSubmission(mockFormData);
      expect(isValid).toBe(false);
    });

    expect(result.current.validationResult?.type).toBe('error');
    expect(result.current.validationResult?.message).toContain('Error validating');
  });
});
