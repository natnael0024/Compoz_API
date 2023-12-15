const asyncHandler = require('express-async-handler');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient()

module.exports = {
    getCategories: asyncHandler( async(req,res)=>{
        try{
            const categories = await prisma.category.findMany()
            res.status(200).json({categories})
        }catch(error){
            res.status(500).json({message: error})
        }
    }),

    get: asyncHandler( async(req,res)=>{
        try{
            const category = await prisma.category.findUnique({
                where: {
                    id: req.params.id
                }
            })
            res.status(200).json({category})
        }catch(error){
            res.status(500).json({message: error})
        }
    }),

    create: asyncHandler( async(req,res)=>{
        try{
            const category = await prisma.category.create({
                data:{
                    name: req.body.name,
                    icon: req.body.icon
                }
            })
            res.status(200).json({category})
        }catch(error){
            res.status(500).json({message: error})
        }
    }),

    update: asyncHandler( async(req,res)=>{
        const {id} = req.params.id
        try{
            const category = await prisma.category.update({
                where:{id: id},
                data:{
                    name: req.body.name,
                    icon: req.body.icon
                }
            })
            res.status(200).json({category})
        }catch(error){
            res.status(500).json({message: error})
        }
    }),

    delete: asyncHandler( async(req,res)=>{
        const {id} = req.params.id
        try{
            const category = await prisma.category.delete({
                where:{id: id},
            })
            res.status(200).json({message: 'category deleted'})
        }catch(error){
            res.status(500).json({message: error})
        }
    }),
 
}