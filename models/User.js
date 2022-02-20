const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: 20,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        },
        unique: true,

    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: 6,
        select: false
    },
    lastName: {
        type: String,
        maxlength: 20,
        trim: true,
        default: 'lastName'

    },
    location: {
        type: String,
        maxlength: 20,
        trim: true,
        default: 'my city'

    }
})

userSchema.methods.createJWT = function () {
    return jwt.sign({
        userId: this._id,
        name: this.name
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    })
}

userSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})



module.exports = mongoose.model('User', userSchema)


