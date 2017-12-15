const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema
} = graphql;


const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
});

// Esquema de Usuario que representa el modelo que usamos en GraphQL
// Esto le brinda a GraphQL la posibilidad de conocer el objecto, sus propiedades y relalciones
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
    // Aqui usamos el metodo resolve() para instruir GraphQL donde encontrar la data para poblar este campo
    // En este caso resolve(), lo que hace es recorrer la relacion entre User y Company
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(response => response.data)
      }
    }
  }
});

// El proposito de este objeto es brindarle a GraphQL una especie de punto de entrada para que pueda buscar la informacion
// El metodo 'resolve()' es la funcion que en realidad conecta con nuestra base de datos o conecta con una api externa
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
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(res => res.data);
      }
    }
  }
});

// GraphQLSchema toma un RootQuery y devuelve una instancia de GraphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery
});