import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Filter, KeyRound, Shield, Building, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/user.service';
import { branchService } from '../services/branch.service';
import { departmentService } from '../services/department.service';
import UnifiedUserEmployeeModal from '../components/common/UnifiedUserEmployeeModal';
import StatusChip from '../components/common/StatusChip';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [uRes, rRes, bRes, dRes] = await Promise.all([
        userService.getUsers({ page: pagination.page, limit: pagination.limit, search, role: selectedRole, status: selectedStatus }),
        userService.getRoles(),
        branchService.getBranches(),
        departmentService.getDepartments(),
      ]);

      if (uRes?.data) {
        setUsers(uRes.data.users || []);
        setPagination((prev) => ({ ...prev, total: uRes.data.pagination.total }));
      }
      if (rRes?.data?.roles) setRoles(rRes.data.roles);
      if (bRes?.data?.branches) setBranches(bRes.data.branches);
      if (dRes?.data?.departments) setDepartments(dRes.data.departments);
    } catch (err) {
      toast.error('Failed to load system users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, selectedRole, selectedStatus]);

  const handleSaveUnifiedUser = async (formData) => {
    setIsLoading(true);
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser._id, formData);
        toast.success('System User account updated!');
      } else {
        await userService.createUser(formData);
        toast.success('Unified User & Employee account provisioned!');
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    const newPass = window.prompt(`Enter new password for ${userEmail}:`);
    if (!newPass || newPass.length < 6) {
      if (newPass) toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      await userService.resetUserPassword(userId, newPass);
      toast.success(`Password reset successfully for ${userEmail}.`);
    } catch (err) {
      toast.error('Failed to reset password.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            System User & Role Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Unified Provisioning for Admins, HR, Printer Operators, Security Officers, & Employees.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Unified Account
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Name, Email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Emp ID</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Branch Scope</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading Users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {u.employeeId}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.role?.name || 'User'}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">
                      {u.branch?.name || 'Global / All Branches'}
                    </td>

                    <td className="p-3.5">
                      <StatusChip status={u.status} />
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Reset Password"
                          onClick={() => handleResetPassword(u._id, u.email)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          title="Edit User & Employee Details"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                          <Shield className="w-4 h-4" />
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

      <UnifiedUserEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSaveUnifiedUser}
        initialData={selectedUser}
        roles={roles}
        branches={branches}
        departments={departments}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UsersPage;
