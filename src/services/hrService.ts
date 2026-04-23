import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';

export interface Employee {
  id?: string;
  name: string;
  nationalId: string;
  governorate: string;
  department: string;
  position: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'suspended' | 'terminated';
  email: string;
  phone: string;
}

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName?: string;
  type: 'annual' | 'sick' | 'unpaid' | 'emergency';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
}

export interface EOSRecord {
  id?: string;
  employeeId: string;
  employeeName?: string;
  calculationDate: string;
  yearsOfService: number;
  totalBenefit: number;
  lastSalary: number;
  notes: string;
}

// Yemeni Labor Law EOS Logic
// According to Law No. 5 of 1995: 1 month salary for each year of service.
export function calculateYemenEOS(salary: number, joinDateStr: string) {
  const joinDate = new Date(joinDateStr);
  const now = new Date();
  
  const totalMonths = differenceInMonths(now, joinDate);
  const totalYears = totalMonths / 12;
  
  if (totalYears < 1) return 0;
  
  // 1 month salary per year
  return salary * totalYears;
}

export const hrService = {
  // Employees
  async getEmployees() {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  },
  
  subscribeEmployees(callback: (employees: Employee[]) => void) {
    return onSnapshot(collection(db, 'employees'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });
  },

  async addEmployee(employee: Employee) {
    return addDoc(collection(db, 'employees'), employee);
  },

  async updateEmployee(id: string, employee: Partial<Employee>) {
    return updateDoc(doc(db, 'employees', id), employee);
  },

  // Leave Requests
  async addLeaveRequest(request: LeaveRequest) {
    return addDoc(collection(db, 'leaveRequests'), {
      ...request,
      createdAt: new Date().toISOString()
    });
  },

  subscribeLeaveRequests(callback: (requests: LeaveRequest[]) => void) {
    return onSnapshot(collection(db, 'leaveRequests'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
    });
  },

  async updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    return updateDoc(doc(db, 'leaveRequests', id), { status });
  },

  // Admins
  async isUserAdmin(uid: string) {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  }
};
