/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Calculator, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  Search,
  Plus,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { cn } from './lib/utils';
import { hrService, Employee, LeaveRequest } from './services/hrService';
import EmployeeList from './components/EmployeeList';
import LeaveManagement from './components/LeaveManagement';
import EOSCalculator from './components/EOSCalculator';
import Dashboard from './components/Dashboard';

type View = 'dashboard' | 'employees' | 'leaves' | 'eos';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Auto-provision admin for the creator email if admins collection is empty (simplified for demo)
        // In a real app, this would be restricted.
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          // Check if it's the specific user from metadata to bootstrap first admin
          if (user.email === 'ahmedalbannatech@gmail.com') {
            await setDoc(doc(db, 'admins', user.uid), { email: user.email, role: 'owner' });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-600 selection:text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50"
        >
          <div className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">HR</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">ProLabor</h1>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Yemen Compliance</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={login}
              className="w-full h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-black transition-all group shadow-lg"
            >
              <Users className="w-5 h-5" />
              <span className="font-bold tracking-wide">Sign in with Google</span>
            </button>
            <p className="text-[10px] uppercase text-center text-slate-400 font-semibold tracking-widest">Administrative Access Protocol</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-slate-200 flex flex-col relative z-50 shrink-0"
          >
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">HR</div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold tracking-tight text-slate-800 truncate">ProLabor</h1>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Compliance V4.2</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <NavItem 
                  label="Dashboard" 
                  icon={<LayoutDashboard size={18} />} 
                  active={currentView === 'dashboard'} 
                  onClick={() => setCurrentView('dashboard')} 
                />
                <NavItem 
                  label="Employees" 
                  icon={<Users size={18} />} 
                  active={currentView === 'employees'} 
                  onClick={() => setCurrentView('employees')} 
                />
                <NavItem 
                  label="Payroll & Leave" 
                  icon={<Calendar size={18} />} 
                  active={currentView === 'leaves'} 
                  onClick={() => setCurrentView('leaves')} 
                />
                <NavItem 
                  label="EOS Calculator" 
                  icon={<Calculator size={18} />} 
                  active={currentView === 'eos'} 
                  onClick={() => setCurrentView('eos')} 
                />
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-100">
              <div className="bg-slate-900 rounded-2xl p-4 text-white mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{user.displayName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">{isAdmin ? 'ADMIN' : 'STAFF'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase transition-colors"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg border border-slate-200 transition-colors">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-800 capitalize">{currentView}</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Labor law compliance engine active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Yemeni Law Verified</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'employees' && <EmployeeList isAdmin={isAdmin} />}
              {currentView === 'leaves' && <LeaveManagement isAdmin={isAdmin} userEmail={user.email || ''} />}
              {currentView === 'eos' && <EOSCalculator isAdmin={isAdmin} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-blue-50 text-blue-700 font-bold" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      <span className={cn(active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500")}>{icon}</span>
      {label}
    </button>
  );
}
