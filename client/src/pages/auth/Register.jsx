import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError('root', {
        message:
          err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          'Registration failed.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
      <p className="text-slate-400 text-sm mb-8">Start booking your trips today</p>

      {errors.root && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">First name</label>
            <input
              type="text"
              {...register('first_name', { required: 'First name is required.' })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              placeholder="Mihai"
            />
            {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Last name</label>
            <input
              type="text"
              {...register('last_name', { required: 'Last name is required.' })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              placeholder="Popescu"
            />
            {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required.' })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Phone (optional)</label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            placeholder="+40 700 000 000"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Min. 8 characters.' },
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            placeholder="Min. 8 characters"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm mt-2"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-500 text-xs">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <a
        href={GOOGLE_AUTH_URL}
        className="flex items-center justify-center gap-3 w-full border border-slate-700 hover:border-slate-500 rounded-xl py-3 text-sm text-slate-300 hover:text-white transition"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
          <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
          <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z" />
        </svg>
        Continue with Google
      </a>

      <p className="text-center text-slate-500 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
