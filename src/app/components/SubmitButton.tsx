interface SubmitButtonProps {
  loading: boolean;
}

export const SubmitButton = ({ loading }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={loading}
    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? "Validating..." : "Validate Address"}
  </button>
);
