const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')



const register = async (req, res) => {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new BadRequestError('please provide all values')
    }

    const userAlreadyExists = await User.findOne({ email })
    if (userAlreadyExists) {
        throw new BadRequestError('Email already in use')
    }

    const user = await User.create(req.body)

    const token = user.createJWT()

    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            location: user.location,

        },
        token,
        location: user.location
    })
}

const login = async (req, res) => {
    
    const { email, password } = req.body
    console.log(email);

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }
    
    const isPasswordCorrect = await user.comparePassword(password)
    console.log(isPasswordCorrect)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = user.createJWT()
    user.password = undefined
    res.status(StatusCodes.OK).json({ user, token, location: user.location })


}

const updatUser = async (req, res) => {
    const { email, name, lastName, location } = req.body;
    if (!email || !name || !lastName || !location) {
        throw new BadRequestError('Please provide all values')
    }

    const user = await User.findOne({ _id: req.user.userId })
    console.log(user)
    user.email= email
    user.name= name
    user.lastName = lastName
    user.location = location

    await user.save()

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({ user, token, location: user.location})

}



module.exports = {
    register,
    login,
    updatUser
}