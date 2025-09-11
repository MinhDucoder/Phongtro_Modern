 import express from 'express'

 const notificationRoute = express.Router()

 notificationRoute.get('/login', (req, res) => {
    res.send('Login Route')
 }) 

 export default notificationRoute