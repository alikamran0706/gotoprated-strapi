const agencyDashboardUrl = process.env.AGENCY_DASHBOARD_URL;
const adminDashboardUrl = process.env.ADMIN_DASHBOARD_URL;
const adminDashboardPackageUrl = `${process.env.ADMIN_DASHBOARD_URL}/admin/content-manager/collection-types/api::package.package/`;
const adminDashboardAgencyUrl = `${process.env.ADMIN_DASHBOARD_URL}/admin/content-manager/collection-types/api::profile.profile/`;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;
const adminEmail = strapi.config.get('server.adminEmail', process.env.ADMIN_EMAIL);

export function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], `${prefix}${key}.`, result);
    } else {
      result[`${prefix}${key}`] = obj[key];
    }
  }
  return result;
}

export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Format: January 29, 2026
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const emailBodyTemplate = () => `
  <hr style="margin: 30px 0;">

  <p style="font-size: 12px; color: #888;">
    Need help? Contact our support team at <a style="color: #C7A94F" href="mailto:${adminEmail}">${adminEmail}</a>
  </p>
`;

export const getPackageStatusIcon = (status) => {
  switch (status) {
    case 'Verified':
      return {
        icon: '✓',
        color: '#10b981',
        lightBg: '#e6f7ec',
        shadow: 'rgba(16,185,129,0.2)',
        badgeDisplay: 'display:block;',
        badgeText: '✓ Approved'
      };
    case 'Pending':
      return {
        icon: '⏳',
        color: '#f59e0b',
        lightBg: '#fff4e6',
        shadow: 'rgba(245,158,11,0.2)',
        badgeDisplay: 'display:block;',
        contentBadgeDisplay: 'display:block;',
        badgeText: '⏳ Pending Review'
      };
    case 'Reject':
      return {
        icon: '❌',
        color: '#ef4444',
        lightBg: '#ffe6e6',
        shadow: 'rgba(239,68,68,0.2)',
        badgeDisplay: 'display:block;',
        contentBadgeDisplay: 'display:block;',
        badgeText: '❌ Reject'
      };
    default:
      return {
        icon: '✔',
        color: '#10b981',
        lightBg: '#e6f7ec',
        shadow: 'rgba(16,185,129,0.2)',
        badgeDisplay: 'display:block;',
        contentBadgeDisplay: 'display:block;',
        badgeText: '✓ Approved'
      };
  }
};

export const getPackageStatusTitle = (status) => {
  switch (status) {
    case 'Verified':
      return 'Your Package is Now Live';
    case 'Pending':
      return 'Under Review by Admin Team';
    case 'Reject':
      return 'Package Needs Updates';
    default:
      return 'Your Package is Now Live';
  }
};

export const getPackageStatusHeading = (status) => {
  switch (status) {
    case 'Verified':
      return 'Congratulations!';
    case 'Pending':
      return 'Package Submitted!';
    case 'Reject':
      return 'Update Required!';
    default:
      return 'Congratulations!';
  }
};

export const getPackageStatusIntro = (status) => {
  switch (status) {
    case 'Verified':
      return 'Great news! Our admin team has reviewed and approved your travel package. It is now published and visible to thousands of pilgrims on FlyKaaba.';
    case 'Pending':
      return 'Your package has been successfully submitted and is now under review by our admin team. This process usually takes 24-48 hours. You will be notified once it\'s approved.';
    case 'Reject':
      return 'Your package requires some updates before it can be published. Please review the details below and make the necessary changes.';
    default:
      return 'Your package status has been updated. Please review the details below.';
  }
};

export const getPackageStatusDescription = (status, short_description) => {
  switch (status) {
    case 'Verified':
      return `Verified on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}. ${short_description || 'Includes accommodation, transport, and guided tours.'}`;
    case 'Pending':
      return `Submitted on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}. ${short_description || 'Waiting for admin approval.'}`;
    case 'Reject':
      return `Requires updates. ${short_description || 'Please review and resubmit your package.'}`;
    default:
      return short_description || 'Travel package details';
  }
};

export const getPackageStatusNext = (status) => {
  switch (status) {
    case 'Verified':
      return 'What happens next? Your package is live!';
    case 'Pending':
      return 'What happens next? Your package is under review.';
    case 'Reject':
      return 'Action required: Please update your package';
    default:
      return 'What happens next?';
  }
};

