import swaggerJsdoc from 'swagger-jsdoc';
import { UserRole } from '../enums/UserRole';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Freelancer Platform API',
            version: '1.0.0',
            description: 'API documentation for the Freelancer Platform',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                UserRole: {
                    type: 'string',
                    enum: Object.values(UserRole),
                    example: UserRole.FREELANCER
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful'
                        },
                        data: {
                            type: 'object',
                            description: 'Response data varies based on the endpoint'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        details: {
                            type: 'object',
                            example: { error: 'Detailed error message' }
                        }
                    }
                },
                RegisterDto: {
                    type: 'object',
                    required: ['username', 'email', 'password', 'role'],
                    properties: {
                        username: {
                            type: 'string',
                            minLength: 3,
                            example: 'johndoe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        },
                        role: {
                            $ref: '#/components/schemas/UserRole'
                        },
                        firstName: {
                            type: 'string',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe'
                        }
                    }
                },
                RegisterResponseDto: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            example: 1
                        },
                        username: {
                            type: 'string',
                            example: 'johndoe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        firstName: {
                            type: 'string',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe'
                        },
                        role: {
                            $ref: '#/components/schemas/UserRole'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                LoginDto: {
                    type: 'object',
                    required: ['emailOrUsername', 'password'],
                    properties: {
                        emailOrUsername: {
                            type: 'string',
                            example: 'john@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        }
                    }
                },
                TokenResponseDto: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                username: { type: 'string', example: 'johndoe' },
                                email: { type: 'string', example: 'john@example.com' },
                                firstName: { type: 'string', example: 'John' },
                                lastName: { type: 'string', example: 'Doe' },
                                role: { $ref: '#/components/schemas/UserRole' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        },
                        accessToken: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        expiresIn: {
                            type: 'number',
                            example: 900
                        }
                    }
                },
                RefreshTokenDto: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                TokensResponseDto: {
                    type: 'object',
                    properties: {
                        accessToken: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                CreateRoleDto: {
                    type: 'object',
                    required: ['name', 'description'],
                    properties: {
                        name: {
                            type: 'string',
                            enum: Object.values(UserRole),
                            example: UserRole.FREELANCER
                        },
                        description: {
                            type: 'string',
                            example: 'Users who can take on projects and submit proposals'
                        }
                    }
                },
                UpdateRoleDto: {
                    type: 'object',
                    required: ['description'],
                    properties: {
                        description: {
                            type: 'string',
                            example: 'Updated description for the role'
                        }
                    }
                },
                ProjectCategory: {
                    type: 'string',
                    enum: ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'DATA_SCIENCE', 'BLOCKCHAIN', 'DEVOPS', 'OTHER'],
                    example: 'WEB_DEVELOPMENT'
                },
                ProjectStatus: {
                    type: 'string',
                    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
                    example: 'OPEN'
                },
                CreateProjectDto: {
                    type: 'object',
                    required: ['title', 'description', 'category', 'budget', 'deadline', 'requiredSkills'],
                    properties: {
                        title: {
                            type: 'string',
                            example: 'E-commerce Website Development'
                        },
                        description: {
                            type: 'string',
                            example: 'Need a full-stack developer to build an e-commerce website...'
                        },
                        category: {
                            $ref: '#/components/schemas/ProjectCategory'
                        },
                        budget: {
                            type: 'number',
                            example: 5000
                        },
                        deadline: {
                            type: 'string',
                            format: 'date',
                            example: '2024-12-31'
                        },
                        requiredSkills: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['React', 'Node.js', 'PostgreSQL']
                        },
                        attachments: {
                            type: 'string',
                            example: 'project-requirements.pdf'
                        }
                    }
                },
                UpdateProjectDto: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            example: 'Updated E-commerce Website Development'
                        },
                        description: {
                            type: 'string',
                            example: 'Updated project description...'
                        },
                        category: {
                            $ref: '#/components/schemas/ProjectCategory'
                        },
                        budget: {
                            type: 'number',
                            example: 6000
                        },
                        deadline: {
                            type: 'string',
                            format: 'date',
                            example: '2024-12-31'
                        },
                        requiredSkills: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['React', 'Node.js', 'PostgreSQL', 'AWS']
                        },
                        attachments: {
                            type: 'string',
                            example: 'updated-requirements.pdf'
                        }
                    }
                },
                AssignFreelancerDto: {
                    type: 'object',
                    required: ['freelancerId'],
                    properties: {
                        freelancerId: {
                            type: 'number',
                            example: 1
                        }
                    }
                },
                CompleteProjectDto: {
                    type: 'object',
                    required: ['completionNotes', 'freelancerRating', 'freelancerReview'],
                    properties: {
                        completionNotes: {
                            type: 'string',
                            example: 'Project completed successfully with all requirements met.'
                        },
                        freelancerRating: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            example: 4.5
                        },
                        freelancerReview: {
                            type: 'string',
                            example: 'Great work! The freelancer delivered everything on time.'
                        }
                    }
                },
                CancelProjectDto: {
                    type: 'object',
                    required: ['cancellationReason'],
                    properties: {
                        cancellationReason: {
                            type: 'string',
                            example: 'Project requirements have changed significantly.'
                        }
                    }
                },
                RateProjectDto: {
                    type: 'object',
                    required: ['rating', 'review'],
                    properties: {
                        rating: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            example: 4.5
                        },
                        review: {
                            type: 'string',
                            example: 'Excellent communication and project management.'
                        }
                    }
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            example: 1
                        },
                        title: {
                            type: 'string',
                            example: 'E-commerce Website Development'
                        },
                        description: {
                            type: 'string',
                            example: 'Need a full-stack developer to build an e-commerce website...'
                        },
                        status: {
                            $ref: '#/components/schemas/ProjectStatus'
                        },
                        category: {
                            $ref: '#/components/schemas/ProjectCategory'
                        },
                        budget: {
                            type: 'number',
                            example: 5000
                        },
                        deadline: {
                            type: 'string',
                            format: 'date',
                            example: '2024-12-31'
                        },
                        requiredSkills: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['React', 'Node.js', 'PostgreSQL']
                        },
                        attachments: {
                            type: 'string',
                            example: 'project-requirements.pdf'
                        },
                        client: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                username: { type: 'string', example: 'johndoe' },
                                email: { type: 'string', example: 'john@example.com' }
                            }
                        },
                        assignedFreelancer: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                id: { type: 'number', example: 2 },
                                username: { type: 'string', example: 'janedoe' },
                                email: { type: 'string', example: 'jane@example.com' }
                            }
                        },
                        isCompleted: {
                            type: 'boolean',
                            example: false
                        },
                        completedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true
                        },
                        cancellationReason: {
                            type: 'string',
                            nullable: true
                        },
                        cancelledAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true
                        },
                        completionNotes: {
                            type: 'string',
                            nullable: true
                        },
                        clientRating: {
                            type: 'number',
                            nullable: true,
                            minimum: 0,
                            maximum: 5,
                            example: 4.5
                        },
                        freelancerRating: {
                            type: 'number',
                            nullable: true,
                            minimum: 0,
                            maximum: 5,
                            example: 4.5
                        },
                        clientReview: {
                            type: 'string',
                            nullable: true
                        },
                        freelancerReview: {
                            type: 'string',
                            nullable: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Projects', description: 'Project management endpoints' },
            { name: 'Proposals', description: 'Proposal management endpoints' },
            { name: 'Roles', description: 'Role management endpoints' }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/dtos/*.ts',
        './src/entities/*.ts'
    ]
};

export const swaggerSpec = swaggerJsdoc(options); 