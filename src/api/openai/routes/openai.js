// src/api/openai/routes/openai.js

module.exports = {
    routes: [
        // Main chat endpoint
        {
            method: 'POST',
            path: '/openai/chat',
            handler: 'openai.chat',
            config: {
                auth: false  // ✅ This is fine for public routes
            }
        },

        // Get chat history
        {
            method: 'GET',
            path: '/openai/chat/:sessionId',
            handler: 'openai.getChatHistory',
            config: {
                auth: false  // ✅ Public route
            }
        },

        // Update user info
        {
            method: 'PUT',
            path: '/openai/chat/user',
            handler: 'openai.updateUserInfo',
            config: {
                auth: false  // ✅ Public route
            }
        },

        // Update chat status
        {
            method: 'PUT',
            path: '/openai/chat/status',
            handler: 'openai.updateChatStatus',
            config: {
                auth: false  // ✅ Public route
            }
        },

        // Delete conversation
        {
            method: 'DELETE',
            path: '/openai/chat/:sessionId',
            handler: 'openai.deleteConversation',
            config: {
                auth: false  // ✅ Public route
            }
        },

        // Admin: Get all chats
        {
            method: 'GET',
            path: '/openai/chats',
            handler: 'openai.getAllChats',
            config: {
                auth: {  // ✅ MUST be an object, not boolean
                    scope: ['admin']  // Or use: 'admin::isAuthenticatedAdmin'
                }
            }
        },

        // Admin: Get chat by ID
        {
            method: 'GET',
            path: '/openai/chats/:id',
            handler: 'openai.getChatById',
            config: {
                auth: {  // ✅ MUST be an object, not boolean
                    scope: ['admin']
                }
            }
        },

        {
            method: 'GET',
            path: '/openai/packages',
            handler: 'openai.searchPackages',
            config: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/openai/packages/:slug',
            handler: 'openai.getPackage',
            config: {
                auth: false
            }
        }
    ]
};