export function replacePlaceholders(template, data) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    const trimmedKey = key.trim();

    if (trimmedKey === 'cover_image' && data['cover_image.url']) {
      return `${backendUrl}${data['cover_image.url']}`
    }
    else if (trimmedKey === 'admin_dashboard_link')
      return `${adminDashboardUrl}/admin`;
    else if (trimmedKey === 'live_package_link' && data['category.slug'])
      return `${frontendUrl}/${data['category.slug']}-packages/${data.slug}`;
    else if (trimmedKey === 'dashboard_link')
      return agencyDashboardUrl;


    else if (trimmedKey === 'admin_review_link' && data.documentId)
      return `${adminDashboardPackageUrl}${data.documentId}`;
    else if (trimmedKey === 'createdAt' && data.createdAt)
      return formatDate(data.createdAt);
    else if (trimmedKey === 'duration_days' && data.duration_days)
      return `${data.duration_days} Days`;
    else if (trimmedKey === 'duration_nights' && data.duration_nights)
      return `${data.duration_nights} Nights`;
    else if (trimmedKey === 'package_icon')
      return data['category.slug'] === 'umrah' ? '🕌' : '🕋';
    else if (trimmedKey === 'category')
      return data['category.name'];

    else if (trimmedKey === 'status_icon') {
      const statusConfig = getPackageStatusIcon(data.package_status);

      return `
        <div  
          style="
            width:56px;
            height:56px;
            margin:0 auto 20px;
            background: ${statusConfig.lightBg};
            border-radius:50%;
            text-align:center;
            line-height:56px;
            font-size:26px;
            color: ${statusConfig.color};
        ">
                ${statusConfig.icon}
        </div>
      `;
    }
    else if (trimmedKey === 'package_status_title')
      return getPackageStatusTitle(data.package_status);
    else if (trimmedKey === 'package_status_heading')
      return getPackageStatusHeading(data.package_status);
    else if (trimmedKey === 'intro')
      return getPackageStatusIntro(data.package_status);
    else if (trimmedKey === 'package_status_description')
      return getPackageStatusDescription(data.package_status, data.short_description);
    else if (trimmedKey === 'package_status_next') {
      return getPackageStatusNext(data.package_status);
    }


    else if (trimmedKey === 'agency_name' && data['agency.legal_name'])
      return `${data['agency.legal_name']}`;
    else if (trimmedKey === 'city' && data['city.name'])
      return `${data['city.name']}`;
    else if (trimmedKey === 'country' && data['country.name'])
      return `${data['country.name']}`;


    else if (trimmedKey === 'package_status_badge') {
      const status = data.package_status?.toLowerCase() || 'pending';

      // Color mapping for different statuses
      const statusColors = {
        'verified': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        },
        'active': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        },
        'pending': {
          bg: '#fef3c7',
          color: '#92400e',
          border: '#fcd34d',
          icon: '⏳'
        },
        'reject': {
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fecaca',
          icon: '❌'
        },
        'draft': {
          bg: '#f3f4f6',
          color: '#4b5563',
          border: '#e5e7eb',
          icon: '📝'
        },
        'expired': {
          bg: '#f3f4f6',
          color: '#6b7280',
          border: '#d1d5db',
          icon: '⌛'
        },
        'suspended': {
          bg: '#fee2e2',
          color: '#991b1b',
          border: '#fecaca',
          icon: '⚠️'
        },
        'inactive': {
          bg: '#f3f4f6',
          color: '#6b7280',
          border: '#d1d5db',
          icon: '⚫'
        },
        'approved': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        }
      };

      const colors = statusColors[status] || statusColors.pending;

      return `
        <span style="
          background: ${colors.bg};
          color: ${colors.color};
          font-size: 11px;
          font-weight: bold;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-block;
          margin-right: 8px;
          margin-bottom: 5px;
          border: 1px solid ${colors.border};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">
          ${colors.icon} Status: ${data.package_status || 'Pending'}
        </span>
      `;
    }

    else if (trimmedKey === 'featured_tag' && data.featured) {
      return `
          <span style="
          background:#fce7f3;
          color:#be185d;
          font-size:11px;
          font-weight:bold;
          padding:5px 12px;
          border-radius:20px;
          display:inline-block;
          margin-right:8px;
          margin-bottom:5px;
          ">
          ⭐ FEATURED
          </span>
          `;
    }

    else if (trimmedKey === 'seasons' && data.seasons && data.seasons.length > 0) {
      const seasonsList = Array.isArray(data.seasons)
        ? data.seasons.map(s => s.name).join(', ')
        : data.seasons;
      return `
      <span style="display:inline-block; color:#555; font-size:13px;">
      <strong style="color:#333;">📅</strong> ${seasonsList}
      </span>
      `;
    }

    else if (trimmedKey === 'rejection_reason' && data.package_status === 'Reject' && data.rejection_reason) {
      return `
          <div style="margin-top:15px; padding:12px; background:#fef2f2; border-left:4px solid #ef4444; border-radius:4px; text-align:left; color:#991b1b; font-size:14px;">
            <strong style="display:block; margin-bottom:5px;">⚠️ Rejection Reason:</strong>
            ${data.rejection_reason}
          </div>
        `;
    }

    else if (trimmedKey === 'package_status_reject' && data.package_status === 'Reject' && data.rejection_reason) {
      return `
          <div style="margin-top:12px; padding-left:20px; position:relative;">
            <span style="position:absolute; left:0; color:#ef4444; font-weight:bold;">⚠️</span>
            <span style="color:#991b1b; font-size:14px;">
              <strong>Action required:</strong> Please address the rejection reason above and resubmit your package.
            </span>
          </div>
        `;
    }

    else if (trimmedKey === 'terms_link') {
      return `${frontendUrl}/terms-and-conditions`;
    }

    else if (trimmedKey === 'privacy_link') {
      return `${frontendUrl}/privacy-policy`;
    }


    return getValueByPath(data, trimmedKey);
  });
}

