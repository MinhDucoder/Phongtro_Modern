 import express from 'express'

 const roomRoute = express.Router()

 roomRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default roomRoute