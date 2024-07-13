const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Compoz api',
            version: '1.0.0'
        },
        servers: [
            {
                api:'http://localhost:8080'
            },
        ]
    },
    apis:['./routes/*.js']
}

const specs = swaggerJsDoc(options)

module.exports = app => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}