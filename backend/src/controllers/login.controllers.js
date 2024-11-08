import generarToken from "../utils/jwt.js"
export const postLogin = async (req, res, next) => {
    try {
        const token = generarToken(req.user)
        
        res.status(200).json({ token })
    } catch (error) {
        next(error)
    }
}