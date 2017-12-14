const graphql = require('graphql');
const _ = require('lodash');
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
        // No necesito usar lodash, puedo ecribir esta linea asi: 'users.find((x) => { return x.id === args.id; });'
        return _.find(users, { id: args.id });
      }
    }
  }
});

// GraphQLSchema toma un RootQuery y devuelve una instancia de GraphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery
});