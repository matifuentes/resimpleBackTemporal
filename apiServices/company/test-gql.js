import { ApolloServer } from 'apollo-server'

// * typeDefs
import typeDefs from './type-defs.js';

// * resolvers
import resolvers from './resolvers.js';

// * Obtener usuario por JWT
import getUser from '../../middleware/validate-token.js'

// * Crear servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.get('Authorization') || '';
    const splitedToken = token.split(" ");
    if (splitedToken[0].toLowerCase() != 'bearer') {
      return null;
    }

    return { user: getUser(splitedToken[1]) }
  }
});

// * Inicializar servidor

server.listen({ port: process.env.PORT || 4002 }).then(({ url }) => {
  console.log(`Servidor listo en ${url}`);
});

