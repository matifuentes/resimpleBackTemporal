// * DB Connect
import { } from '../../db.js'

// * Query Controllers
import controllerAllCompanies from './controllers/gql/query/all-companies.js'
import controllerCompaniesByUser from './controllers/gql/query/companies-by-user.js'
import controllerCompanyCount from './controllers/gql/query/company-count.js'
import controllerFindCompany from './controllers/gql/query/find-company.js'
import controllerLogin from './controllers/gql/query/login.js'
import controllerValidateCode from './controllers/gql/query/validate-code.js'

// * Mutation Controllers
import controllerAddBaseLine from './controllers/gql/mutation/add-base-line.js'
import controllerAddRole from './controllers/gql/mutation/add-role.js'
import controllerAddTemporalCompany from './controllers/gql/mutation/add-temporal-company.js'
import controllerResendValidationCode from './controllers/gql/mutation/resend-validation-code.js'
import controllerUpdateCompany from './controllers/gql/mutation/update-company.js'

const resolvers = {
  Query: {
    companyCount: controllerCompanyCount,
    allCompanies: controllerAllCompanies,
    findCompany: controllerFindCompany,
    companiesByUser: controllerCompaniesByUser,
    validateCode: controllerValidateCode,
    login: controllerLogin
  },

  Mutation: {
    addRole: controllerAddRole,
    addBaseLine: controllerAddBaseLine,
    resendValidationCode: controllerResendValidationCode,
    addTemporalCompany: controllerAddTemporalCompany,
    updateCompany: controllerUpdateCompany
  }
};

export default resolvers