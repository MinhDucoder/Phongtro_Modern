 import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import bodyparser from 'body-parser'
import Route from './routes/v1/index.js'
import errorHandler from './middlewares/errorhandle.js'
import { connectDB } from './config/mongodbConfig.js'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import passport from './config/passportConfig.js'
import session from 'express-session'

const app = express()
//frontend chay port 3000 nên thêm cors
app.use(cors({
  origin: ['http://localhost:3000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Set-Cookie']
}))

// Enable pre-flight requests
app.options('*', cors());

connectDB()
//routes

const hostname = 'localhost'
const port = 5000

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(morgan('dev'))

//session
app.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
// app.use('/api/sorts', mapOrder)

//routes
Route(app)

//error handling middleware
app.use(errorHandler)

app.listen(port, hostname, () => {
  
  console.log(`Hello , I am running at http://${ hostname }:${ port }/`)
  })
