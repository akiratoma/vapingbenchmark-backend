import { gql } from 'apollo-server-express';

const typeDefs = gql`

  type Device {
    _id: ID!
    deviceID: String!
    deviceName: String!
    rating: String
    reviewsCount: String
    dimensions: String
    battery: String
    wattage: String
    resistances: [String]!
    capacity: String
    material: String
    drawActivation: Boolean!
    manualActivation: Boolean!
    port: String
    urls: [String]
    previewUrl: String
  }

  type Cursor {
    nextID: ID
    data: [Device]
  }

  type Query {
    devices(ids: [String], ref: String, nextID: ID, limit: Int): Cursor!
  }

`;

export default typeDefs;
