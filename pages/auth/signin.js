// pages/auth/signin.js

export default function SignIn() {
  return (
    <div className="signin-container">
      <div className="signin-form">
        <h2>Authentication Disabled</h2>
        <p>Authentication has been temporarily disabled. You can access the uploader directly.</p>
      </div>

      <style jsx>{`
        .signin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #111;
          color: white;
        }
        .signin-form {
          background: #1c1c1c;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          max-width: 400px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
