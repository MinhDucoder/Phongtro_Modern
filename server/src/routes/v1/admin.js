 import express from 'express'

 const adminRoute = express.Router()

 adminRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default adminRoute