const TermsPage = () => {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', margin: '15px 0', fontSize: '20px', fontWeight: '700' }}>
        Terms of Service
      </h1>

      <p>
        Welcome! By using our website or services, including signing in with Google or Facebook accounts, you agree to the following terms. Please read them carefully.
      </p>

      <section>
        <h2>1. Use of Our Service</h2>
        <p>
          You agree to use our service lawfully and responsibly. You must be at least 13 years old or the minimum age in your jurisdiction to use the service.
        </p>
      </section>

      <section>
        <h2>2. Account Registration & Authentication</h2>
        <p>
          You can register and sign in using Google or Facebook OAuth. By doing so, you permit us to access basic profile information such as your name, email, and profile picture.
        </p>
        <p>
          We do not have access to your passwords or login credentials for Google or Facebook.
        </p>
      </section>

      <section>
        <h2>3. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for any activity under your account.
        </p>
      </section>

      <section>
        <h2>4. Intellectual Property</h2>
        <p>
          All content, trademarks, and intellectual property rights on this service belong to us or our licensors. You agree not to reproduce or redistribute without permission.
        </p>
      </section>

      <section>
        <h2>5. Privacy</h2>
        <p>
          Your personal data is handled as described in our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          We provide the service "as is" without warranties. We are not liable for any damages arising from your use of the service.
        </p>
      </section>

      <section>
        <h2>7. Changes to These Terms</h2>
        <p>
          We may update these Terms at any time. Continued use after changes means you accept the new terms.
        </p>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>
          For questions or concerns regarding these Terms, please contact us at <a href="mailto:support@example.com">support@example.com</a>.
        </p>
      </section>

      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        Last updated: June 12, 2025
      </footer>
    </main>
  );
};

export default TermsPage;
