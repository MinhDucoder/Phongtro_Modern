 import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import bodyparser from 'body-parser'
import Route from './routes/v1/index.js'
import errorHandler from './middlewares/errorhandle.js'
import { connectDB } from './config/mongodb.js'

const app = express()
connectDB()
//routes

const hostname = 'localhost'
const port = 3000

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
// app.use('/api/sorts', mapOrder)

//routes
Route(app)

//error handling middleware
app.use(errorHandler)

app.listen(port, hostname, () => {
  // eslint-disable-next-line no-console
  console.log(`Hello , I am running at http://${ hostname }:${ port }/`)
  })
