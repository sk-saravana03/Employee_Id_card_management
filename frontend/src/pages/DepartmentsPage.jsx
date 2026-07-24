import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, Building, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentService } from '../services/department.service';
import { branchService } from '../services/branch.service';
import { userService } from '../services/user.service';
import DepartmentModal from '../components/department/DepartmentModal';
import StatusChip from '../components/common/StatusChip';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const [dRes, bRes, uRes] = await Promise.all([
        departmentService.getDepartments(selectedBranch),
        branchService.getBranches(),
        userService.getUsers({ limit: 100 }),
      ]);
      if (dRes?.data?.departments) setDepartments(dRes.data.departments);
      if (bRes?.data?.branches) setBranches(bRes.data.branches);
      if (uRes?.data?.users) setUsers(uRes.data.users);
    } catch (err) {
      toast.error('Failed to load departments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [selectedBranch]);

  const handleSaveDepartment = async (data) => {
    setIsLoading(true);
    try {
      if (selectedDept) {
        await departmentService.updateDepartment(selectedDept._id, data);
        toast.success('Department updated successfully!');
      } else {
        await departmentService.createDepartment(data);
        toast.success('Department created!');
      }
      setIsModalOpen(false);
      setSelectedDept(null);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.deleteDepartment(id);
      toast.success('Department deleted.');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Department Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department Structure, Department Heads, & Employee Allocation Stats.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDept(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      {/* Branch Filter */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xs">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading Departments...</div>
        ) : departments.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">No departments configured.</div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {dept.name}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <StatusChip status={dept.status} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <p>
                    Branch: <strong className="text-slate-700 dark:text-slate-300">{dept.branch?.name || 'Unassigned'}</strong>
                  </p>
                  {dept.description && <p className="text-[11px] text-slate-400">{dept.description}</p>}
                  <p>
                    Department Lead:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {dept.departmentHead
                        ? `${dept.departmentHead.firstName} ${dept.departmentHead.lastName}`
                        : 'Unassigned'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{dept.totalEmployees || 0} Employees</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedDept(dept);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDept(null);
        }}
        onSubmit={handleSaveDepartment}
        department={selectedDept}
        branches={branches}
        users={users}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DepartmentsPage;