const subjectConfig = {
  'Approved': `🎉 Congratulations! Your Agency {agency_name} Has Been Approved on FlyKaaba`,
  'Pending': `⏳ Your Agency Application ({agency_name}) is Under Review`,
  'Reject': `Update Regarding Your Agency Application - {agency_name}`,
  'Draft': `📝 Complete Your Agency Registration - {agency_name}`,
  'Verified': `✅ Your Agency {agency_name} is Now Verified on FlyKaaba`,
  'Suspended': `⚠️ Important Notice Regarding Your Agency {agency_name}`,
  'default': `Agency Registration Status Update - {agency_name}`
};

export function replaceAgencyPlaceholders(template, data) {

  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (trimmedKey === 'admin_dashboard_link')
      return `${adminDashboardUrl}/admin`;
    else if (trimmedKey === 'live_package_link' && data['category.slug'])
      return `${frontendUrl}/${data['category.slug']}-packages/${data.slug}`;
    else if (trimmedKey === 'dashboard_link')
      return agencyDashboardUrl;
    else if (trimmedKey === 'admin_view_agency_link')
      return `${adminDashboardAgencyUrl}/${data.documentId}`;
    else if (trimmedKey === 'email_subject') {
      const agencyName = data.agency_name || data.legal_name || data.customer_name || data.full_name || 'Your Agency';

      const subjectTemplate = subjectConfig[data.profile_status] || subjectConfig.default;

      return subjectTemplate.replace('{agency_name}', agencyName);
    }
    else if (trimmedKey === 'status_heading') {
      const statusHeadings = {
        'Approved': 'Your Agency Has Been Approved!',
        'Verified': 'Your Agency Has Been Verified!',
        'Pending': 'Application Under Review',
        'Reject': 'Application Update',
        'Draft': 'Complete Your Registration',
        'Suspended': 'Account Suspended',
        'default': 'Agency Status Update'
      };
      return statusHeadings[data.profile_status] || statusHeadings.default;
    }

    else if (trimmedKey === 'status_accent_color') {
      const accentColors = {
        'Approved': '#C7A94F',
        'Verified': '#C7A94F',
        'Pending': '#C7A94F',
        'Reject': '#e01111',
        'Draft': '#6b7280',
        'Suspended': '#ef4444',
        'default': '#C7A94F'
      };
      return accentColors[data.profile_status] || accentColors.default;
    }
    else if (trimmedKey === 'status_light_bg') {
      const lightBg = {
        'Approved': '#e6f7e6',
        'Verified': '#e6f7e6',
        'Pending': '#fff4e6',
        'Reject': '#fee2e2',
        'Draft': '#f3f4f6',
        'Suspended': '#fee2e2',
        'default': '#f5f5f5'
      };
      return lightBg[data.profile_status] || lightBg.default;
    }

    else if (trimmedKey === 'status_icon') {
      const statusIcons = {
        'Approved': '✓',
        'Verified': '✓',
        'Pending': '⏳',
        'Reject': '⚠️',
        'Draft': '📝',
        'Suspended': '⚠️',
        'default': '📧'
      };
      return statusIcons[data.profile_status] || statusIcons.default;
    }

    else if (trimmedKey === 'status_icon_bg') {
      const statusBg = {
        'Approved': '#e6f7e6',
        'Verified': '#e6f7e6',
        'Pending': '#fff4e6',
        'Reject': '#fee2e2',
        'Draft': '#f3f4f6',
        'Suspended': '#fee2e2',
        'default': '#f5f5f5'
      };
      return statusBg[data.profile_status] || statusBg.default;
    }

    else if (trimmedKey === 'status_icon_color') {
      const statusColors = {
        'Approved': '#10b981',
        'Verified': '#10b981',
        'Pending': '#f59e0b',
        'Reject': '#ef4444',
        'Draft': '#6b7280',
        'Suspended': '#ef4444',
        'default': '#C7A94F'
      };
      return statusColors[data.profile_status] || statusColors.default;
    }


    else if (trimmedKey === 'intro_text') {
      const introTexts = {
        'Approved': `Great news! Your agency "${data.agency_name || data.legal_name || data.customer_name}" has been verified and is now live on FlyKaaba. You can now start receiving inquiries and managing your packages.`,
        'Verified': `Great news! Your agency "${data.agency_name || data.legal_name || data.customer_name}" has been verified and is now live on FlyKaaba. You can now start receiving inquiries and managing your packages.`,
        'Pending': `Thank you for registering "${data.agency_name || data.legal_name || data.customer_name}" with FlyKaaba. Your application has been received and is currently being reviewed by our team.`,
        'Reject': `Regarding your agency registration for "${data.agency_name || data.legal_name || data.customer_name}" on FlyKaaba.`,
        'Draft': `You have a draft application for "${data.agency_name || data.legal_name || data.customer_name}" on FlyKaaba. Complete your registration to get started.`,
        'Suspended': `Your agency "${data.agency_name || data.legal_name || data.customer_name}" has been suspended. Please contact support for more information.`,
        'default': `Your agency "${data.agency_name || data.legal_name || data.customer_name}" status has been updated.`
      };
      return introTexts[data.profile_status] || introTexts.default;
    }

    else if (trimmedKey === 'rejection_reason') {
      if (data.profile_status === 'Reject' && data.rejection_reason) {
        return `
          <div style="margin-top:15px; padding:12px; background:#fef2f2; border-left:4px solid #ef4444; border-radius:4px; text-align:left; color:#991b1b; font-size:14px;">
            <strong style="display:block; margin-bottom:5px;">⚠️ Rejection Reason:</strong>
            ${data.rejection_reason}
          </div>
        `;
      }
      return '';
    }

    else if (trimmedKey === 'next_steps_title') {
      const nextStepsTitles = {
        'Approved': 'What You Can Do Now:',
        'Verified': 'What You Can Do Now:',
        'Pending': 'What Happens Next:',
        'Reject': 'Next Steps:',
        'Draft': 'To Complete Your Registration:',
        'Suspended': 'Required Actions:',
        'default': 'Next Steps:'
      };
      return nextStepsTitles[data.profile_status] || nextStepsTitles.default;
    }

    else if (trimmedKey === 'next_steps_content') {
      const nextStepsContents = {
        'Approved': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">✅ Log in to your dashboard to complete your agency profile</li>
            <li style="margin-bottom:8px;">📦 Start creating Umrah and Hajj packages</li>
            <li style="margin-bottom:8px;">📸 Add photos and detailed descriptions to attract customers</li>
            <li style="margin-bottom:8px;">👥 Respond to inquiries promptly</li>
          </ul>
        `,
        'Verified': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">✅ Log in to your dashboard to complete your agency profile</li>
            <li style="margin-bottom:8px;">📦 Start creating Umrah and Hajj packages</li>
            <li style="margin-bottom:8px;">📸 Add photos and detailed descriptions to attract customers</li>
            <li style="margin-bottom:8px;">👥 Respond to inquiries promptly</li>
          </ul>
        `,
        'Pending': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">🔍 Our team will review your application within 24-48 hours</li>
            <li style="margin-bottom:8px;">📧 You'll receive an email once the review is complete</li>
            <li style="margin-bottom:8px;">✏️ You can still edit your profile while waiting</li>
            <li style="margin-bottom:8px;">📞 Contact support if you have any questions</li>
          </ul>
        `,
        'Reject': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">📋 Review the feedback provided below</li>
            <li style="margin-bottom:8px;">✏️ Update your application with the required information</li>
            <li style="margin-bottom:8px;">🔄 Submit a new application after making corrections</li>
            <li style="margin-bottom:8px;">📞 Contact our support team for assistance</li>
          </ul>
        `,
        'Draft': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">📋 Fill in all required information</li>
            <li style="margin-bottom:8px;">📎 Upload your license and documents</li>
            <li style="margin-bottom:8px;">✅ Review and submit your application</li>
            <li style="margin-bottom:8px;">⏳ Wait for verification after submission</li>
          </ul>
        `,
        'Suspended': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">📞 Contact support immediately</li>
            <li style="margin-bottom:8px;">📋 Review your account for any violations</li>
            <li style="margin-bottom:8px;">✏️ Update required information</li>
            <li style="margin-bottom:8px;">⏳ Wait for review after submitting updates</li>
          </ul>
        `,
        'default': `
          <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.6;">
            <li style="margin-bottom:8px;">📋 Check your dashboard for updates</li>
            <li style="margin-bottom:8px;">📧 Watch for further email notifications</li>
            <li style="margin-bottom:8px;">📞 Contact support if you have questions</li>
          </ul>
        `
      };
      return nextStepsContents[data.profile_status] || nextStepsContents.default;
    }

    else if (trimmedKey === 'verified_badge') {
      if (data.profile_status === 'Approved' || data.profile_status === 'Verified') {
        return `
          <div style="margin-top:12px;">
            <span style="background:#e6f7e6; color:#10b981; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold; display:inline-block;">
              ✓ Verified Agency
            </span>
          </div>
        `;
      }
      return '';
    }

    else if (trimmedKey === 'agency_initial') {
      const name = data.agency_name || data.legal_name || data.customer_name || 'Agency';
      return name.charAt(0).toUpperCase();
    }

    else if (trimmedKey === 'services_badges' && data.services_offered) {
      const services = Array.isArray(data.services_offered)
        ? data.services_offered
        : (typeof data.services_offered === 'string' ? data.services_offered.split(',').map(s => s.trim()) : []);

      if (services.length > 0) {
        return services.map(service => `
          <span style="
            background:#f0f0f0;
            color:#555;
            padding:3px 10px;
            border-radius:20px;
            font-size:11px;
            display:inline-block;
            margin:2px;
          ">
            ${service}
          </span>
        `).join('');
      }
      return '<span style="color:#999;">No services listed</span>';
    }
    else if (trimmedKey === 'terms_link') {
      return `${frontendUrl}/terms-and-conditions`;
    }

    else if (trimmedKey === 'privacy_link') {
      return `${frontendUrl}/privacy-policy`;
    }

    return getValueByPath(data, trimmedKey);
  });
}

