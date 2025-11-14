import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/apiClient';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const res = await userAPI.login({ username, password });
      const data = res.data;
      
      // Store token and user data
      login(data.accessToken, data.role, data.user);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background with professional gradient */}
      <div style={styles.background}>
        <div style={styles.gradientOverlay}></div>
        <div style={styles.patternOverlay}></div>
      </div>
      
      {/* Left side - Branding */}
      <div style={styles.brandSection}>
        <div style={styles.brandContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🏢</div>
            <div style={styles.logoText}>RealEstateCrm</div>
          </div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Welcome to <span style={styles.heroHighlight}>RealEstateCrm</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Streamline your sales pipeline, manage customer relationships, 
              and drive business growth with our comprehensive CRM platform.
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <div style={styles.featureIcon}>*</div>
                <span>Advanced Analytics</span>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIcon}>*</div>
                <span>Client Management</span>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIcon}>*</div>
                <span>Sales Automation</span>
              </div>
            </div>
          </div>
          <div style={styles.footerNote}>
            <div style={styles.securityBadge}>
              <svg style={styles.shieldIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              Enterprise-grade security
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={styles.loginSection}>
        <div style={styles.loginCard}>
          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>Sign In</h2>
            <p style={styles.subtitle}>Access your CRM dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Username</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(null);
                    }}
                    required
                    disabled={loading}
                    style={{
                      ...styles.input,
                      ...(error ? styles.inputError : {})
                    }}
                    onKeyPress={handleKeyPress}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div style={styles.inputContainer}>
                <label style={styles.inputLabel}>Password</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    disabled={loading}
                    style={{
                      ...styles.input,
                      ...(error ? styles.inputError : {})
                    }}
                    onKeyPress={handleKeyPress}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={styles.errorMessage}>
                <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {error}
              </div>
            )}

            <div style={styles.formFooter}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonLoading : {})
                }}
              >
                {loading ? (
                  <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    Authenticating...
                  </div>
                ) : (
                  <div style={styles.buttonContent}>
                    Sign In to Dashboard
                    <svg style={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
              
              <div style={styles.supportText}>
                Need help? Contact your system administrator or call +251970124500
              </div>
            </div>
          </form>

          {/* Additional Info */}
          <div style={styles.additionalInfo}>
            <div style={styles.infoItem}>
              <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>SSO and MFA supported</span>
            </div>
            <div style={styles.infoItem}>
              <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Enterprise security compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: 'relative' as 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    zIndex: -1,
  },
  gradientOverlay: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
  },
  patternOverlay: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  brandSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: 'white',
    animation: 'slideInLeft 0.8s ease-out',
  },
  brandContent: {
    maxWidth: '600px',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '60px',
  },
  logoIcon: {
    fontSize: '40px',
    marginRight: '16px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '12px',
    padding: '12px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff, #e2e8f0)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroContent: {
    marginBottom: '60px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: 1.2,
    margin: '0 0 24px 0',
    color: 'white',
  },
  heroHighlight: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '20px',
    lineHeight: 1.6,
    color: '#cbd5e1',
    margin: '0 0 40px 0',
    fontWeight: '400',
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '16px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    color: '#e2e8f0',
    fontWeight: '500',
  },
  featureIcon: {
    fontSize: '20px',
    marginRight: '12px',
    width: '24px',
    textAlign: 'center' as 'center',
  },
  footerNote: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '24px',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  shieldIcon: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
    color: '#10b981',
  },
  loginSection: {
    flex: '0 0 500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: 'white',
    animation: 'slideInRight 0.8s ease-out',
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center' as 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '16px',
    margin: 0,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  inputContainer: {
    marginBottom: '24px',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative' as 'relative',
  },
  inputIcon: {
    position: 'absolute' as 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#9ca3af',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '2px solid #f1f5f9',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as 'border-box',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    ':hover': {
      borderColor: '#cbd5e1',
    },
  },
  inputError: {
    borderColor: '#fecaca',
    animation: 'shake 0.5s ease-in-out',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid #fecaca',
    animation: 'fadeIn 0.3s ease-out',
  },
  errorIcon: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
  },
  formFooter: {
    marginBottom: '32px',
  },
  submitButton: {
    width: '100%',
    padding: '18px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
    marginBottom: '16px',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
  submitButtonLoading: {
    opacity: 0.8,
    cursor: 'not-allowed',
    transform: 'none !important',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  arrowIcon: {
    width: '18px',
    height: '18px',
    marginLeft: '8px',
  },
  supportText: {
    textAlign: 'center' as 'center',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
  },
  additionalInfo: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '24px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
  },
  infoIcon: {
    width: '16px',
    height: '16px',
    marginRight: '12px',
    color: '#3b82f6',
  },
};