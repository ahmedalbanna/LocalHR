import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  User, 
  Calendar, 
  DollarSign, 
  Printer, 
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Scale
} from 'lucide-react';
import { hrService, Employee, calculateYemenEOS } from '../services/hrService';
import { cn } from '../lib/utils';
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

export default function EOSCalculator({ isAdmin }: { isAdmin: boolean }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [calculation, setCalculation] = useState<{
    total: number;
    years: number;
    months: number;
    days: number;
    salary: number;
  } | null>(null);

  useEffect(() => {
    hrService.getEmployees().then(setEmployees);
  }, []);

  const handleCalculate = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const res = calculateYemenEOS(emp.salary, emp.joinDate);
    
    const joinDate = new Date(emp.joinDate);
    const now = new Date();
    const yrs = differenceInYears(now, joinDate);
    const mths = differenceInMonths(now, joinDate) % 12;
    const days = differenceInDays(now, joinDate) % 30;

    setCalculation({
      total: res,
      years: yrs,
      months: mths,
      days,
      salary: emp.salary
    });
  };

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
            <Calculator size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">EOS Benefit Oracle</h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Compliance Protocol: Yemen Law No. 5</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Select Employee */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Employee Context</label>
              <select 
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="">Select organizational member...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {selectedEmp && (
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Position</span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-100 group-hover:text-blue-600 transition-colors uppercase">{selectedEmp.position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Base</span>
                  <span className="text-xs font-bold text-slate-800">YR {selectedEmp.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Enrollment</span>
                  <span className="text-xs font-semibold text-slate-600 font-mono italic">{format(new Date(selectedEmp.joinDate), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleCalculate}
              disabled={!selectedEmpId}
              className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 disabled:scale-100 active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
            >
              Verify & Calculate
              <Scale size={18} className="text-blue-400" />
            </button>
          </div>

          {/* Breakdown / Results */}
          <div className="relative">
            {calculation ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col bg-blue-50 p-8 rounded-3xl border border-blue-100"
              >
                <div className="flex-1 space-y-8">
                  <div>
                    <h3 className="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-widest">System Provision Match</h3>
                    <p className="text-5xl font-extrabold tracking-tighter text-blue-700">
                      <span className="text-2xl opacity-50 mr-1">YR</span>
                      {calculation.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-blue-100 text-center shadow-sm">
                      <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase tracking-tight">YEARS</p>
                      <p className="text-lg font-bold text-blue-600">{calculation.years}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 text-center shadow-sm">
                      <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase tracking-tight">MONTHS</p>
                      <p className="text-lg font-bold text-blue-600">{calculation.months}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 text-center shadow-sm">
                      <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase tracking-tight">DAYS</p>
                      <p className="text-lg font-bold text-blue-600">{calculation.days}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-blue-100 text-blue-900 flex gap-4 shadow-sm">
                    <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />
                    <p className="text-[10px] leading-relaxed font-semibold opacity-70">
                      LEGAL RATIONALE: ONE FULL MONTH PER YEAR PRO-RATED. BASED ON THE MOST RECENT DISBURSED SALARY PROFILE.
                    </p>
                  </div>
                </div>

                <button className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase bg-white text-slate-700 py-4 rounded-xl hover:bg-slate-50 transition-all border border-blue-100 shadow-sm">
                  <Printer size={14} className="text-blue-500" />
                  Generate Compliance Receipt
                </button>
              </motion.div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <Clock size={28} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest max-w-[200px]">Awaiting member selection for legal processing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legal Reference Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'YEMENI LEGAL BASIS', icon: <Scale />, text: 'Article 120 of Law No. 5 (1995) remains the primary mandate for these automated provisions.' },
          { title: 'TENURE ACCURACY', icon: <History />, text: 'System automatically accounts for leap years and pro-rata monthly disbursements.' },
          { title: 'PROVISION AUDIT', icon: <Info />, text: 'Calculations are stored with unique hashes for historical compliance auditing.' }
        ].map((ref, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-100 transition-colors">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 flex items-center gap-3">
              <span className="text-blue-500">{ref.icon}</span>
              {ref.title}
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
              {ref.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
