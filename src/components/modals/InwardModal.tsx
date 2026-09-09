import React, { useState, useEffect } from 'react';
import { InwardTapal, MANDAL_LIST } from '../../types';
import { getTodayDateString, isFutureDate, stampSingleDocument, setAttachmentInDB } from '../../utils/storage';
import { X, Paperclip } from 'lucide-react';

interface InwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tapal: InwardTapal) => void;
  onShowToast: (msg: string) => void;
}

export const InwardModal: React.FC<InwardModalProps> = ({ isOpen, onClose, onSave, onShowToast }) => {
  const [inwardNo, setInwardNo] = useState('');
  const [receivedDate, setReceivedDate] = useState(getTodayDateString());
  const [sender, setSender] = useState('');
  const [mandal, setMandal] = useState('GENERAL / DIVISION');
  const [seat, setSeat] = useState('D Section / Seat-1');
  const [status, setStatus] = useState('Under Scrutiny');
  const [subject, setSubject] = useState('');
  const [base64File, setBase64File] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    setInwardNo('');
    setReceivedDate(getTodayDateString());
    setSender('');
    setMandal('GENERAL / DIVISION');
    setSeat('D Section / Seat-1');
    setStatus('Under Scrutiny');
    setSubject('');
    setBase64File('');
    setFileName('');
  };

  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      onShowToast('File size exceeds 8MB. Please select a smaller file.');
      e.target.value = '';
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64File(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFutureDate(receivedDate)) {
      onShowToast('⚠️ Future dates are not allowed! Please select today or a past date.');
      return;
    }

    setIsSaving(true);
    const newId = Date.now();
    const inwAttKey = `inw_${newId}`;
    let stampedFile = base64File;

    if (base64File) {
      try {
        const stampText = `INWARD NO: ${inwardNo.trim()} | RECEIVED: ${receivedDate} | SENDER: ${sender
          .trim()
          .substring(0, 32)}`;
        stampedFile = await stampSingleDocument(base64File, stampText);
        await setAttachmentInDB(inwAttKey, stampedFile);
      } catch (err) {
        console.warn('Error stamping inward doc:', err);
      }
    }

    const newRecord: InwardTapal = {
      id: newId,
      inwardNo: inwardNo.trim(),
      receivedDate,
      sender: sender.trim(),
      mandal,
      seat: seat.trim() || '-',
      status,
      subject: subject.trim(),
      hasAttachment: !!stampedFile,
      attachmentKey: stampedFile ? inwAttKey : null,
    };

    setIsSaving(false);
    onSave(newRecord);
    handleReset();
    onClose();
    onShowToast(
      stampedFile
        ? 'Inward Tapal & date-stamped document saved successfully!'
        : 'Inward Tapal recorded successfully!'
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden my-6">
        <div className="bg-[#061122] text-white px-5 py-3.5 flex justify-between items-center border-b-2 border-amber-500">
          <h3 className="font-bold text-base text-white">New Inward Tapal Entry</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Inward / Tapal No *</label>
              <input
                type="text"
                required
                placeholder="e.g. INW/2026/104"
                value={inwardNo}
                onChange={(e) => setInwardNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Received Date *</label>
              <input
                type="date"
                required
                max={getTodayDateString()}
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sender / Office *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tahsildar Huzurnagar / Citizen"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mandal</label>
              <select
                value={mandal}
                onChange={(e) => setMandal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="GENERAL / DIVISION">GENERAL / DIVISION</option>
                {MANDAL_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Section / Seat</label>
              <input
                type="text"
                placeholder="e.g. D Section / Seat-1"
                value={seat}
                onChange={(e) => setSeat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Subject / Matter Particulars *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brief subject of the correspondence..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 border-1.5 border-dashed border-blue-400 bg-blue-50/60 p-3 rounded-lg space-y-1">
              <label className="font-bold text-blue-900 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Attach Inward Letter / Representation (PDF / Image)</span>
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {fileName && (
                <div className="text-[11px] text-blue-700 font-semibold">Selected: {fileName}</div>
              )}
              <small className="text-blue-700 text-[11px] block">
                💡 An official office date stamp will automatically be imprinted on this document.
              </small>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-bold transition cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-md font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-bold transition cursor-pointer shadow-xs"
            >
              {isSaving ? 'Saving...' : 'Save Inward Tapal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
