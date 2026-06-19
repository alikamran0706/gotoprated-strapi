// src/extensions/users-permissions/strapi-server.js

module.exports = (plugin) => {
  console.log('✅ Users-Permissions extension loaded');

  // =========================================
  // OVERRIDE REGISTER CONTROLLER
  // =========================================
  const originalRegister = plugin.controllers.auth.register;
  
  plugin.controllers.auth.register = async (ctx) => {
    try {
      // Check if email exists FIRST
      const { email } = ctx.request.body;
      
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email?.toLowerCase() }
      });

      if (existingUser) {
        return ctx.badRequest(
          'Email already registered',
          { 
            email: 'This email is already registered. Please login or use a different email.',
            field: 'email' 
          }
        );
      }

      // Call original register
      return await originalRegister(ctx);
      
    } catch (error) {
      console.error('Register error:', error);
      
      // Handle duplicate email error
      if (error.message?.includes('already taken') || error.code === 'ER_DUP_ENTRY') {
        return ctx.badRequest(
          'Email already registered',
          { 
            email: 'This email is already registered. Please login or use a different email.',
            field: 'email' 
          }
        );
      }

      // Handle other errors
      return ctx.badRequest('Registration failed. Please try again.', {
        general: error.message
      });
    }
  };

  // =========================================
  // OVERRIDE LOGIN CONTROLLER
  // =========================================
  const originalLogin = plugin.controllers.auth.callback;
  
  plugin.controllers.auth.callback = async (ctx) => {
    try {
      const { identifier } = ctx.request.body;
      
      // Check if user exists
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { email: identifier?.toLowerCase() },
            { username: identifier }
          ]
        }
      });

      // If user doesn't exist, return custom error
      if (!user) {
        return ctx.badRequest(
          'Invalid credentials',
          {
            general: 'Email or password is incorrect. Please try again.',
            field: 'identifier'
          }
        );
      }

      // Call original login
      return await originalLogin(ctx);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle invalid credentials error
      if (error.message?.includes('Invalid') || error.message?.includes('identifier') || error.message?.includes('password')) {
        return ctx.badRequest(
          'Invalid credentials',
          {
            general: 'Email or password is incorrect. Please try again.',
            field: 'identifier'
          }
        );
      }

      return ctx.badRequest('Login failed. Please try again.');
    }
  };

  // =========================================
  // OVERRIDE EMAIL CONFIRMATION ERROR MESSAGES
  // =========================================
  const originalEmailConfirmation = plugin.controllers.auth.emailConfirmation;
  
  plugin.controllers.auth.emailConfirmation = async (ctx) => {
    try {
      return await originalEmailConfirmation(ctx);
    } catch (error) {
      return ctx.badRequest(
        'Email verification failed',
        {
          general: 'The verification link is invalid or has expired. Please request a new one.'
        }
      );
    }
  };

  // =========================================
  // OVERRIDE FORGOT PASSWORD
  // =========================================
  const originalForgotPassword = plugin.controllers.auth.forgotPassword;
  
  plugin.controllers.auth.forgotPassword = async (ctx) => {
    try {
      const { email } = ctx.request.body;
      
      // Check if user exists
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email?.toLowerCase() }
      });

      if (!user) {
        // Don't reveal that email doesn't exist (security)
        return ctx.send({
          ok: true,
          message: 'If this email exists, you will receive a password reset link.'
        });
      }

      return await originalForgotPassword(ctx);
      
    } catch (error) {
      return ctx.send({
        ok: true,
        message: 'If this email exists, you will receive a password reset link.'
      });
    }
  };

  // =========================================
  // OVERRIDE RESET PASSWORD
  // =========================================
  const originalResetPassword = plugin.controllers.auth.resetPassword;
  
  plugin.controllers.auth.resetPassword = async (ctx) => {
    try {
      return await originalResetPassword(ctx);
    } catch (error) {
      return ctx.badRequest(
        'Password reset failed',
        {
          general: 'The reset link is invalid or has expired. Please request a new one.'
        }
      );
    }
  };

  return plugin;
};