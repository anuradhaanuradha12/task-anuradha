import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { FolderDot, User, Mail, Lock, Award, Loader2 } from 'lucide-react';

const AVATAR_OPTIONS = ['S', 'SC', 'JD', 'ER', 'A', 'M', 'E', 'TF'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [avatar, setAvatar] = useState('TF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field Validations
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, avatar);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Register Card */}
      <div className="relative w-full max-w-md border bg-card/65 p-8 rounded-3xl shadow-2xl glass select-none">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <FolderDot className="h-6 w-6 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mt-1">
            Create an Account
          </h2>
          <p className="text-xs text-muted-foreground">
            Get started with TaskFlow team collaboration today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Connor"
                className="w-full h-11 pl-11 pr-4 text-xs font-semibold rounded-xl border border-input bg-background/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="connor@example.com"
                className="w-full h-11 pl-11 pr-4 text-xs font-semibold rounded-xl border border-input bg-background/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 pl-11 pr-4 text-xs font-semibold rounded-xl border border-input bg-background/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Team Role
            </label>
            <div className="relative">
              <Award className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 pl-11 pr-4 text-xs font-semibold rounded-xl border border-input bg-background/30 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground transition-all"
              >
                <option value="Employee">Employee (Developer/Designer)</option>
                <option value="Manager">Manager (Product Manager/Lead)</option>
                <option value="Admin">Admin (Administrator)</option>
              </select>
            </div>
          </div>

          {/* Avatar choice */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Profile Initials / Badge
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAvatar(opt)}
                  className={`h-8 w-8 rounded-full border text-[10px] font-bold uppercase flex items-center justify-center transition-all ${
                    avatar === opt
                      ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-md shadow-primary/25'
                      : 'bg-background hover:bg-secondary border-input text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Action submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

        </form>

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline hover:text-primary/90 transition-all"
          >
            Sign in
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Register;
