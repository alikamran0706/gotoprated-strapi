// ./config/env/production/plugins.js
module.exports = ({ env }) => ({
    graphql: {
        config: {
            endpoint: '/graphql',
            shadowCRUD: true,
            playgroundAlways: true,
            depthLimit: 7,
            amountLimit: 100,
            apolloServer: {
                tracing: false,
                introspection: true,
            },
        },
    },
    io: {
        enabled: true,
        config: {
            contentTypes: [
                {
                    uid: 'api::package.package',
                    actions: ['create', 'update'],
                    populate: ['profile',]
                },
                {
                    uid: 'api::notification.notification',
                    actions: ['create', 'delete'],
                    populate: '*'
                },
            ],
            socket: {
                serverOptions: {
                    transports: ['websocket'],
                    cors: {
                        origin: '*',
                        methods: ['GET', 'POST']
                    }
                }
            }
        }
    },
    "users-permissions": {
        config: {
            register: {
                allowedFields: ["user_type", "first_name", "last_name", "address", "phone", "company"],
                validation: {
                    user_type: {
                        enum: ["partner", "user"],
                    },
                    first_name: {
                        minLength: 1,
                        maxLength: 100,
                    },
                    last_name: {
                        minLength: 1,
                        maxLength: 100,
                    },
                    address: {
                        minLength: 1,
                        maxLength: 100,
                    },
                    phone: {
                        minLength: 1,
                        maxLength: 100,
                    },
                    contact_id: {
                        minLength: 1,
                        maxLength: 100,
                    },
                },
            },
        },
    },
    // email: {
    //     config: {
    //         provider: "nodemailer",
    //         providerOptions: {
    //             host: env("SMTP_HOST", "smtp.gmail.com"),
    //             port: env("SMTP_PORT", 587),
    //             auth: {
    //                 user: env("SMTP_USERNAME"),
    //                 pass: env("SMTP_PASSWORD"),
    //             },
    //             secure: false, // true for 465, false for other ports
    //             // Add connection timeout
    //             connectionTimeout: 10000, // 10 seconds
    //             greetingTimeout: 10000,
    //             socketTimeout: 10000,
    //         },
    //         settings: {
    //             defaultFrom: env("SMTP_USERNAME"),
    //             defaultReplyTo: env("SMTP_USERNAME"),
    //         },
    //     },
    // },

    // config/plugins.js
    // email: {
    //     config: {
    //         provider: "nodemailer",
    //         providerOptions: {
    //             host: env("SMTP_HOST", "smtp.gmail.com"),
    //             port: env("SMTP_PORT", 465), // Changed from 587 to 465
    //             auth: {
    //                 user: env("SMTP_USERNAME"),
    //                 pass: env("SMTP_PASSWORD"),
    //             },
    //             secure: true, // Changed from false to true for port 465
    //             connectionTimeout: 10000,
    //             greetingTimeout: 10000,
    //             socketTimeout: 10000,
    //             // Add TLS options
    //             tls: {
    //                 rejectUnauthorized: false, // Only for testing, not production
    //             },
    //         },
    //         settings: {
    //             defaultFrom: env("SMTP_USERNAME"),
    //             defaultReplyTo: env("SMTP_USERNAME"),
    //         },
    //     },
    // },
    email: {
        config: {
            provider: "nodemailer",
            providerOptions: {
                host: env("SMTP_HOST", "mail.flykaaba.com"),
                port: env("SMTP_PORT", 587),
                secure: false,
                auth: {
                    user: env("SMTP_USERNAME"),
                    pass: env("SMTP_PASSWORD"),
                },
            },
            settings: {
                defaultFrom: env("SMTP_USERNAME"),
                defaultReplyTo: env("SMTP_USERNAME"),
            },
        },
    },
    'content-manager': {
        config: {
            sanitize: {
                allowedTags: [
                    'svg', 'path', 'circle', 'rect', 'g', 'line', 'polygon', 'polyline',
                    'ellipse', 'text', 'defs', 'use', 'title', 'desc'
                ],
                allowedAttributes: {
                    '*': [
                        'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
                        'stroke-linejoin', 'class', 'aria-hidden', 'viewBox', 'd',
                        'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'xlink:href'
                    ],
                },
            },
        },
    },
});