const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken')

const jwtsecret = process.env.JWT_SECRET

module.exports = {
    getBlogs: asyncHandler( async(req,res)=>{
        const q = req.query.cat
        const search = req.query.search
        const page = parseInt(req.query.page) || 1
        console.log('page:',page)
        const limit = 5
        let totalCount
        let blogs
        if(q){
            console.log('YEP')
            console.log(q)
            blogs = await prisma.blog.findMany({
                where:{
                    // category_id: {
                    //     equals: parseInt(q)
                    // } ,
                    category:{
                        name: q
                    },
                },
                include:{
                    category: true,
                    user: {
                        select:{
                            username: true,
                            email: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: (page-1) * limit,
                take: 5
            })
            totalCount = await prisma.blog.count({
                where:{
                    category: {
                        name: q
                    }
                }
            })
            console.log('BY CAT:',totalCount)
            console.log('###',blogs.length)
        }
        else if(search) {
            blogs = await prisma.blog.findMany({
                where:{
                    title:{
                       contains :search,
                       mode: 'insensitive' 
                    }
                },
                include:{
                    category: true,
                    user: {
                        select:{
                            username: true,
                            email: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: (page-1) * limit,
                take: 5
            })
            
            totalCount = blogs.length
        }
        else {
         blogs = await prisma.blog.findMany({
            include:{
                category: true,
                user: {
                    select:{
                        avatar:true,
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip: (page-1) * limit,
            take: 5
        })
        totalCount = await prisma.blog.count()
    }
    
        const totalPages = Math.ceil(totalCount/limit)
        // console.log('thispageblogs:',blogs.length)
        console.log('totalblogs:',totalCount)
        console.log('totalPages:',totalPages)
        if(!blogs){
            res.status(404).json({message: 'No blogs'})
        }
        res.status(200).json({blogs,totalPages})
    }),

    getBlog: asyncHandler( async(req,res)=>{
        const blogId = parseInt(req.params.id)
        const blog = await prisma.blog.findUnique({
            where:{
                id:blogId
            },
            include:{
                category: true,
                user: {
                    select:{
                        username: true,
                        email: true,
                        avatar: true
                    }
                }
            },
        })
        if(!blog){
            res.status(404).json({message: 'blog not found'})
        }
        await prisma.blog.update({
            where: {id: blogId},
            data: {
                views: {
                    increment: 1
                }
            }
        })
        res.status(200).json({blog})
    }),

    createBlog:  asyncHandler( async(req,res)=>{
       try{
        let imageData = req.publicURL?req.publicURL:null
            let fileSize = req.file? req.file.size:null
            if(fileSize > (0.5 * 1024 * 1024)){
                return res.status(403).json({message: 'Image is to large ( > 500KB)'})
            }
        const newBlog = await prisma.blog.create({
            data:{
                title: req.body.title,
                content: req.body.content,
                category_id: parseInt(req.body.category_id),
                image: imageData,
                user_id: parseInt(req.body.user_id)
            }
        })
        res.status(200).json({newBlog}) 
       }catch(error){
        console.log(error)
       }
    }),

    update: asyncHandler( async(req,res)=>{
        console.log(req.body)
        const blogId = parseInt(req.params.id)
        try{
            let blog = await prisma.blog.findUnique({
                where:{
                    id: blogId
                }
            })
            if(!blog){
                res.status(404).json({message: 'blog not found'})
            }

            let imageData = req.publicURL? req.publicURL: blog.image
            blog = await prisma.blog.update({
                where: {id: blogId},
                data: {
                    title: req.body.title,
                    content: req.body.content,
                    category_id: parseInt(req.body.category_id),
                    image: imageData,
                }
            })
            res.status(200).json({blog})
        }catch(error){
            console.log(error)
        }
    }),

    delete: asyncHandler(async(req,res)=>{
        const token = req.headers.token
        if(!token){
            return res.status(401).json({message: 'not authenticated'})
        }
        jwt.verify(token, jwtsecret, async (err, userInfo)=>{
            if(err) return res.status(403).json({message: 'invalid token'})
            const {userId} = userInfo

            //find blog
            const blogId = parseInt(req.params.id)
            try{
                const blog = await prisma.blog.findUnique({
                    where:{
                        id:blogId
                    }
                })
                //check if the blog exists
                if(blog){
                    //check if the blog belongs to the user
                    if(blog.user_id === userId){
                        await prisma.blog.delete({
                            where:{id: blogId}
                        })
                    }
                }else{
                    res.status(404).json({message: 'blog not found'})
                }
                res.status(200).json({message: 'blog deleted'})
            }catch(error){
            res.status(500).json(error)
        }
        })
    }),

    likeBlog: asyncHandler(async (req, res) => {
        const blogId = parseInt(req.params.id)
        const token = req.headers.token

        if (!token) {
            return res.status(401).json({ message: 'not authenticated' })
        }

        jwt.verify(token, jwtsecret, async (err, userInfo) => {
            if (err) return res.status(403).json({ message: 'invalid token' })

            const { userId } = userInfo

            // Check if the user has already liked this blog
            const existingLike = await prisma.like.findUnique({
                where: {
                    user_id_blog_id: {
                        user_id: userId,
                        blog_id: blogId
                    }
                }
            })

            if (existingLike) {
                // Remove the like
                await prisma.like.delete({
                    where: {
                        id: existingLike.id
                    }
                })

                // Decrement the blog's like count
                await prisma.blog.update({
                    where: { id: blogId },
                    data: {
                        likes_count: {
                            decrement: 1
                        }
                    }
                })
                return res.status(200).json({ message: 'Blog unliked successfully' })
            }

            // Create a new like
            await prisma.like.create({
                data: {
                    user_id: userId,
                    blog_id: blogId
                }
            })

            // Update the blog's like count
            await prisma.blog.update({
                where: { id: blogId },
                data: {
                    likes_count: {
                        increment: 1
                    }
                }
            })

            res.status(200).json({ message: 'Blog liked successfully' })
        })
    }),
    
    unlikeBlog: asyncHandler(async (req, res) => {
        const blogId = parseInt(req.params.id)
        const token = req.headers.token

        if (!token) {
            return res.status(401).json({ message: 'not authenticated' })
        }

        jwt.verify(token, jwtsecret, async (err, userInfo) => {
            if (err) return res.status(403).json({ message: 'invalid token' })

            const { userId } = userInfo

            // Check if the user has liked this blog
            const existingLike = await prisma.like.findUnique({
                where: {
                    user_id_blog_id: {
                        user_id: userId,
                        blog_id: blogId
                    }
                }
            })

            if (!existingLike) {
                return res.status(400).json({ message: 'You have not liked this blog' })
            }

            // Remove the like
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            })

            // Decrement the blog's like count
            await prisma.blog.update({
                where: { id: blogId },
                data: {
                    likes_count: {
                        decrement: 1
                    }
                }
            })

            res.status(200).json({ message: 'Blog unliked successfully' })
        })
    })
}