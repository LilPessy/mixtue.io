const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mixtue.io API',
      version: '1.0.0',
      description: 'Documentazione delle API per il backend di Mixtue.io',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Server di sviluppo locale',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Percorsi ai file che contengono le annotazioni JSDoc
  apis: ['./server.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger UI disponibile su http://localhost:3000/api-docs');
};

module.exports = swaggerDocs;
