import { gql } from "@apollo/client";

export const typeDefs = gql`
  type Locality {
    category: String
    id: Int!
    latitude: Float
    location: String
    longitude: Float
    postcode: Int
    state: String
  }

  type LocalitiesWrapper {
    locality: [Locality]
  }

  type LocalitiesResponse {
    localities: LocalitiesWrapper
  }

  type Query {
    searchLocalities(q: String!, state: String): LocalitiesResponse
  }
`;
