import TemporalCompany from "../../../models/TemporalCompany.js"
import Company from "../../../models/Company.js"
import User from "../../../models/User.js"
import UserCompany from "../../../models/User-Company.js"

const controllerValidateCode = async (root, args) => {
  const { emailManager, validationCode } = args

  try {
    const dataTemporalCompany = await TemporalCompany.findOne({ emailManager: emailManager.toLowerCase() })
    if (!dataTemporalCompany) {
      throw new Error('Email no encontrado')
    }

    if (dataTemporalCompany.trying == 0) {
      throw new Error('No tienes más intentos disponibles');
    }

    if (validationCode !== dataTemporalCompany.validationCode) {
      const tries = dataTemporalCompany.trying > 0 ? dataTemporalCompany.trying - 1 : dataTemporalCompany.trying
      const filter = { _id: dataTemporalCompany._id }
      const update = { trying: tries }

      await TemporalCompany.findOneAndUpdate(filter, update, {
        returnOriginal: false
      })

      return {
        match: false,
        trying: tries
      };
    } else {

      // * La data coincide, realizo una inserción en la tabla Company

      const { rutCompany, nameCompany, sizeCompany, rutManager, nameManager, emailManager, password } = dataTemporalCompany
      const company = new Company({ rutCompany, nameCompany, sizeCompany })
      const user = new User({ rutManager, nameManager, emailManager: emailManager.toLowerCase(), password })

      const existEmailUser = await User.findOne({ emailManager: emailManager.toLowerCase() })
      if (existEmailUser) {
        throw new Error('El email ya está registrado')
      }

      // * Creación de User y Company y User-Company
      const newUser = await user.save()
      const newCompany = await company.save()

      if (newCompany && newUser) {
        // * Borrar registro en Temporal Company
        const deleteFilter = { _id: dataTemporalCompany._id }
        await TemporalCompany.deleteOne(deleteFilter)

        // * Creación en User-Company
        const userCompany = new UserCompany({ idUser: newUser._id, idCompany: newCompany._id })

        await userCompany.save()

        // * Envío de mail de bienvenida
        const { emailManager, nameManager } = newUser;

        const response = await fetch(`${process.env.ENVIRONMENT_URL}/api/send-email/welcome`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail: emailManager,
            name: nameManager
          }),
        });

        await response.json();

        // * Retornar nuevo registro en User
        return {
          match: true,
          trying: 0
        }
      }
    }

  } catch (error) {
    return error
  }
}

export default controllerValidateCode