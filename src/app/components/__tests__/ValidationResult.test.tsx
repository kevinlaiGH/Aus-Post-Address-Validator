import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ValidationResult } from '../ValidationResult';

describe('ValidationResult', () => {
  const mockSuccessResult = {
    type: 'success' as const,
    message: '✅ Address is valid!'
  };

  const mockErrorResult = {
    type: 'error' as const,
    message: '❌ Address not found',
    suggestions: [
      { suburb: 'Sydney', postcode: 2000, state: 'NSW' },
      { suburb: 'Melbourne', postcode: 3000, state: 'VIC' }
    ]
  };

  it('displays success message correctly', () => {
    render(
      <ValidationResult 
        result={mockSuccessResult}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(screen.getByText(mockSuccessResult.message)).toBeInTheDocument();
    expect(screen.getByText(mockSuccessResult.message).parentElement)
      .toHaveClass('text-green-600');
  });

  it('displays error message with suggestions', () => {
    render(
      <ValidationResult 
        result={mockErrorResult}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(screen.getByText(mockErrorResult.message)).toBeInTheDocument();
    expect(screen.getByText(mockErrorResult.message).parentElement)
      .toHaveClass('text-red-600');

    mockErrorResult.suggestions.forEach(suggestion => {
      expect(screen.getByText(`${suggestion.suburb} (${suggestion.postcode})`))
        .toBeInTheDocument();
    });
  });

  it('calls onSuggestionClick when suggestion is clicked', async () => {
    const onSuggestionClick = jest.fn();
    render(
      <ValidationResult 
        result={mockErrorResult}
        onSuggestionClick={onSuggestionClick}
      />
    );

    const firstSuggestion = screen.getByText(`${mockErrorResult.suggestions[0].suburb} (${mockErrorResult.suggestions[0].postcode})`);
    await userEvent.click(firstSuggestion);

    expect(onSuggestionClick).toHaveBeenCalledWith(mockErrorResult.suggestions[0]);
  });

  it('applies correct styling based on result type', () => {
    const { rerender } = render(
      <ValidationResult 
        result={mockSuccessResult}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(screen.getByText(mockSuccessResult.message).parentElement)
      .toHaveClass('text-green-600');

    rerender(
      <ValidationResult 
        result={mockErrorResult}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(screen.getByText(mockErrorResult.message).parentElement)
      .toHaveClass('text-red-600');
  });
});
