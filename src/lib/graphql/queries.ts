import { gql } from "@apollo/client";

export const VALIDATE_ADDRESS = gql`
  query ValidateAddress($q: String!, $state: String) {
    searchLocalities(q: $q, state: $state) {
      localities {
        locality {
          id
          location
          state
          postcode
        }
      }
    }
  }
`;
