import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FormField } from '../FormField';
import { FieldError } from 'react-hook-form';

describe('FormField', () => {
  const defaultProps = {
    label: 'Test Field',
    id: 'test',
    name: 'test',
  };

  it('renders input field with label correctly', () => {
    render(<FormField {...defaultProps} />);
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('renders select field with options when specified', () => {
    const options = ['Option 1', 'Option 2'] as const;
    render(<FormField {...defaultProps} as="select" options={options} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('displays error message when provided', () => {
    const error: FieldError = { 
      type: 'required',
      message: 'This field is required' 
    };
    render(<FormField {...defaultProps} error={error} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies placeholder text when provided', () => {
    const placeholder = 'Enter value';
    render(<FormField {...defaultProps} placeholder={placeholder} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    const onChange = jest.fn();
    render(<FormField {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test value');
    
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('test value');
  });
});
