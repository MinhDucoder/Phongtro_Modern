 import express from 'express'

 const reportRoute = express.Router()

 reportRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default reportRoute