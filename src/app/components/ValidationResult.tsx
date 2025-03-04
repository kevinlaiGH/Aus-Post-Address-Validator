import { AddressValidationResult, AddressSuggestion } from "../types";

interface ValidationResultProps {
  result: AddressValidationResult;
  onSuggestionClick: (suggestion: AddressSuggestion) => void;
}

export const ValidationResult = ({ result, onSuggestionClick }: ValidationResultProps) => (
  <div className={`mt-4 text-center ${
    result.type === 'success' ? 'text-green-600' : 'text-red-600'
  }`}>
    <p className="mb-2">{result.message}</p>
    {result.suggestions && (
      <div className="flex flex-wrap gap-2 justify-center">
        {result.suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.suburb}-${suggestion.postcode}`}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
          >
            {suggestion.suburb} ({suggestion.postcode})
          </button>
        ))}
      </div>
    )}
  </div>
);
