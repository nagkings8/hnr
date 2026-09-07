import React, { useState } from 'react';
import { StaffUser } from '../../types';
import { X, UserPlus } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: StaffUser) => void;
  onShowToast: (msg: string) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [cadre, setCadre] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cadre.trim()) {
      onShowToast('Please enter both name and cadre.');
      return;
    }

    const newUser: StaffUser = {
      id: Date.now(),
      name: name.trim(),
      role: 'STAFF',
      cadre: cadre.trim(),
      active: true,
    };

    onSave(newUser);
    setName('');
    setCadre('');
    onClose();
    onShowToast(`Staff account for ${newUser.name} created successfully!`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-[#061122] text-white px-5 py-3.5 flex justify-between items-center border-b-2 border-amber-500">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Add Staff Account</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Staff Member Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. K. Ramesh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Cadre / Designation *</label>
            <input
              type="text"
              required
              placeholder="e.g. Junior Assistant / Typist"
              value={cadre}
              onChange={(e) => setCadre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-1.5 rounded-md font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-bold transition cursor-pointer shadow-xs"
            >
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
