const asyncHandler = require('express-async-handler');
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const jwtsecret = process.env.JWT_SECRET
const jwt = require('jsonwebtoken');

module.exports = {
    
    getAll : asyncHandler( async(req,res)=>{
        try{
            const users = await prisma.user.findMany({
                take: 10,
            })
            if(users.length < 1){
                res.status(404).json({message: 'no users'})
            }
            res.status(200).json({users})
        }catch(error){
            res.status(500).json({error: error})
        }
    }),

    get: asyncHandler( async(req,res)=>{
        try{
            const user = await prisma.user.findUnique({
                where:{
                    id: parseInt(req.params.id)
                }
            })

            if(!user){
                res.status(404).json({message: 'no user with this ID'})
            }
            res.status(200).json({user})
        }catch(error){
            res.status(500).json({error: error})
        }
    }),

    update: asyncHandler( async(req,res)=>{
        const token = req.headers.authorization
        
        if(!token){
            return res.status(401).json({message: 'not authenticated'})
        }
        jwt.verify(token, jwtsecret, async (err, userInfo)=>{
            if(err) return res.status(403).json({message: 'invalid token'})
            const {userId} = userInfo

            //find user
            try{
                let user = await prisma.user.findUnique({
                    where:{
                        id:userId
                    }
                })
                //check if the user exists
                if(user){
                       let avatarData = req.file? req.file.path: user.avatar
                       
                       user = await prisma.user.update({
                            where: {id: userId},
                            data:{
                                username: req.body.username,
                                bio: req.body.bio,
                                avatar: avatarData
                            }
                        })
                }else{
                    res.status(404).json({message: 'user not found'})
                }
                delete user.password
                res.status(200).json({message: 'profile updated successfully', user})
            }catch(error){
            res.status(500).json(error)
        }
        })
    }),


    
}