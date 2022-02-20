const Job = require('../models/job')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require('../errors')
const mongoose = require('mongoose')



const getAllJobs = async (req, res) => {
    const jobs = await Job.find({createdBy: req.user.userId})
    
    res.status(StatusCodes.OK).json({jobs, totalJobs: jobs.length, numOfPages: 1})
}

const getJob = async (req, res) => {
    const {userId} = req.user
    const {id:jobId} = req.params
    const job = await Job.findOne({
        _id: jobId, createdBy: userId
    })
    if(!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json(job)
}

const createJob = async (req, res) => {
    const { position, company } = req.body
    if(!position || !company) {
        throw new BadRequestError('Please provide all values')
    }

    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json(job)
}

const updateJob = async (req, res) => {
    const {company, position} = req.body
    const {userId} = req.user
    const {id:jobId} = req.params

    if(!company || !position) {
        throw new BadRequestError('Company or Position canot be empty')
    }
    const job = await Job.findByIdAndUpdate({
        _id: jobId, createdBy: userId
    },
    req.body, {new:true, runValidators:true})

    if(!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json(job)
}

const deleteJob = async (req, res) => {
    const {userId} = req.user
    const {id:jobId} = req.params

    const job = await Job.findOneAndRemove({
        _id: jobId,
        createdBy: userId
    })
    if(!job) {
        throw new NotFoundError(`No job found with id ${jobId}`)
    }
    res.status(StatusCodes.OK).send()
}

const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        {
            $match: { createdBy: mongoose.Types.ObjectId(req.user.userId)}
        },
        {
            $group: {_id: '$status', count: { '$sum': 1}}
        }
    ])
    res.status(StatusCodes.OK).json(stats)
}


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats
}