const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema
} = graphql;

// Esquema de Usuario que representa el modelo que tenemos en base de datos
// Esto le brinda a GraphQL la posibilidad de conocer el objecto y sus propiedades
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt }
  }
});

// El proposito de este objeto es brindarle a GraphQL una especie de punto de entrada para que pueda buscar la informacion
// El metodo 'resolve()' es la funcion que en realidad conecta con nuestra base de datos
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        // Usando lodash: return _.find(users, { id: args.id });
        // No necesito usar lodash, puedo ecribir esta linea asi: 'return users.find((x) => { return x.id === args.id; });'
        return axios.get(`http://localhost:3000/users/${args.id}`)
          // Aqui axios acumula toda las data en un objeto llamado data detro de la respuesta, pero GraphQL no sabe eso,
          // entonces utilizamos 'response => response.data' para que lo que se le pasa a GraphQL sea la data en cuestion y no la respuesta
          .then(response => response.data);
      }
    }
  }
});

// GraphQLSchema toma un RootQuery y devuelve una instancia de GraphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery
});