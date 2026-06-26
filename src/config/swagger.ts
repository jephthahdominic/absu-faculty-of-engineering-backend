import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ABSU Faculty Management System API',
      version: '1.0.0',
      description: 'Production-ready REST API for Abia State University Faculty Management System',
      contact: {
        name: 'ABSU ICT Department',
        email: 'ict@absu.edu.ng',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Development Server',
      },
      {
        url: `https://api.absu.edu.ng${env.API_PREFIX}`,
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['super_admin', 'department_admin', 'student'] },
            departmentId: { type: 'string', nullable: true },
            matricNumber: { type: 'string', nullable: true },
            level: { type: 'string', nullable: true },
            profileImage: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Department: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Lecturer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            designation: { type: 'string' },
            profileImage: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            departmentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Publication: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            journal: { type: 'string' },
            publicationYear: { type: 'integer' },
            publicationUrl: { type: 'string', format: 'uri' },
            authors: { type: 'array', items: { type: 'string' } },
            lecturerId: { type: 'string' },
            departmentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LectureNote: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            courseCode: { type: 'string' },
            level: { type: 'string' },
            semester: { type: 'string' },
            fileUrl: { type: 'string', format: 'uri' },
            lecturerId: { type: 'string' },
            departmentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        News: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            featuredImage: { type: 'string' },
            category: { type: 'string' },
            isPublished: { type: 'boolean' },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            departmentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            venue: { type: 'string' },
            eventDate: { type: 'string', format: 'date-time' },
            featuredImage: { type: 'string' },
            isPublished: { type: 'boolean' },
            departmentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
