 
import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import bodyparser from 'body-parser'
import Route from './routes/v1/index.js'

const app = express()
Route(app)
const hostname = 'localhost'
const port = 3000

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use('/api/sorts', mapOrder)

//routes


app.get('/', (req, res) => {
  res.end('<h1>Hello World!</h1><hr>')
})



app.listen(port, hostname, () => {
  // eslint-disable-next-line no-console
  console.log(`Hello , I am running at https://${ hostname }:${ port }/`)
})
