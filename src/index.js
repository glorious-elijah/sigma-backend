import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { PropertyResolver } from './schema/resolvers/PropertyResolver';
import { UserResolver } from './schema/resolvers/UserResolver';
import { authChecker } from './utils/authChecker';

const prisma = new PrismaClient();

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [PropertyResolver, UserResolver],
    authChecker,
    validate: true,
  });

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const user = token ? await verifyToken(token) : null;
      return { prisma, user };
    },
    listen: { port: parseInt(process.env.PORT || '4000') },
  });

  console.log(`🚀 Server ready at ${url}`);
}

bootstrap().catch((error) => {
  console.error('Error starting the server:', error);
  process.exit(1);
});
