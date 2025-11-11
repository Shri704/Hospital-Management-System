import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiActivity, FiPhone } from 'react-icons/fi';

const Signup = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1576765608610-cf05b0f36f8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80" />
      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <FiActivity className="text-white" size={36} />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Patient Account</h1>
            <p className="text-blue-100 mt-1">Sign up to manage your appointments</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-300/50 text-red-100 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input value={form.firstName} onChange={onChange('firstName')} required className="w-full pl-12 pr-4 py-3 bg-white/15 text-white placeholder-blue-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="First name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Last Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input value={form.lastName} onChange={onChange('lastName')} required className="w-full pl-12 pr-4 py-3 bg-white/15 text-white placeholder-blue-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Last name" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input type="email" value={form.email} onChange={onChange('email')} required className="w-full pl-12 pr-4 py-3 bg-white/15 text-white placeholder-blue-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input value={form.phone} onChange={onChange('phone')} required className="w-full pl-12 pr-4 py-3 bg-white/15 text-white placeholder-blue-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Phone number" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <input type="password" value={form.password} onChange={onChange('password')} required className="w-full pl-12 pr-4 py-3 bg-white/15 text-white placeholder-blue-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Create a password" />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">{loading ? 'Creating...' : 'Create Account'}</button>
            <p className="text-center text-blue-100 text-sm">Already have an account? <Link to="/login" className="underline">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
