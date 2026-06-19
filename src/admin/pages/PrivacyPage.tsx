const PrivacyPage = () => {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', margin: '15px 0', fontSize: '20px', fontWeight: '700' }}>
        Privacy Policy
      </h1>

      <p>
        Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information, especially when you use social login options like Google or Facebook.
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>
          When you sign in with Google or Facebook, we may collect:
        </p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Profile picture</li>
          <li>OAuth access token (used only for authentication)</li>
        </ul>
        <p>
          We do not collect or store your password from Google or Facebook.
        </p>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>
          We use your information to:
        </p>
        <ul>
          <li>Authenticate your account</li>
          <li>Personalize your experience</li>
          <li>Provide access to your profile</li>
          <li>Improve our services</li>
        </ul>
      </section>

      <section>
        <h2>3. Third-party Services</h2>
        <p>
          Our authentication system uses secure APIs from Google and Facebook. These services may collect data according to their own privacy policies:
        </p>
        <ul>
          <li>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer">
              Facebook Privacy Policy
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Data Retention and Deletion</h2>
        <p>
          We retain your basic profile data (name, email, profile picture) for as long as your account is active. You may request deletion of your data at any time by contacting us.
        </p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>
          You can:
        </p>
        <ul>
          <li>Request access to your data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
        </ul>
        <p>
          To make such requests, email us at <a href="mailto:support@example.com">support@example.com</a>.
        </p>
      </section>

      <section>
        <h2>6. Contact Information</h2>
        <p>
          If you have questions or concerns about this policy, contact us at:
        </p>
        <p>
          Email: <a href="mailto:support@example.com">support@example.com</a>
        </p>
      </section>

      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        Last updated: June 12, 2025
      </footer>
    </main>
  );
};

export default PrivacyPage;
