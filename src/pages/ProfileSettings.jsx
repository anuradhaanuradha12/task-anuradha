import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Shield, Palette, CheckCircle2 } from 'lucide-react';
import { toast } from '../utils/toast';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Notification states
  const [notifyAssignment, setNotifyAssignment] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyStatusChange, setNotifyStatusChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile configurations updated successfully');
    }, 600);
  };

  return (
    <div className="space-y-6 select-none max-w-3xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal account parameters, email notifications, and UI preferences.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          {/* Large initials badge */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white font-extrabold text-2xl uppercase flex items-center justify-center shadow-lg shadow-primary/20 select-none">
            {user?.name?.slice(0, 2).toUpperCase() || 'TF'}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
              {user?.name}
              <span className="text-[10px] font-extrabold bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">
                {user?.role}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center justify-center sm:justify-start gap-1 font-medium">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Role permissions limits: {user?.role === 'Admin' ? 'Unlimited access' : user?.role === 'Manager' ? 'Task Creation & Assignment' : 'Task Status updates'}
            </p>
          </div>
        </div>

        {/* Configurations Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Notifications Panel */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Email Notifications Preferences
            </h3>

            <div className="space-y-3.5">
              {/* Toggle 1 */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Task Assignments
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    Send an email when team members assign tasks to you.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAssignment}
                  onChange={(e) => setNotifyAssignment(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary/45 h-4 w-4 cursor-pointer"
                />
              </label>

              {/* Toggle 2 */}
              <label className="flex items-center justify-between cursor-pointer group border-t border-border/40 pt-3.5">
                <div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Task Discussion & Comments
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    Send email alerts when updates or comments are posted on your tasks.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyComments}
                  onChange={(e) => setNotifyComments(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary/45 h-4 w-4 cursor-pointer"
                />
              </label>

              {/* Toggle 3 */}
              <label className="flex items-center justify-between cursor-pointer group border-t border-border/40 pt-3.5">
                <div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Workflow Status Shifts
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    Send emails when other team members update the Kanban boards status.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyStatusChange}
                  onChange={(e) => setNotifyStatusChange(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary/45 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Theme Palette controls */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
              <Palette className="h-4.5 w-4.5 text-primary" />
              Interface Theme Settings
            </h3>

            <div className="flex items-center justify-between cursor-pointer group" onClick={toggleTheme}>
              <div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Enable Dark Mode Interface
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  Switches the screen color palettes to slate/navy themes to reduce eye strain.
                </span>
              </div>
              
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDark ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/25 cursor-pointer disabled:opacity-75"
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            {loading ? 'Saving preferences...' : 'Save Settings'}
          </button>

        </form>

      </div>

    </div>
  );
};

export default ProfileSettings;