export function replaceInquiryPlaceholders(template, data) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    const trimmedKey = key.trim();

    if (trimmedKey === 'admin_dashboard_link')
      return `${adminDashboardUrl}/admin`;
    else if (trimmedKey === 'live_package_link' && data['category.slug'])
      return `${frontendUrl}/${data['category.slug']}-packages/${data.slug}`;
    else if (trimmedKey === 'dashboard_link')
      return agencyDashboardUrl;


    else if (trimmedKey === 'admin_review_link' && data.documentId)
      return `${adminDashboardPackageUrl}${data.documentId}`;
    else if (trimmedKey === 'createdAt' && data.createdAt)
      return formatDate(data.createdAt);
    else if (trimmedKey === 'duration_days' && data.duration_days)
      return `${data.duration_days} Days`;
    else if (trimmedKey === 'package_duration')
      return `${data['package.duration_days']} Days / ${data['package.duration_nights']} Nights`;
    else if (trimmedKey === 'package_icon')
      return data['category.slug'] === 'umrah' ? '🕌' : '🕋';
    else if (trimmedKey === 'category')
      return data['category.name'];
    else if (trimmedKey === 'package_title')
      return data['package.title'];
    else if (trimmedKey === 'package_short_description')
      return data['package.short_description'];
    else if (trimmedKey === 'package_description')
      return data['package.description'];

    else if (trimmedKey === 'package_price')
      return data['package.price'];
    else if (trimmedKey === 'package_currency')
      return data['package.currency'];

    else if (trimmedKey === 'package_location' && (data['package.country.name'] || data['package.city.name']))
      return `${data['package.country.name']} ${data['package.city.name']}`;

    else if (trimmedKey === 'agency_name' && data['agency.legal_name'])
      return `${data['agency.legal_name']}`;

    else if (trimmedKey === 'package_status_badge') {
      const status = data.package_status?.toLowerCase() || 'pending';

      // Color mapping for different statuses
      const statusColors = {
        'verified': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        },
        'active': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        },
        'pending': {
          bg: '#fef3c7',
          color: '#92400e',
          border: '#fcd34d',
          icon: '⏳'
        },
        'reject': {
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fecaca',
          icon: '❌'
        },
        'draft': {
          bg: '#f3f4f6',
          color: '#4b5563',
          border: '#e5e7eb',
          icon: '📝'
        },
        'expired': {
          bg: '#f3f4f6',
          color: '#6b7280',
          border: '#d1d5db',
          icon: '⌛'
        },
        'suspended': {
          bg: '#fee2e2',
          color: '#991b1b',
          border: '#fecaca',
          icon: '⚠️'
        },
        'inactive': {
          bg: '#f3f4f6',
          color: '#6b7280',
          border: '#d1d5db',
          icon: '⚫'
        },
        'approved': {
          bg: '#e9f7ef',
          color: '#2e7d32',
          border: '#c3e6cb',
          icon: '✓'
        }
      };

      const colors = statusColors[status] || statusColors.pending;

      return `
        <span style="
          background: ${colors.bg};
          color: ${colors.color};
          font-size: 11px;
          font-weight: bold;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-block;
          margin-right: 8px;
          margin-bottom: 5px;
          border: 1px solid ${colors.border};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">
          ${colors.icon} Status: ${data.package_status || 'Pending'}
        </span>
      `;
    }

    else if (trimmedKey === 'terms_link') {
      return `${frontendUrl}/terms-and-conditions`;
    }

    else if (trimmedKey === 'privacy_link') {
      return `${frontendUrl}/privacy-policy`;
    }


    return getValueByPath(data, trimmedKey);
  });
}

export function getValueByPath(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (Array.isArray(acc)) {
      const index = parseInt(part, 10);
      return acc[index];
    }
    return acc?.[part];
  }, obj) ?? '';
}

export function injectBeforeLastClosingTag(html, injectHtml) {
  const lastClosingTagIndex = html.lastIndexOf('</');
  if (lastClosingTagIndex === -1) {
    return html + injectHtml;
  }
  return html.slice(0, lastClosingTagIndex) + injectHtml + html.slice(lastClosingTagIndex);
}

export function injectBeforeSecondLastClosingTag(html, injectHtml) {
  const closingTags = [...html.matchAll(/<\/[^>]+>/g)];
  if (closingTags.length < 2) {
    // Fallback to append at the end or before last if only 1 tag
    return injectBeforeLastClosingTag(html, injectHtml);
  }

  // Get the second-to-last closing tag's index
  const secondLastTagMatch = closingTags[closingTags.length - 2];
  const secondLastTagIndex = secondLastTagMatch.index ?? -1;

  if (secondLastTagIndex === -1) {
    return html + injectHtml;
  }

  // Inject the extraHtml before the second-to-last closing tag
  return html.slice(0, secondLastTagIndex) + injectHtml + html.slice(secondLastTagIndex);
}