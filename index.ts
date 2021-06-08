import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import logger from './lib/winstonLogger';
import morganMiddleware from './lib/morganMiddleware';
import typeDefs from './lib/schema';
import getResolvers from './lib/resolvers';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const PORT = process.env.PORT || 4000;
const mongoClient = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();
// @ts-expect-error: I'm going to make a bold claim and say that the following type error is a bug from @types/express
app.use(morganMiddleware);
app.use(express.static('public'));

const main = async () => {
  await mongoClient.connect();
  logger.info('Connected successfully to mongo server');
  const resolvers = getResolvers(mongoClient);
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  logger.info('Apollo server started successfully');
  apolloServer.applyMiddleware({ app });
  app.listen({ port: PORT });
  logger.info(`Server ready at http://localhost:${PORT + apolloServer.graphqlPath}`);
};

try {
  main();
} catch (err) {
  logger.error(err.message);
}
