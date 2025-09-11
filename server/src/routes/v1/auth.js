 import express from 'express'
import AuthController from '../../controllers/AuthController.js'
 const authRoute = express.Router()

 authRoute.post('/login', AuthController.login);

 export default authRoute