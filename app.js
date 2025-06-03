// Entry point for the modular GraphQL server
const { ApolloServer } = require('apollo-server');
const connectDatabase = require('./config/database');
const { typeDefs, resolvers } = require('./schema');
const { StudentsBySchoolIdLoader } = require('./utils/dataloader');

async function startServer() {
  await connectDatabase();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      loaders: {
        StudentsBySchoolIdLoader,
      },
    }),
  });
  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
}

startServer();
