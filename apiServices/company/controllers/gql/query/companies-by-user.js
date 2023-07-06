import UserCompany from "../../../models/User-Company.js";
import Company from "../../../models/Company.js";

const controllerCompaniesByUser = async (root, args) => {
  const { idUser } = args

  const arrCompaniesByUser = await UserCompany.find({ idUser });

  const arrIdsCompanies = arrCompaniesByUser.map(company =>
    company.idCompany
  );

  const arrCompanies = await Company.find({ _id: { $in: arrIdsCompanies } });

  return arrCompanies
}

export default controllerCompaniesByUser