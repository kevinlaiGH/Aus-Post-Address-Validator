"use client";
import { useQuery } from '@apollo/client';
import { SEARCH_LOCALITIES } from '@/graphql/queries';


export default function Home() {
  const { data } = useQuery(SEARCH_LOCALITIES, {
    variables: {
      q: "2000",
      state: "NSW"
    }
  });
  const localities = data?.searchLocalities?.localities?.locality || [];
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        Aus Post Address Validator
        <p>{JSON.stringify(localities)}</p>
      </main>
    </div>
  );
}
