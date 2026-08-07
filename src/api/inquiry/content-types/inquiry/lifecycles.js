'use strict';

const { emailBodyTemplate, injectBeforeSecondLastClosingTag, flattenObject, replaceInquiryPlaceholders } = require("../../../../utils/email-utils");

module.exports = {
    async afterCreate(event) {
        const { result: resultEvent } = event;
        if (!resultEvent.publishedAt) return;
        console.log('..................afterCreate................................')
        try {

            const result = await strapi.db.query('api::inquiry.inquiry').findOne({
                where: { id: resultEvent.id },
                populate: [
                    'company',
                    'user',
                    'service'
                ]
            });

            // Extract agency ID from the result
            // The agency might be populated as an object or just the ID

            const template = await strapi.entityService.findMany('api::email-template.email-template', {
                filters: { slug: 'inquiry' },
                limit: 1,
            });

            const { subject: emailSubject, body } = template[0];

            const flatData = flattenObject(result);

            const replacedSubject = replaceInquiryPlaceholders(emailSubject, flatData);
            const replacedHtml = replaceInquiryPlaceholders(body, flatData);
            const extraHtml = emailBodyTemplate();
            const concatBody = replacedHtml;

            const subject = replacedSubject || `I have a question`;
            const toEmail = result.company?.email || process.env.ADMIN_EMAIL
            const recipientName = result.company?.name || 'Company';

             let emailLogData = {
                recipient: toEmail,
                recipient_name: recipientName,
                email_type: 'contact_form',
                email_log_status: 'sent',
                subject: subject,
                company: result.company?.documentId || result.company?.id,
                inquiry: result.documentId,
                user: result.user?.documentId || result.user?.id,
                metadata: {
                    inquiry_id: result.id,
                    inquiry_documentId: result.documentId,
                    full_name: result.full_name,
                    email: result.email,
                    phone: result.phone,
                    countryCode: result.countryCode,
                    source: result.source,
                },
                content_preview: concatBody?.substring(0, 500) || null,
            };

            // Remove undefined values
            Object.keys(emailLogData).forEach(key => {
                if (emailLogData[key] === undefined || emailLogData[key] === null) {
                    delete emailLogData[key];
                }
            });

            let emailLog = null;
            let emailError = null;

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

             // ── Create Email Log Entry ──
            try {
                emailLog = await strapi.entityService.create('api::email-log.email-log', {
                    data: emailLogData,
                });
                strapi.log.info(`Email log created for inquiry ${result.id}`);
            } catch (logError) {
                strapi.log.error(`Error creating email log: ${logError.message}`);
            }

            // ── If email failed, update the email log with error details ──
            if (emailError && emailLog) {
                try {
                    await strapi.entityService.update('api::email-log.email-log', emailLog.id, {
                        data: {
                            email_log_status: 'failed',
                            error_message: emailError.message,
                        },
                    });
                } catch (updateError) {
                    strapi.log.error(`Error updating email log: ${updateError.message}`);
                }
            }

        } catch (error) {
            strapi.log.error('Error in package afterCreate lifecycle:', error);
        }
    },
};