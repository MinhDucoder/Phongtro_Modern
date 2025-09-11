 import express from 'express'

 const reviewRoute = express.Router()

 reviewRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default reviewRoute