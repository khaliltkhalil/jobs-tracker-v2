const express = require('express')
const router = express.Router()
const {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats

} = require('../controllers/jobs')


router.route('/').post(createJob).get(getAllJobs)
router.route('/:id').delete(deleteJob).patch(updateJob)
router.route('/stats').get(showStats)

module.exports = router