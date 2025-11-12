import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import envconfig from "./constants.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Ecommerce API",
    version: "1.0.0",
    description: "API documentation for MySQL + Redis + Prisma user service",
  },
  servers: [
    {
      url: `http://localhost:3002`,
      description: `Local ${envconfig.NODE_ENV}`,
    },
        {
      url: `http://qa.ecommerce.com`,
      description: `QA Server`,
    },
    {
      url: `http://ecommerce.com`,
      description: `Production Server`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // path to your route files
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📘 Swagger Docs available at: http://localhost:${envconfig.PORT}/api-docs`);
};
