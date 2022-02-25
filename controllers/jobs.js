const Job = require('../models/job')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require('../errors')
const mongoose = require('mongoose')
const moment = require('moment')



const getAllJobs = async (req, res) => {

    const { status, jobType, sort, search } = req.query
    const queryObject = {
        createdBy: req.user.userId
    }

    if(status !== 'all') {
        queryObject.status = status
    }

    if(jobType !== 'all') {
        queryObject.jobType = jobType
    }

    if(search) {
        queryObject.position = {$regex: search, $options: 'i'}
    }

    

    // No Await
    let result = Job.find(queryObject)

    if(sort === 'latest') {
        result = result.sort({createdAt: -1})
    }
    if(sort === 'oldest') {
        result = result.sort({createdAt: 1})
    }
    if(sort === 'a-z') {
        result = result.sort({position: 1})
    }
    if(sort === 'z-a') {
        result = result.sort({position: -1})
    }

    
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const skip = (page - 1) * limit

    result = result.skip(skip).limit(limit)

    // chain sort conditions
    const jobs = await result
    const totalJobs = await Job.countDocuments(queryObject)
    const numOfPages = Math.ceil(totalJobs / limit)

    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages})
}

const getJob = async (req, res) => {
    const { userId } = req.user
    const { id: jobId } = req.params
    const job = await Job.findOne({
        _id: jobId, createdBy: userId
    })
    if (!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json(job)
}

const createJob = async (req, res) => {
    const { position, company } = req.body
    if (!position || !company) {
        throw new BadRequestError('Please provide all values')
    }

    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json(job)
}

const updateJob = async (req, res) => {
    const { company, position } = req.body
    const { userId } = req.user
    const { id: jobId } = req.params

    if (!company || !position) {
        throw new BadRequestError('Company or Position canot be empty')
    }
    const job = await Job.findByIdAndUpdate({
        _id: jobId, createdBy: userId
    },
        req.body, { new: true, runValidators: true })

    if (!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json(job)
}

const deleteJob = async (req, res) => {
    const { userId } = req.user
    const { id: jobId } = req.params

    const job = await Job.findOneAndRemove({
        _id: jobId,
        createdBy: userId
    })
    if (!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).send()
}

const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        {
            $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) }
        },
        {
            $group: { _id: '$status', count: { '$sum': 1 } }
        }
    ])

    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr
        acc[title] = count
        return acc
    }, {})

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0
    }
    let monthlyApplications = await Job.aggregate([
        {
            $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
            $limit: 6
        }

    ])
    monthlyApplications = monthlyApplications.map((item) => {
        const {
            _id: { year, month },
            count
        } = item
        const date = moment().month(month - 1).year(year).format('MMM Y')
        return {
            date, count
        }
    }).reverse()

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications })
}


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats
}