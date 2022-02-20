const mongoose = require('mongoose')

const jobsSchema = mongoose.Schema({
    company: {
        type: String,
        required: [true, "Please provide company name"],
        maxLength: 50,
    },
    position: {
        type: String,
        required: [true, "please provide position"],
        maxLength: 100
    },

    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending' 
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'internship'],
        default: 'full-time' 
    },
    jobLocation: {
        type: String,
        required: [true, "please provide location"],
        default: 'my city',

    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    } 
},{timestamps: true})

module.exports = mongoose.model('Job', jobsSchema)
