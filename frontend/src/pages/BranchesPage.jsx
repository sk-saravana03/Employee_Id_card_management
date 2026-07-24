import React, { useState, useEffect } from 'react';
import { Building, Plus, Users, UserCheck, MapPin, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { branchService } from '../services/branch.service';
import { userService } from '../services/user.service';
import BranchModal from '../components/branch/BranchModal';
import StatusChip from '../components/common/StatusChip';

export const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([
        branchService.getBranches(),
        userService.getUsers({ limit: 100 }),
      ]);
      if (bRes?.data?.branches) setBranches(bRes.data.branches);
      if (uRes?.data?.users) setUsers(uRes.data.users);
    } catch (err) {
      toast.error('Failed to load branches.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSaveBranch = async (data) => {
    setIsLoading(true);
    try {
      if (selectedBranch) {
        await branchService.updateBranch(selectedBranch._id, data);
        toast.success('Branch updated successfully!');
      } else {
        await branchService.createBranch(data);
        toast.success('New branch provisioned!');
      }
      setIsModalOpen(false);
      setSelectedBranch(null);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save branch.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await branchService.deleteBranch(id);
      toast.success('Branch removed.');
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete branch.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-emerald-600" />
            Branch Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin Governance across Corporate Locations, Branch Admins, & Employees.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedBranch(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Branch Office
        </button>
      </div>

      {/* Grid of Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading Branches...</div>
        ) : branches.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">No branches configured.</div>
        ) : (
          branches.map((branch) => (
            <div
              key={branch._id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {branch.name}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        {branch.code}
                      </span>
                    </div>
                  </div>
                  <StatusChip status={branch.status} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {branch.city || 'HQ Region'}, {branch.country || 'Global'}
                    </span>
                  </div>
                  {branch.address && (
                    <p className="text-[11px] text-slate-400 pl-6">{branch.address}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Admin:{' '}
                      <strong className="text-slate-800">
                        {branch.branchAdmin
                          ? `${branch.branchAdmin.firstName} ${branch.branchAdmin.lastName}`
                          : 'Unassigned'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{branch.totalEmployees || 0} Employees</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={handleSaveBranch}
        branch={selectedBranch}
        users={users}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BranchesPage;
