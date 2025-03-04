import { gql } from "@apollo/client";

export const SEARCH_LOCALITIES = gql`
  query SearchLocalities($q: String!, $state: String) {
    searchLocalities(q: $q, state: $state) {
      localities {
        locality {
          category
          id
          latitude
          location
          longitude
          postcode
          state
        }
      }
    }
  }
`;
