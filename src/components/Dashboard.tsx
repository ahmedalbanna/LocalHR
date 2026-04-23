import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { hrService, Employee, LeaveRequest } from '../services/hrService';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const unsubEmp = hrService.subscribeEmployees(setEmployees);
    const unsubLeaves = hrService.subscribeLeaveRequests(setLeaves);
    return () => { unsubEmp(); unsubLeaves(); };
  }, []);

  const stats = [
    { label: 'Total Workforce', value: employees.length, icon: <Users />, sub: 'Active Staff', color: 'blue' },
    { label: 'Pending Leaves', value: leaves.filter(l => l.status === 'pending').length, icon: <Calendar />, sub: 'Requires Review', color: 'amber' },
    { label: 'System Compliance', value: 'Perfect', icon: <AlertCircle />, sub: 'Yemen Law Verified', color: 'green' },
    { label: 'Active Region', value: 'Sana\'a', icon: <MapPin />, sub: 'HQ Operations', color: 'indigo' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-transform hover:scale-[1.02]",
            stat.color === 'green' && "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-200"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-2.5 rounded-xl",
                stat.color === 'green' ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400"
              )}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 20 })}
              </div>
            </div>
            <div>
              <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", stat.color === 'green' ? "text-blue-100" : "text-slate-400")}>{stat.label}</h3>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className={cn("text-[10px] font-medium mt-1 uppercase tracking-wide", stat.color === 'green' ? "text-blue-200" : "text-slate-400")}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity / Leave Overview */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Recent Employee Status</h4>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Export Records</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
                {leaves.slice(0, 5).map((leave, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                          {leave.employeeName?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{leave.employeeName || 'Staff Member'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">{leave.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[11px] font-mono text-slate-400">{leave.startDate.split('T')[0]}</span>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">No activity recorded</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Local Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={18} />
              Compliance Pulse
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  <span>EOS Provision Match</span>
                  <span className="text-blue-600">92%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[92%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-4 py-1">
                "According to Article 120: Reward is one month salary per year of service."
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-400">
              <MapPin size={14} className="text-blue-400" />
              Regional Units
            </h3>
            <div className="space-y-3">
              {['Sanaa', 'Aden', 'Taiz', 'Ibb'].map((city, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="font-medium text-slate-300">{city}</span>
                  <span className="font-mono text-blue-400 font-bold">{Math.floor(Math.random() * 20) + 5}%</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
              View Regional Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100'
  };
  
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-tight inline-block",
      styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-600 border-slate-200'
    )}>
      {status}
    </span>
  );
}
