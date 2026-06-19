'use strict';

const { emailBodyTemplate, injectBeforeSecondLastClosingTag, flattenObject, replaceInquiryPlaceholders } = require("../../../../utils/email-utils");

module.exports = {
    async afterCreate(event) {
        const { result: resultEvent } = event;
        console.log('..................afterCreate................................')
        try {

            const result = await strapi.db.query('api::inquiry.inquiry').findOne({
                where: { id: resultEvent.id },
                populate: [
                    'package',
                    'user',
                    'agency'
                ]
            });

            console.log(result)
            console.log('..................afterCreate................................')
            // Extract agency ID from the result
            // The agency might be populated as an object or just the ID

            const template = await strapi.entityService.findMany('api::email-template.email-template', {
                filters: { slug: 'inquiry' },
                limit: 1,
            });

            const { subject: emailSubject, body } = template[0];

            const flatData = flattenObject(result);

            console.log(result)
            console.log('ffffffffffffffffffffffffffffffffffffffffffffffff')

            const replacedSubject = replaceInquiryPlaceholders(emailSubject, flatData);
            const replacedHtml = replaceInquiryPlaceholders(body, flatData);
            const extraHtml = emailBodyTemplate();
            const concatBody = injectBeforeSecondLastClosingTag(replacedHtml, extraHtml);

            const subject = replacedSubject || `I have a question`;

            const toEmail = result.agency?.email || process.env.ADMIN_EMAIL

            try {
                await strapi.plugin('email').service('email').send({
                    to: toEmail,
                    subject: subject,
                    html: concatBody || `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
                                <h2 style="color: #222;">Hello,</h2>
                                <p>strong>${result.full_name}</strong> </p>
                            </div>
                        `,
                });
            } catch (emailError) {
                strapi.log.error(`Error sending email: ${emailError.message}`);
            }

        } catch (error) {
            strapi.log.error('Error in package afterCreate lifecycle:', error);
        }
    },
};