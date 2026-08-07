'use strict';

module.exports = {
    async afterCreate(event) {
        const { result: resultEvent, params } = event;
        if (!resultEvent.publishedAt) return;
        try {

            const result = await strapi.db.query('api::package.package').findOne({
                where: { id: resultEvent.id },
                populate: [
                    'agency',
                    'cover_image',
                    'images',
                    'city',
                    'country',
                    'category'
                ]
            });

            // Generate slug if not provided
            if (result.title && (!result.slug || result.slug === '')) {
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

            // Extract agency ID from the result
            let agencyId;

            if (result.agency || params.data?.agency) {
                // If agency is populated as an object
                if (typeof result.agency === 'object' && result.agency?.documentId) {
                    agencyId = result.agency?.documentId;
                } else if (typeof result.agency === 'object' && result.agency?.id) {
                    agencyId = result.agency?.id;
                } else if (typeof result.agency === 'string') {
                    // If it's just a string ID
                    agencyId = result.agency;
                } else if (result.agency?.documentId) {
                    // If it's nested in params data
                    agencyId = result.agency?.documentId;
                }
                else if (params.data.agency?.set?.[0]?.id || params.data.agency) {
                    agencyId = params.data.agency.set?.[0]?.id || params.data.agency;
                }
            }

            if (!agencyId) {
                strapi.log.warn(`No agency ID found for package ${result.documentId}`);
                return;
            }

            // Send email to admin when package is created with pending status
            if (result.package_status === 'Pending' || !result.package_status) {
                const template = await strapi.entityService.findMany('api::email-template.email-template', {
                    filters: { slug: 'package-admin' },
                    limit: 1,
                });

                try {
                    if (strapi.service('api::package.email')) {
                        await strapi.service('api::package.email').sendPackagePendingEmail(result, template[0]);
                    } else if (strapi.service('api::email.email')) {
                        // Try alternative service name
                        await strapi.service('api::email.email').sendPackagePendingEmail(result, template[0]);
                    } else {
                        strapi.log.warn('Email service not found. Check service registration.');
                    }
                } catch (emailError) {
                    strapi.log.error(`Error sending email: ${emailError.message}`);
                }
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

        const result = await strapi.db.query('api::package.package').findOne({
            where: { id: resultEvent.id },
            populate: [
                'agency',
                'cover_image',
                'images',
                'city',
                'country',
                'category'
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