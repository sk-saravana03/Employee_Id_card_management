import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { employeeService } from '../services/employee.service';
import { userService } from '../services/user.service';
import { branchService } from '../services/branch.service';
import { departmentService } from '../services/department.service';
import UnifiedUserEmployeeModal from '../components/common/UnifiedUserEmployeeModal';
import BulkImportModal from '../components/employee/BulkImportModal';
import LifecycleTimeline from '../components/employee/LifecycleTimeline';
import StatusChip from '../components/common/StatusChip';

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const [empRes, branchRes, deptRes, roleRes] = await Promise.all([
        employeeService.getEmployees({
          page: pagination.page,
          limit: pagination.limit,
          search,
          branch: selectedBranch,
          department: selectedDept,
          status: selectedStatus,
        }),
        branchService.getBranches(),
        departmentService.getDepartments(),
        userService.getRoles(),
      ]);

      if (empRes?.data) {
        setEmployees(empRes.data.employees || []);
        setPagination((prev) => ({ ...prev, total: empRes.data.pagination.total }));
      }
      if (branchRes?.data?.branches) setBranches(branchRes.data.branches);
      if (deptRes?.data?.departments) setDepartments(deptRes.data.departments);
      if (roleRes?.data?.roles) setRoles(roleRes.data.roles);
    } catch (err) {
      toast.error('Failed to fetch employee directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, search, selectedBranch, selectedDept, selectedStatus]);

  const handleSaveUnifiedMember = async (formData) => {
    setIsLoading(true);
    try {
      if (selectedEmployee) {
        await employeeService.updateEmployee(selectedEmployee._id, formData);
        toast.success('Employee updated successfully!');
      } else {
        await userService.createUser(formData);
        toast.success('Unified Employee & User account created successfully!');
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee record?')) return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success('Employee record removed.');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const handleExportExcel = () => {
    if (employees.length === 0) {
      toast.error('No employee records to export');
      return;
    }

    const exportData = employees.map((emp) => ({
      'Employee ID': emp.employeeId,
      'Full Name': `${emp.firstName} ${emp.lastName}`,
      Email: emp.email,
      Phone: emp.phone || 'N/A',
      Designation: emp.designation,
      Branch: emp.branch?.name || 'N/A',
      Department: emp.department?.name || 'N/A',
      'Joining Date': new Date(emp.joiningDate).toLocaleDateString(),
      Status: emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, `Employee_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported Employee directory to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            Employee Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Directory, Automated Lifecycle Tracking, & Unified Member Provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" /> Bulk CSV Import
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Name, ID, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
        >
          <option value="">All Lifecycle Statuses</option>
          <option value="PRE_ACTIVATE">Pre-Activate (Future Joining)</option>
          <option value="RECRUITMENT">Recruitment</option>
          <option value="WAITING_FOR_JOINING">Waiting for Joining</option>
          <option value="ACTIVE">Active</option>
          <option value="NOTICE_PERIOD">Notice Period</option>
          <option value="AUTO_DEACTIVATED">Deactivated</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">ID Number</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Branch & Dept</th>
                <th className="p-3.5">Lifecycle Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading Employee Records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No employee records match the search filter.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600 shrink-0 border border-slate-300">
                          {emp.avatarUrl ? (
                            <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${emp.firstName[0]}${emp.lastName[0]}`
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {emp.employeeId}
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">{emp.designation}</td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{emp.branch?.name || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{emp.department?.name || 'N/A'}</p>
                    </td>

                    <td className="p-3.5">
                      <StatusChip status={emp.status} />
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Lifecycle History Log"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsTimelineOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          title="Edit Unified Record"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          title="Delete Employee"
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified User & Employee Provisioning Modal */}
      <UnifiedUserEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleSaveUnifiedMember}
        initialData={selectedEmployee}
        roles={roles}
        branches={branches}
        departments={departments}
        isLoading={isLoading}
      />

      {/* Bulk CSV Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        branches={branches}
        departments={departments}
        onSuccess={fetchEmployees}
      />

      {/* Timeline Modal */}
      <LifecycleTimeline
        isOpen={isTimelineOpen}
        onClose={() => {
          setIsTimelineOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
