'use strict';

const { replaceAgencyPlaceholders, flattenObject, emailBodyTemplate, injectBeforeSecondLastClosingTag } = require("../../../../utils/email-utils");

module.exports = {
    async afterCreate(event) {
        const { result: resultEvent, params } = event;
        if (!resultEvent.publishedAt) return;
        try {
            const result = await strapi.db.query('api::company.company').findOne({
                where: { id: resultEvent.id },
                populate: [
                    'user',
                    'logo',
                    'city',
                    'country',
                    'categories'
                ]
            });

            // Send email to admin when package is created with pending status
            if (!result.company_status) {
                const template = await strapi.entityService.findMany('api::email-template.email-template', {
                    filters: { slug: 'company-wellcome' },
                    limit: 1,
                });

                const { subject: emailSubject, body } = template[0];

                const flatData = flattenObject(result);

                const replacedSubject = replaceAgencyPlaceholders(emailSubject, flatData);
                const replacedHtml = replaceAgencyPlaceholders(body, flatData);
                // const extraHtml = emailBodyTemplate();
                const concatBody = replacedHtml;

                const subject = replacedSubject || `I have a question`;
                const toEmail = result?.email || process.env.ADMIN_EMAIL
                // const recipientName = result?.name || 'Company';

                try {
                    await strapi.plugin('email').service('email').send({
                        to: toEmail,
                        subject: subject,
                        html: concatBody || `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
                                <h2 style="color: #222;">Hello,</h2>
                                <p>strong>Welcome to GoTopRated ${result.name}</strong> </p>
                            </div>
                        `,
                    });

                    strapi.log.info(`Company ${toEmail} sent.`);
                } catch (emailError) {
                    strapi.log.error(`Error sending email: ${emailError.message}`);
                }

                strapi.log.info(`Company ${result.documentId} created. Email notifications sent.`);
            }

        } catch (error) {
            strapi.log.error('Error in company afterCreate lifecycle:', error);
        }
    },

    async beforeUpdate(event) {
        const { params } = event;
        const companyId = params.where.documentId || params.where.id;

        // Store old status for comparison
        if (companyId) {
            const oldCompany = await strapi.entityService.findOne(
                'api::company.company',
                companyId,
                {
                    fields: ['company_status']
                }
            );

            if (oldCompany) {
                event.state = event.state || {};
                event.state.oldStatus = oldCompany.company_status;
            }
        }
    },

    async afterUpdate(event) {
        const { result: resultEvent, state } = event;

        const oldStatus = state?.oldStatus;
        const result = await strapi.db.query('api::company.company').findOne({
            where: { id: resultEvent.id },
            populate: [
                'user',
                'logo',
                'city',
                'country',
                'categories'
            ]
        });

        
        const newStatus = result.company_status;
        console.log('.........................................................................')
        console.log(oldStatus)
        console.log(newStatus)
        console.log(oldStatus && newStatus && oldStatus !== newStatus)
        console.log('.........................................................................')
        
        try {
            // Only send email if status actually changed
            if (newStatus && oldStatus !== newStatus) {
                console.log('publishedAtpublishedAtpublishedAt sdsd dsdsdsdsdsdsd  sdsdsdsdsd')
                console.log(result)
                console.log('publishedAtpublishedAtpublishedAt sdsd dsdsdsdsdsdsd  sdsdsdsdsd')

                if (result) {
                    let toEmail = result?.email || process.env.ADMIN_EMAIL
                    // Generate slug if not provided
                    if (result.title && oldStatus === 'Draft') {
                        // Convert title to slug: lowercase, replace spaces with hyphens, remove special chars
                        const baseSlug = result.name
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-');

                        // Add package ID to ensure uniqueness
                        // const uniqueSlug = `${baseSlug}-${result.id || result.documentId}`;

                        const isExist = await strapi.db.query('api::company.company').findOne({
                            where: { slug: baseSlug },

                        });
                        let uniqueSlug = null;
                        if (isExist) {
                            uniqueSlug = `${baseSlug}-${result.id || result.documentId}`;
                        }
                        else {
                            uniqueSlug = baseSlug;
                        }

                        // Update the package with the generated slug
                        await strapi.db.query('api::company.company').update({
                            where: { id: result.id },
                            data: {
                                slug: uniqueSlug
                            }
                        });

                        // Update the result object with the new slug
                        result.slug = uniqueSlug;

                        strapi.log.info(`Generated slug for package ${result.documentId}: ${uniqueSlug}`);
                    }

                    let template = null
                    console.log('newStatusnewStatus', newStatus, 'newStatusnewStatusnewStatus')
                    if (newStatus === 'Reject')
                        template = await strapi.entityService.findMany('api::email-template.email-template', {
                            filters: { slug: 'company-rejected' },
                            limit: 1,
                        });

                    else if (newStatus === 'Approved')
                        template = await strapi.entityService.findMany('api::email-template.email-template', {
                            filters: { slug: 'company-approved' },
                            limit: 1,
                        });
                    else if (!oldStatus && newStatus === 'Pending'){
                        template = await strapi.entityService.findMany('api::email-template.email-template', {
                            filters: { slug: 'company-pending' },
                            limit: 1,
                        });
                        toEmail = process.env.ADMIN_EMAIL
                    }
                    

                    const { subject: emailSubject, body } = template[0];

                    const flatData = flattenObject(result);

                    console.log('flatDataflatDataflatDataflatDataflatDataflatDataflatData')

                    const replacedSubject = replaceAgencyPlaceholders(emailSubject, flatData);
                    const replacedHtml = replaceAgencyPlaceholders(body, flatData);
                    const extraHtml = emailBodyTemplate();
                    const concatBody = injectBeforeSecondLastClosingTag(replacedHtml, extraHtml);

                    const subject = replacedSubject || `I have a question`;
                    const recipientName = result?.name || 'Company';

                    try {
                        await strapi.plugin('email').service('email').send({
                            to: toEmail,
                            subject: subject,
                            html: replacedHtml || `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
                                <h2 style="color: #222;">Hello,</h2>
                                <p>strong>Welcome to GoTopRated ${result.name}</strong> </p>
                            </div>
                        `,
                        });
                    console.log('SENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNT   EDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  FFFFFFFFFFFFF')

                    } catch (emailError) {
                        strapi.log.error(`Error sending email: ${emailError.message}`);
                    }

                    // await strapi.service('api::package.email').sendPackageStatusUpdateEmail(
                    //     result,
                    //     oldStatus,
                    //     newStatus,
                    //     template[0]
                    // );
                }

                strapi.log.info(`Package ${result.documentId} status changed from ${oldStatus} to ${newStatus}. Email sent.`);
            }
        } catch (error) {
            strapi.log.error('Error in package afterUpdate lifecycle:', error);
        }
    }
};