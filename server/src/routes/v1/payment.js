 import express from 'express'

 const paymentRoute = express.Router()

 paymentRoute.get('/payment', (req, res) => {
    res.send('payment Route')
 }) 

 export default paymentRoute