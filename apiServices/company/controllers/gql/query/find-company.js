import Company from '../../../models/Company.js'

const controllerFindCompany = async (root, args) => {
  const { nameCompany } = args
  return Company.find({ nameCompany })
}

export default controllerFindCompany