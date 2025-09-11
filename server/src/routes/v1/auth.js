 import express from 'express'

 const authRoute = express.Router()

 authRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default authRoute