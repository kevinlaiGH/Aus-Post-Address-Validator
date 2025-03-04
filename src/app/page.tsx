"use client";
import { useQuery } from '@apollo/client';
import { AddressForm } from "./components/AddressForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Address Validator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter an address to validate it against the Australia Post database
          </p>
        </div>
        <AddressForm />
      </div>
    </div>
  );
}
