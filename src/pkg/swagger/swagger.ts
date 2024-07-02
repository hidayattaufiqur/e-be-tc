import swaggerJsdoc from 'swagger-jsdoc';

export const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eigen Backend Test API',
      version: '0.0.1',
      description: 'This is an API for Eigen Backend Techincal Test',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
  },
  apis: [
    './src/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
