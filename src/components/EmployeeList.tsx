import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  X,
  MapPin,
  Briefcase,
  IdCard,
  CreditCard,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { hrService, Employee } from '../services/hrService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function EmployeeList({ isAdmin }: { isAdmin: boolean }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    return hrService.subscribeEmployees(setEmployees);
  }, []);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.nationalId.includes(search) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.salary = Number(data.salary);
    
    try {
      if (editingEmployee?.id) {
        await hrService.updateEmployee(editingEmployee.id, data);
      } else {
        await hrService.addEmployee(data);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error(err);
      alert('Action Failed. Check permissions.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 text-xs font-bold uppercase hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          {isAdmin && (
            <button 
              onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus size={16} />
              Add Record
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map((emp) => (
          <motion.div 
            layout
            key={emp.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">
                    {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{emp.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{emp.position} • {emp.department}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                    <IdCard size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">ID Number</p>
                    <p className="text-xs font-mono font-medium text-slate-600 truncate">{emp.nationalId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Governorate</p>
                    <p className="text-xs font-semibold text-slate-600 uppercase">{emp.governorate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                    <CreditCard size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Monthly Base</p>
                    <p className="text-xs font-bold text-blue-600">YR {emp.salary.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <StatusIndicator status={emp.status} />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400"><Mail size={10} /></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400"><Phone size={10} /></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{emp.email}</span>
                </div>
                <button className="text-[10px] font-bold uppercase text-blue-600 hover:tracking-widest transition-all">View Full Profile →</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Users size={48} className="mx-auto mb-4 text-slate-100" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">No organizational data found</h3>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-black transition-all shadow-lg"
            >
              Add First Employee
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                <h2 className="text-xl font-bold text-slate-800">{editingEmployee ? 'Edit Profile' : 'New Employee Entry'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormInput label="Full Name" name="name" defaultValue={editingEmployee?.name} required />
                  </div>
                  <FormInput label="National ID Number" name="nationalId" defaultValue={editingEmployee?.nationalId} required />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Office Location</label>
                    <select 
                      name="governorate" 
                      defaultValue={editingEmployee?.governorate || 'Sana\'a'}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option>Sana'a</option>
                      <option>Aden</option>
                      <option>Taiz</option>
                      <option>Hadramout</option>
                      <option>Ibb</option>
                    </select>
                  </div>
                  <FormInput label="Department" name="department" defaultValue={editingEmployee?.department} />
                  <FormInput label="Position" name="position" defaultValue={editingEmployee?.position} />
                  <FormInput label="Join Date" name="joinDate" type="date" defaultValue={editingEmployee?.joinDate.split('T')[0]} required />
                  <FormInput label="Basic Salary (YR)" name="salary" type="number" defaultValue={editingEmployee?.salary} required />
                  <FormInput label="Phone Number" name="phone" defaultValue={editingEmployee?.phone} />
                  <div className="md:col-span-2">
                    <FormInput label="Work Email" name="email" type="email" defaultValue={editingEmployee?.email} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Employment Status</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['active', 'suspended', 'terminated'].map((stat) => (
                        <label key={stat} className="cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            value={stat} 
                            defaultChecked={(editingEmployee?.status || 'active') === stat}
                            className="hidden peer"
                          />
                          <div className="p-3 text-center rounded-xl border border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all">
                            {stat}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-50">
                  <button 
                    type="submit" 
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                  >
                    Confirm & Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, name, type = 'text', defaultValue, required }: { label: string, name: string, type?: string, defaultValue?: any, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{label}</label>
      <input 
        type={type} 
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const styles = {
    active: 'bg-green-50 text-green-600 border-green-100',
    suspended: 'bg-amber-50 text-amber-600 border-amber-100',
    terminated: 'bg-slate-50 text-slate-600 border-slate-100'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300')}></div>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-tight",
        styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-400 border-slate-100'
      )}>
        {status}
      </span>
    </div>
  );
}

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  null // Removed from UI in this theme or used within StatusBadge
);
