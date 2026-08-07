'use strict';

const { replaceAgencyPlaceholders, flattenObject, emailBodyTemplate, injectBeforeSecondLastClosingTag } = require("../../../../utils/email-utils");

module.exports = {
    async afterCreate(event) {
        const { result: resultEvent, params } = event;
        if (!resultEvent.publishedAt) return;
        try {
            console.log('Calllll...................llllllllllllllllllllllllllllll')
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
            if (result.company_status === 'Pending' || !result.company_status) {
                const template = await strapi.entityService.findMany('api::email-template.email-template', {
                    filters: { slug: 'company-wellcome' },
                    limit: 1,
                });

                const { subject: emailSubject, body } = template[0];

                const flatData = flattenObject(result);

                const replacedSubject = replaceAgencyPlaceholders(emailSubject, flatData);
                const replacedHtml = replaceAgencyPlaceholders(body, flatData);
                const extraHtml = emailBodyTemplate();
                const concatBody = injectBeforeSecondLastClosingTag(replacedHtml, extraHtml);

                const subject = replacedSubject || `I have a question`;
                const toEmail = result.company?.email || process.env.ADMIN_EMAIL
                const recipientName = result.company?.name || 'Company';

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
            } catch (emailError) {
                strapi.log.error(`Error sending email: ${emailError.message}`);
            }

                // try {
                //     if (strapi.service('api::package.email')) {
                //         await strapi.service('api::package.email').sendPackagePendingEmail(result, template[0]);
                //     } else if (strapi.service('api::email.email')) {
                //         // Try alternative service name
                //         await strapi.service('api::email.email').sendPackagePendingEmail(result, template[0]);
                //     } else {
                //         strapi.log.warn('Email service not found. Check service registration.');
                //     }
                // } catch (emailError) {
                //     strapi.log.error(`Error sending email: ${emailError.message}`);
                // }
            }

            strapi.log.info(`Package ${result.documentId} created. Email notifications sent.`);
        } catch (error) {
            strapi.log.error('Error in package afterCreate lifecycle:', error);
        }
    },

    async beforeUpdate(event) {
        const { params } = event;
        const packageId = params.where.documentId || params.where.id;

        // Store old status for comparison
        if (packageId) {
            const oldPackage = await strapi.entityService.findOne(
                'api::package.package',
                packageId,
                {
                    fields: ['package_status']
                }
            );

            if (oldPackage) {
                event.state = event.state || {};
                event.state.oldStatus = oldPackage.package_status;
            }
        }
    },

    async afterUpdate(event) {
        const { result: resultEvent, state } = event;
        if (!resultEvent.publishedAt) return;
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

        const newStatus = result.package_status;

        try {
            // Only send email if status actually changed
            if (oldStatus && newStatus && oldStatus !== newStatus) {


                if (result.agency) {

                    // Generate slug if not provided
                    if (result.title && oldStatus === 'Draft') {
                        // Convert title to slug: lowercase, replace spaces with hyphens, remove special chars
                        const baseSlug = result.title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-');

                        // Add package ID to ensure uniqueness
                        // const uniqueSlug = `${baseSlug}-${result.id || result.documentId}`;

                        const isExist = await strapi.db.query('api::package.package').findOne({
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
                        await strapi.db.query('api::package.package').update({
                            where: { id: result.id },
                            data: {
                                slug: uniqueSlug
                            }
                        });

                        // Update the result object with the new slug
                        result.slug = uniqueSlug;

                        strapi.log.info(`Generated slug for package ${result.documentId}: ${uniqueSlug}`);
                    }



                    const template = await strapi.entityService.findMany('api::email-template.email-template', {
                        filters: { slug: 'package-agency' },
                        limit: 1,
                    });

                    await strapi.service('api::package.email').sendPackageStatusUpdateEmail(
                        result,
                        oldStatus,
                        newStatus,
                        template[0]
                    );
                }

                strapi.log.info(`Package ${result.documentId} status changed from ${oldStatus} to ${newStatus}. Email sent.`);
            }
        } catch (error) {
            strapi.log.error('Error in package afterUpdate lifecycle:', error);
        }
    }
};