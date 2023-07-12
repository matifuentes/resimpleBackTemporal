import { gql } from 'apollo-server'

const typeDefs = gql`
  type TemporalCompany {
    _id: ID!
    rutCompany: String
    nameCompany: String
    sizeCompany: String
    rutManager: String
    nameManager: String
    emailManager: String
    validationCode: String
    trying: Int
  }

  type ReturnValidationCode {
    trying: Int
    emailManager: String
  }

  type Company {
    _id: ID!
    rutCompany: String
    nameCompany: String
    sizeCompany: String
    idRETC: String
    statusRETC: String
    statusValidationCompany: Boolean
  }

  type User {
    rutManager: String
    nameManager: String
    emailManager: String
    role: String
    status: String
  }

  type ReturnUser {
    status: String
    emailManager: String
  }

  type UserCompany {
    _id: ID!
    idUser: String
    idCompany: String
  }

  type ReturnMatch {
    match: Boolean
    trying: Int 
  }

  type ReturnLogin {
    token: String!
  }

  input DomiciliaryInput {
    codeSubCategory: String!
    nameSubCategory: String!
    codeClassificationMaterial: String!
    nameClassificationMaterial: String!
    codeMaterial: String!
    nameMaterial: String!
    fullCode: String!
    tonDangerous: Float!
    tonNotDangerous: Float!
    priceDangerous: Float!
    priceNotDangerous: Float!
  }

  input NoDomiciliaryInput {
    codeSubCategory: String!
    nameSubCategory: String!
    codeClassificationMaterial: String!
    nameClassificationMaterial: String!
    codeMaterial: String!
    nameMaterial: String!
    fullCode: String!
    tonDangerous: Float!
    tonNotDangerous: Float!
    priceDangerous: Float!
    priceNotDangerous: Float!
  }

  type BaseLine {
    _id: ID!
    rutManager: String!
    nameManager: String!
    emailManager: String!
    rutCompany: String!
    registerType: String!
    period: Int!
    pdfUrl: String
  }

  type Role {
    _id: ID!
    nameRole: String!
  }
  
  input PermissionInput {
    namePermission: String!
    uriPermission: String!
  }

  type Query {
    companyCount: Int!
    allCompanies: [Company]!
    findCompany(nameCompany: String!): [Company]
    validateCode(emailManager: String!, validationCode: String!): ReturnMatch
    login(emailManager: String!, password: String!): ReturnLogin
    companiesByUser(idUser: String!): [Company]
  }

  type Mutation {
    addUser (
      rutManager: String!
      nameManager: String!
      emailManager: String!
      role: String
    ): ReturnUser
    updateUser (
      _id: ID!
      rutManager: String
      nameManager: String
      emailManager: String
      role: String
      status: String
    ): User
    addTemporalCompany (
      rutCompany: String
      nameCompany: String
      sizeCompany: String
      rutManager: String
      nameManager: String
      emailManager: String
      password: String
    ): ReturnValidationCode
    resendValidationCode (
      emailManager: String!
    ): ReturnValidationCode
    addBaseLine (
      rutManager: String
      nameManager: String
      emailManager: String
      rutCompany: String
      registerType: String
      period: Int
      pdfUrl: String
      domiciliary: [DomiciliaryInput]
      noDomiciliary: [NoDomiciliaryInput]
    ): BaseLine
    addRole (
      nameRole: String
      permission: [PermissionInput]
    ): Role
    updateCompany (
      _id: ID!
      rutCompany: String
      nameCompany: String
      sizeCompany: String
      idRETC: String
      statusRETC: String
    ): Company
    addCompanyRS (
      rutCompany: String
      nameCompany: String
      sizeCompany: String
      idRETC: String
      statusRETC: String
      statusValidationCompany: Boolean
    ): Company
  }
`

export default typeDefs