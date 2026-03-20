import 'dotenv/config'
import jwt from 'jsonwebtoken'

const generateToken = (user) => {

    /*
        1° parametro: Objeto asociado al token (Usuario)
        2° parametro: Clave privada para el cifrado
        3° parametro: Tiempo de expiracion
    */

    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '12h' })

    return token

}

export default generateToken
