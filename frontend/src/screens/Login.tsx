import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, Lock } from 'lucide-react';
import { useRole, ROLE_USERS, type UserRole } from '../context/RoleContext';

// Default landing page per role
const ROLE_HOME: Record<UserRole, string> = {
  'HR Staff': '/employees',
  'HR Manager': '/org-overview',
  'Data / AI Analyst': '/data-overview',
  'System Administrator': '/admin-overview',
};

const roleColors: Record<UserRole, string> = {
  'HR Staff': 'bg-gray-100 text-gray-700 border-gray-300',
  'HR Manager': 'bg-blue-50 text-blue-700 border-blue-300',
  'Data / AI Analyst': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  'System Administrator': 'bg-violet-50 text-violet-700 border-violet-300',
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useRole();
  const [showPass, setShowPass] = useState(false);
  const [selectedUserIdx, setSelectedUserIdx] = useState(1); // default HR Manager
  const [password, setPassword] = useState('password');

  const selectedUser = ROLE_USERS[selectedUserIdx];

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setUser(selectedUser);
    navigate(ROLE_HOME[selectedUser.role]);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-[#4F46E5] flex items-center justify-center" style={{ borderRadius: '6px' }}>
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-gray-900 leading-none">ERIS</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Employee Retention Intelligence System</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6" style={{ borderRadius: '7px' }}>
          <h1 className="text-[20px] font-semibold text-gray-900 mb-0.5">Sign in</h1>
          <p className="text-[13px] text-gray-500 mb-5">Sign in to continue to ERIS</p>

          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Account selector */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account</label>
              <div className="space-y-1.5">
                {ROLE_USERS.map((u, i) => (
                  <label
                    key={u.email}
                    className={`flex items-center gap-3 px-3 py-2 border cursor-pointer transition-colors ${
                      selectedUserIdx === i
                        ? 'border-[#4F46E5] bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ borderRadius: '5px' }}
                  >
                    <input
                      type="radio"
                      name="account"
                      checked={selectedUserIdx === i}
                      onChange={() => setSelectedUserIdx(i)}
                      className="accent-[#4F46E5]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-800">{u.name}</div>
                      <div className="text-[12px] text-gray-400">{u.email}</div>
                    </div>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-medium text-gray-700">Password</label>
                <button type="button" className="text-[12px] text-[#4F46E5] hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-[34px] px-2.5 pr-9 border border-slate-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                  style={{ borderRadius: '5px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-3.5 h-3.5" style={{ borderRadius: '3px' }} />
              <label htmlFor="remember" className="text-[13px] text-gray-600">Remember me</label>
            </div>

            <button
              type="submit"
              className="w-full h-[34px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-medium transition-colors"
              style={{ borderRadius: '5px' }}
            >
              Sign in as {selectedUser.role}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
            <Lock size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-[12px] text-gray-400">Secure access to employee retention intelligence.</span>
          </div>
        </div>

        <div className="mt-4 text-center text-[12px] text-gray-400">© 2026 ERIS — Graduation Capstone Project</div>
      </div>
    </div>
  );
}
