const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;


const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        .then(resp => resp.data);
      }
    }
  })
});

// Esquema de Usuario que representa el modelo que usamos en GraphQL
// Esto le brinda a GraphQL la posibilidad de conocer el objecto, sus propiedades y relaciones
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
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
  })
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
          .then(resp => resp.data);
      }
    }
  }
});


// El proposito de este objecto es actuar como enlace para cualquier modificacion de los datos que tenemos en base de datos,
// ya sea agregar, borrar, modificar, etc.
// Cada uno de los campos dentro de la propiedad 'fields' es una operacion distinta.
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      // Especificamos el tipo que sera devuelto al completar la operacion.
      // Este tipo puede no tiene porque ser el mismo que el del objecto que estamos manipulando.
      type: UserType,
      args: {
        // NonNull es una validacion.
        // Este metodo es un helper para asegurar que el objeto que estamos por insertar contiene un valor en esa propiedad 
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post(`http://localhost:3000/users`, { firstName, age })
          .then(resp => resp.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        return axios.delete(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        // En caso de editar en un objeto nos conviene usar 'args' ya que le pasamos todos los campos que lleguen a el editar
        // Si no tubieramos un companyId, simplemente no sera incluido en el objeto
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(resp => resp.data);
      }
    }
  }
});


// GraphQLSchema toma un RootQuery y devuelve una instancia de GraphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});