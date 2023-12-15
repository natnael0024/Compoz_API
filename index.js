const express = require('express');
const app = express()
const dotenv = require('dotenv');
const cors = require('cors');
const blogRoute = require('./routes/blogs');
const auth = require('./routes/auth')
const cookiParser = require('cookie-parser')
const categoryRoute = require('./routes/category')
const userRoute = require('./routes/users')

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

const corsOptions = {
    origin: '*'
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(cookiParser())

app.use('/v1/blogs', blogRoute)
app.use('/v1/auth', auth)
app.use('/v1/categories',categoryRoute)
app.use('/v1/users', userRoute)
