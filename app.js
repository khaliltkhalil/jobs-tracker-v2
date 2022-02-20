require('dotenv').config();
const express = require('express');
require('express-async-errors')


const app = express()
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler')
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const connectDB = require('./db/connect')
const authenticateUser  = require('./middleware/authentication')
const morgan = require('morgan')

app.set('trust proxy', 1)

app.use(express.json())

//security middleware
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
})
)

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
app.use(helmet())
app.use(cors(corsOptions))
app.use(xss())

if(process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

// routes
app.get('/', (req, res) => {
    res.json({msg:'jobs-tracker-api'})
})
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser , jobsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`app is running on port ${port}`)
        })
    } catch(error) {
        console.log(error)
    }
}

start()




