import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  FileText,
  AlertTriangle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { hrService, Employee, LeaveRequest } from '../services/hrService';
import { cn } from '../lib/utils';
import { StatusBadge } from './Dashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function LeaveManagement({ isAdmin, userEmail }: { isAdmin: boolean, userEmail: string }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    hrService.getEmployees().then(setEmployees);
    return hrService.subscribeLeaveRequests(setRequests);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // Find current employee id if linking by name (simplified for demo)
    const emp = employees.find(e => e.name === data.employeeName);
    
    await hrService.addLeaveRequest({
      employeeId: emp?.id || 'temp-id',
      employeeName: data.employeeName,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    setIsModalOpen(false);
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!isAdmin) return;
    await hrService.updateLeaveStatus(id, status);
  };

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="space-y-8">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase transition-all rounded-lg",
                filter === f ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Class</th>
                <th className="px-6 py-4">Scheduled Window</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{req.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {req.employeeId.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{req.type}</span>
                  </td>
                  <td className="px-6 py-4 group-hover:scale-105 transition-transform origin-left">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{req.startDate}</span>
                      <ChevronRight size={12} className="text-slate-300" />
                      <span>{req.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(req.id!, 'approved')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req.id!, 'rejected')}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-slate-300">
                        <FileText size={16} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Registry empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8">
                <h2 className="text-xl font-bold text-slate-800">New Leave Petition</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Requester Profile</label>
                    <input 
                      name="employeeName" 
                      list="emps" 
                      placeholder="Search names..."
                      required 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    />
                    <datalist id="emps">
                      {employees.map(e => <option key={e.id} value={e.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Leave Class</label>
                    <select name="type" className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none uppercase font-bold text-slate-600">
                      <option value="annual">Annual (Standard)</option>
                      <option value="sick">Sick / Medical</option>
                      <option value="emergency">Emergency / Humanitarian</option>
                      <option value="unpaid">Unpaid Personal</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Start Point</label>
                      <input type="date" name="startDate" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Termination</label>
                      <input type="date" name="endDate" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Internal Context</label>
                    <textarea name="reason" rows={3} placeholder="Provide case details..." className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" />
                  </div>
                </div>

                <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                  Authorize & Submit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
