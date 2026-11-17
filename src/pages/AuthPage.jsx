import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact_number: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = isRegister
        ? await register(form)
        : await login(form.email, form.password);

      navigate(loggedUser.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>{isRegister ? 'Create Guest Account' : 'Sign In to OceanBreeze'}</h2>
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>
                Full Name
                <input name="name" required value={form.name} onChange={handleChange} />
              </label>
              <label>
                Contact Number
                <input name="contact_number" placeholder="0771234567" value={form.contact_number} onChange={handleChange} />
              </label>
            </>
          )}

          <label>
            Email Address
            <input type="email" name="email" required value={form.email} onChange={handleChange} />
          </label>

          <label>
            Password
            <input type="password" name="password" required value={form.password} onChange={handleChange} />
          </label>

          {isRegister && (
            <label>
              Confirm Password
              <input type="password" name="password_confirmation" required value={form.password_confirmation} onChange={handleChange} />
            </label>
          )}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="link-btn" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}