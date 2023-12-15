const asyncHandler = require('express-async-handler');
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtsecret = process.env.JWT_SECRET

const hashPassword = (password, saltRounds) => {
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err){
                reject(err)
            }
            else{
            bcrypt.hash(password, salt, function(err, hash){
                if(err){
                    reject(err)
                }
                else{
                    resolve(hash)
                }
                })
            }
        })
    })
}

module.exports = {
    register: asyncHandler( async(req,res)=>{
        let {username, email, password, avatar} = req.body
        if(!username || !email || !password){
           return res.status(400).json({message: 'All fields are required'})
        }
        //check if user exists
        const user = await prisma.user.findMany({
            where:{
                email: {
                    equals: email
                }
            }
        })
        if(user.length>0){
            return res.status(409).json({message: 'A user with this email already exists'})
        }
        //register the user
        
        password = await hashPassword(password, 10)
        try{
            const newUser = await prisma.user.create({
                data:{
                    username: username,
                    email: email,
                    password: password
                }
            })

            delete newUser.password

            res.status(200).json(newUser)
        }catch(error){
            console.log(error)
        }
    }),

    login: asyncHandler( async(req,res)=>{
        let {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({message: 'email and password are required'})
        }
        try{
            const user = await prisma.user.findFirst({
                where:{
                    email: email
                }
            })
            if(user){
                const passMatch = await bcrypt.compare(password, user.password)
                if(passMatch){
                    const token = jwt.sign({ 
                        userId: user.id, 
                        email: user.email
                    }, 
                    jwtsecret,
                    {
                        expiresIn: '1h'
                    } )
                    delete user.password
                    res.status(200).json({user, token: token})
                }
                else{
                    res.status(401).json({message: 'incorrect password'})
                }
            }
            else{
                res.status(404).json({message: 'no user with this email'})
            }
        }catch(error){
            res.status(500).json({message: error})
        }
    }),

    logout: asyncHandler( async(req,res)=>{
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    })
}