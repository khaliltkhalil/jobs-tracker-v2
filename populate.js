const {readFile} = require('fs/promises')
require('dotenv').config()

const connectDB = require('./db/connect')
const Job = require('./models/job')


const start = async ()=> {
    try {
        await connectDB(process.env.MONGO_URI)
        await Job.deleteMany()

        const jsonProducts = JSON.parse(await readFile('./mock_data.json'))
        // console.log(jsonProducts.slice(1,3))
        await Job.create(jsonProducts)
        console.log('Success')
        process.exit(0)

    } catch (error) {
        console.log(error)
        process.exit(1)

    }
}

start()
