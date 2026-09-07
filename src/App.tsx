import React, { useState, useEffect } from 'react';
import {
  BhuFile,
  InwardTapal,
  OutwardDespatch,
  StaffUser,
  AppealCase,
} from './types';
import {
  safeGetLocalStorage,
  safeSaveLocalStorage,
  getAttachmentFromDB,
  deleteAttachmentFromDB,
  setAttachmentInDB,
  INITIAL_FILES,
  INITIAL_INWARD,
  INITIAL_OUTWARD,
  INITIAL_STAFF,
} from './utils/storage';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { BhuBharatiView } from './components/BhuBharatiView';
import { TapalRegisterView } from './components/TapalRegisterView';
import { SadabainamaView } from './components/SadabainamaView';
import { AppealCasesView } from './components/AppealCasesView';
import { AdminView } from './components/AdminView';
import { DEFAULT_SADABAINAMA_ABSTRACT, DEFAULT_SADABAINAMA_REPORT } from './data/sadabainamaData';
import { INITIAL_APPEAL_CASES } from './data/appealCasesData';
import { generateOfficialOrderPdf } from './utils/orderPdfGenerator';

// Modals
import { FileModal } from './components/modals/FileModal';
import { StatusModal } from './components/modals/StatusModal';
import { InwardModal } from './components/modals/InwardModal';
import { InwardStatusModal } from './components/modals/InwardStatusModal';
import { OutwardModal } from './components/modals/OutwardModal';
import { PdfViewerModal } from './components/modals/PdfViewerModal';
import { PrintSlipModal } from './components/modals/PrintSlipModal';
import { PrintReportModal } from './components/modals/PrintReportModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { LoginModal } from './components/modals/LoginModal';
import { AddUserModal } from './components/modals/AddUserModal';
import { PrintReportPayload } from './utils/printReport';

export default function App() {
  // Application State
  const [files, setFiles] = useState<BhuFile[]>(() =>
    safeGetLocalStorage('rdo_files', INITIAL_FILES)
  );
  const [inwards, setInwards] = useState<InwardTapal[]>(() =>
    safeGetLocalStorage('rdo_inward_tapal', INITIAL_INWARD)
  );
  const [outwards, setOutwards] = useState<OutwardDespatch[]>(() =>
    safeGetLocalStorage('rdo_outward', INITIAL_OUTWARD)
  );
  const [staff, setStaff] = useState<StaffUser[]>(() =>
    safeGetLocalStorage('rdo_staff', INITIAL_STAFF)
  );
  const [sadabainamaAbstract, setSadabainamaAbstract] = useState<any[][] | null>(() =>
    safeGetLocalStorage('rdo_sadabainama_abstract', DEFAULT_SADABAINAMA_ABSTRACT)
  );
  const [sadabainamaReport, setSadabainamaReport] = useState<any[][] | null>(() =>
    safeGetLocalStorage('rdo_sadabainama_report', DEFAULT_SADABAINAMA_REPORT)
  );
  const [appealCases, setAppealCases] = useState<AppealCase[]>(() =>
    safeGetLocalStorage('rdo_appeal_cases', INITIAL_APPEAL_CASES)
  );

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboardTab');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pre-filter transfers from dashboard
  const [bhuInitialStatus, setBhuInitialStatus] = useState<string>('');
  const [inwardInitialStatus, setInwardInitialStatus] = useState<string>('');
  const [outwardInitialSentTo, setOutwardInitialSentTo] = useState<string>('');

  // Modal States
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedFileForStatus, setSelectedFileForStatus] = useState<BhuFile | null>(null);

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isInwardStatusModalOpen, setIsInwardStatusModalOpen] = useState(false);
  const [selectedInwardForStatus, setSelectedInwardForStatus] = useState<InwardTapal | null>(null);

  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false);
  const [preselectedInwardId, setPreselectedInwardId] = useState<number | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('Official_Document');

  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);
  const [selectedFileForSlip, setSelectedFileForSlip] = useState<BhuFile | null>(null);

  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [printReportData, setPrintReportData] = useState<PrintReportPayload | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDetails, setDeleteModalDetails] = useState<React.ReactNode>(null);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<(() => Promise<void>) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Global listener for table print preview requests across all tabs
  useEffect(() => {
    const handleOpenPrintPreview = (e: any) => {
      if (e.detail) {
        setPrintReportData(e.detail);
        setIsPrintReportModalOpen(true);
      }
    };
    window.addEventListener('app-open-print-preview', handleOpenPrintPreview);
    return () => {
      window.removeEventListener('app-open-print-preview', handleOpenPrintPreview);
    };
  }, []);

  // Toast handler
  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => {
      setToastMsg(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Dashboard navigation router
  const handleDashboardNavigate = (targetTab: ActiveTab, filters?: any) => {
    if (filters) {
      if (targetTab === 'bhuBharatiTab' && filters.status !== undefined) {
        setBhuInitialStatus(filters.status);
      }
      if (targetTab === 'tapalTab') {
        if (filters.status !== undefined) setInwardInitialStatus(filters.status);
        if (filters.sentTo !== undefined) setOutwardInitialSentTo(filters.sentTo);
      }
    }
    setActiveTab(targetTab);
  };

  // Staff admin navigation guard
  const handleOpenAdminFromDashboard = () => {
    if (currentUser && currentUser.role === 'ADMIN') {
      setActiveTab('adminTab');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Bhu Bharati File Handlers
  const handleSaveFile = (newFile: BhuFile) => {
    const updated = [newFile, ...files];
    setFiles(updated);
    safeSaveLocalStorage('rdo_files', updated);
  };

  const handleUpdateFileStatus = (file: BhuFile) => {
    setSelectedFileForStatus(file);
    setIsStatusModalOpen(true);
  };

  const handleSaveFileStatus = (updatedFile: BhuFile) => {
    const updated = files.map((f) => (f.id === updatedFile.id ? updatedFile : f));
    setFiles(updated);
    safeSaveLocalStorage('rdo_files', updated);
  };

  const handleSwitchToStatusFromModal = (fileId: number) => {
    const target = files.find((f) => f.id === fileId);
    if (target) {
      handleUpdateFileStatus(target);
    }
  };

  const handlePrintSlip = (file: BhuFile) => {
    setSelectedFileForSlip(file);
    setIsPrintSlipOpen(true);
  };

  const handleViewBhuPdf = async (file: BhuFile) => {
    let doc = file.fileAttachment;
    if (!doc && (file.attachmentKey || file.hasAttachment)) {
      doc = (await getAttachmentFromDB(file.attachmentKey || `bhu_${file.id}`)) || undefined;
    }
    if (!doc) {
      showToast('No document attached for this Bhu Bharati file.');
      return;
    }
    setPdfData(doc);
    setPdfTitle(`📂 Bhu Bharati Dossier: ${file.appNumber} (${file.applicantName})`);
    setPdfSubtitle(
      `Mandal: <strong>${file.mandal}</strong> • Village: <strong>${file.village}</strong> • Module: <strong>${file.module}</strong> • Status: <strong>${file.status}</strong>`
    );
    setPdfFileName(`${file.appNumber}_Bhu_Bharati_Dossier`);
    setIsPdfModalOpen(true);
  };

  const handleDeleteBhuFilePrompt = (file: BhuFile) => {
    setDeleteModalTitle('📂 Bhu Bharati File Record');
    setDeleteModalDetails(
      <div className="space-y-1">
        <div><strong>Application No:</strong> {file.appNumber}</div>
        <div><strong>Applicant:</strong> {file.applicantName}</div>
        <div><strong>Mandal &amp; Village:</strong> {file.mandal} ({file.village})</div>
        <div><strong>Survey No:</strong> {file.surveyNo}</div>
        <div><strong>Module:</strong> {file.module}</div>
      </div>
    );
    setPendingDeleteAction(() => async () => {
      if (file.attachmentKey) await deleteAttachmentFromDB(file.attachmentKey);
      const updated = files.filter((f) => f.id !== file.id);
      setFiles(updated);
      safeSaveLocalStorage('rdo_files', updated);
      showToast(`Bhu Bharati file record (${file.appNumber}) deleted successfully.`);
    });
    setIsDeleteModalOpen(true);
  };

  // Inward Tapal Handlers
  const handleSaveInward = (newTapal: InwardTapal) => {
    const updated = [newTapal, ...inwards];
    setInwards(updated);
    safeSaveLocalStorage('rdo_inward_tapal', updated);
  };

  const handleUpdateInwardStatus = (tapal: InwardTapal) => {
    setSelectedInwardForStatus(tapal);
    setIsInwardStatusModalOpen(true);
  };

  const handleSaveInwardStatus = (updatedTapal: InwardTapal) => {
    const updated = inwards.map((t) => (t.id === updatedTapal.id ? updatedTapal : t));
    setInwards(updated);
    safeSaveLocalStorage('rdo_inward_tapal', updated);
  };

  const handleViewInwardPdf = async (tapal: InwardTapal) => {
    let doc = tapal.fileAttachment;
    if (!doc && (tapal.attachmentKey || tapal.hasAttachment)) {
      doc = (await getAttachmentFromDB(tapal.attachmentKey || `inw_${tapal.id}`)) || undefined;
    }
    if (!doc) {
      showToast('No document attached for this Inward Tapal.');
      return;
    }
    setPdfData(doc);
    setPdfTitle(`📬 Inward Tapal: ${tapal.inwardNo}`);
    setPdfSubtitle(
      `Sender: <strong>${tapal.sender}</strong> • Mandal: <strong>${tapal.mandal}</strong> • Received Date: <strong>${tapal.receivedDate}</strong>`
    );
    setPdfFileName(`${tapal.inwardNo}_Inward_Document`);
    setIsPdfModalOpen(true);
  };

  const handleDeleteInwardPrompt = (tapal: InwardTapal) => {
    setDeleteModalTitle('📬 Inward Tapal Record');
    setDeleteModalDetails(
      <div className="space-y-1">
        <div><strong>Inward / Tapal No:</strong> {tapal.inwardNo}</div>
        <div><strong>Sender:</strong> {tapal.sender} • <strong>Date:</strong> {tapal.receivedDate}</div>
        <div><strong>Subject:</strong> {tapal.subject}</div>
      </div>
    );
    setPendingDeleteAction(() => async () => {
      if (tapal.attachmentKey) await deleteAttachmentFromDB(tapal.attachmentKey);
      const updated = inwards.filter((t) => t.id !== tapal.id);
      setInwards(updated);
      safeSaveLocalStorage('rdo_inward_tapal', updated);
      showToast(`Inward Tapal (${tapal.inwardNo}) deleted successfully.`);
    });
    setIsDeleteModalOpen(true);
  };

  // Outward Despatch Handlers
  const handleOpenOutward = (linkedId?: number) => {
    setPreselectedInwardId(linkedId || null);
    setIsOutwardModalOpen(true);
  };

  const handleSaveOutward = (
    newOutward: OutwardDespatch,
    shouldDisposeInwardId?: number | null
  ) => {
    const updatedOutwards = [newOutward, ...outwards];
    setOutwards(updatedOutwards);
    safeSaveLocalStorage('rdo_outward', updatedOutwards);

    if (shouldDisposeInwardId) {
      const updatedInwards = inwards.map((t) =>
        t.id === shouldDisposeInwardId ? { ...t, status: 'Disposed' } : t
      );
      setInwards(updatedInwards);
      safeSaveLocalStorage('rdo_inward_tapal', updatedInwards);
    }
  };

  const handleViewOutwardPdf = async (outward: OutwardDespatch) => {
    let doc = outward.fileAttachment;
    if (!doc && (outward.attachmentKey || outward.hasAttachment)) {
      doc = (await getAttachmentFromDB(outward.attachmentKey || `out_${outward.id}`)) || undefined;
    }
    if (!doc) {
      showToast('No document attached for this Outward Despatch.');
      return;
    }
    setPdfData(doc);
    setPdfTitle(`📤 Outward Despatch: ${outward.outwardNo}`);
    setPdfSubtitle(
      `Dispatched To: <strong>${outward.sentTo}</strong> • Date: <strong>${outward.outwardDate}</strong> • Mode: <strong>${outward.mode}</strong>`
    );
    setPdfFileName(`${outward.outwardNo.replace(/\//g, '_')}_Outward_Despatch`);
    setIsPdfModalOpen(true);
  };

  const handleDeleteOutwardPrompt = (outward: OutwardDespatch) => {
    setDeleteModalTitle('📤 Outward Despatch Record');
    setDeleteModalDetails(
      <div className="space-y-1">
        <div><strong>Despatch No:</strong> {outward.outwardNo}</div>
        <div><strong>Dispatched To:</strong> {outward.sentTo} • <strong>Date:</strong> {outward.outwardDate}</div>
        <div><strong>Subject:</strong> {outward.subject}</div>
      </div>
    );
    setPendingDeleteAction(() => async () => {
      if (outward.attachmentKey) await deleteAttachmentFromDB(outward.attachmentKey);
      const updated = outwards.filter((o) => o.id !== outward.id);
      setOutwards(updated);
      safeSaveLocalStorage('rdo_outward', updated);
      showToast(`Outward Despatch (${outward.outwardNo}) deleted successfully.`);
    });
    setIsDeleteModalOpen(true);
  };

  // Appeal Cases Handlers
  const handleSaveAppealCase = async (newCase: AppealCase, rawFileString?: string) => {
    let caseToSave = { ...newCase };
    if (rawFileString) {
      const key = `appeal_order_${newCase.id}`;
      await setAttachmentInDB(key, rawFileString);
      caseToSave.attachmentKey = key;
      caseToSave.hasFinalOrderAttachment = true;
    }
    const updated = [caseToSave, ...appealCases.filter((c) => c.id !== newCase.id)];
    setAppealCases(updated);
    safeSaveLocalStorage('rdo_appeal_cases', updated);
    showToast(`Appeal Case ${newCase.caseNo} registered successfully.`);
  };

  const handleUpdateAppealCase = async (updatedCase: AppealCase, rawFileString?: string) => {
    let caseToSave = { ...updatedCase };
    if (rawFileString) {
      const key = updatedCase.attachmentKey || `appeal_order_${updatedCase.id}`;
      await setAttachmentInDB(key, rawFileString);
      caseToSave.attachmentKey = key;
      caseToSave.hasFinalOrderAttachment = true;
    }
    const updated = appealCases.map((c) => (c.id === updatedCase.id ? caseToSave : c));
    setAppealCases(updated);
    safeSaveLocalStorage('rdo_appeal_cases', updated);
    showToast(`Appeal Case ${updatedCase.caseNo} updated successfully.`);
  };

  const handleDeleteAppealCasePrompt = (appealCase: AppealCase) => {
    setDeleteModalTitle('⚖️ Appeal Case Record');
    setDeleteModalDetails(
      <div className="space-y-1">
        <div><strong>Case No:</strong> {appealCase.caseNo} • <strong>Type:</strong> {appealCase.appealType}</div>
        <div><strong>Appellant:</strong> {appealCase.appellantName} • <strong>Village:</strong> {appealCase.village}</div>
        <div><strong>Status:</strong> {appealCase.status}</div>
      </div>
    );
    setPendingDeleteAction(() => async () => {
      if (appealCase.attachmentKey) await deleteAttachmentFromDB(appealCase.attachmentKey);
      const updated = appealCases.filter((c) => c.id !== appealCase.id);
      setAppealCases(updated);
      safeSaveLocalStorage('rdo_appeal_cases', updated);
      showToast(`Appeal Case (${appealCase.caseNo}) deleted successfully.`);
    });
    setIsDeleteModalOpen(true);
  };

  const handleViewAppealFinalOrder = async (appealCase: AppealCase) => {
    let doc = appealCase.finalOrderFile;
    if (!doc && (appealCase.attachmentKey || appealCase.hasFinalOrderAttachment)) {
      doc = (await getAttachmentFromDB(appealCase.attachmentKey || `appeal_order_${appealCase.id}`)) || undefined;
    }
    if (!doc) {
      // Auto generate official RDO Huzurnagar Court Final Order PDF
      doc = await generateOfficialOrderPdf(appealCase);
    }
    setPdfData(doc);
    setPdfTitle(`⚖️ Appeal Final Order: ${appealCase.caseNo}`);
    setPdfSubtitle(
      `Court of RDO Huzurnagar • Village: <strong>${appealCase.village}</strong> • Result: <strong>${appealCase.status}</strong>`
    );
    setPdfFileName(`${appealCase.caseNo.replace(/\//g, '_')}_Final_Order`);
    setIsPdfModalOpen(true);
  };

  const handleResetSampleCases = () => {
    setAppealCases(INITIAL_APPEAL_CASES);
    safeSaveLocalStorage('rdo_appeal_cases', INITIAL_APPEAL_CASES);
    showToast('Reset to Huzurnagar court sample appeal cases.');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAction) return;
    setIsDeleting(true);
    try {
      await pendingDeleteAction();
    } catch (e) {
      console.error('Delete error:', e);
      showToast('Error during deletion.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPendingDeleteAction(null);
    }
  };

  // Staff & Admin Handlers
  const handleToggleUserStatus = (id: number) => {
    const updated = staff.map((u) => (u.id === id ? { ...u, active: !u.active } : u));
    setStaff(updated);
    safeSaveLocalStorage('rdo_staff', updated);
  };

  const handleSaveNewUser = (newUser: StaffUser) => {
    const updated = [...staff, newUser];
    setStaff(updated);
    safeSaveLocalStorage('rdo_staff', updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Official Government Header */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          if (activeTab === 'adminTab') setActiveTab('dashboardTab');
          showToast('Signed out.');
        }}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />

      {/* Main Content Container */}
      <main className="max-w-[1520px] w-full mx-auto px-4 md:px-6 py-6 flex-1">
        {activeTab === 'dashboardTab' && (
          <DashboardView
            files={files}
            inwards={inwards}
            outwards={outwards}
            staff={staff}
            appealCases={appealCases}
            onNavigate={handleDashboardNavigate}
            onNewFile={() => setIsFileModalOpen(true)}
            onNewInward={() => setIsInwardModalOpen(true)}
            onNewOutward={() => handleOpenOutward()}
            onOpenAdmin={handleOpenAdminFromDashboard}
          />
        )}

        {activeTab === 'bhuBharatiTab' && (
          <BhuBharatiView
            files={files}
            initialStatusFilter={bhuInitialStatus}
            onNewFile={() => setIsFileModalOpen(true)}
            onUpdateStatus={handleUpdateFileStatus}
            onPrintSlip={handlePrintSlip}
            onViewPdf={handleViewBhuPdf}
            onDeleteFile={handleDeleteBhuFilePrompt}
          />
        )}

        {activeTab === 'tapalTab' && (
          <TapalRegisterView
            inwards={inwards}
            outwards={outwards}
            initialInwardStatus={inwardInitialStatus}
            initialOutwardSentTo={outwardInitialSentTo}
            onNewInward={() => setIsInwardModalOpen(true)}
            onNewOutward={(linkedId) => handleOpenOutward(linkedId)}
            onUpdateInwardStatus={handleUpdateInwardStatus}
            onViewInwardPdf={handleViewInwardPdf}
            onViewOutwardPdf={handleViewOutwardPdf}
            onDeleteInward={handleDeleteInwardPrompt}
            onDeleteOutward={handleDeleteOutwardPrompt}
          />
        )}

        {activeTab === 'sadabainamaTab' && (
          <SadabainamaView
            abstractData={sadabainamaAbstract}
            reportData={sadabainamaReport}
            onUpdateAbstract={setSadabainamaAbstract}
            onUpdateReport={setSadabainamaReport}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'appealCasesTab' && (
          <AppealCasesView
            appealCases={appealCases}
            onSaveCase={handleSaveAppealCase}
            onUpdateCase={handleUpdateAppealCase}
            onDeleteCase={handleDeleteAppealCasePrompt}
            onViewFinalOrder={handleViewAppealFinalOrder}
            onResetSampleCases={handleResetSampleCases}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'adminTab' && currentUser?.role === 'ADMIN' && (
          <AdminView
            staff={staff}
            onOpenAddUser={() => setIsAddUserModalOpen(true)}
            onToggleUserStatus={handleToggleUserStatus}
          />
        )}
      </main>

      {/* Official Government Footer */}
      <Footer />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border-l-4 border-amber-400 text-white px-5 py-3 rounded-lg shadow-2xl z-50 text-xs font-semibold animate-fade-in flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODALS */}
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSave={handleSaveFile}
        onSwitchToStatus={handleSwitchToStatusFromModal}
        files={files}
        currentUser={currentUser}
        onShowToast={showToast}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedFileForStatus(null);
        }}
        file={selectedFileForStatus}
        onSaveStatus={handleSaveFileStatus}
        currentUser={currentUser}
        onShowToast={showToast}
      />

      <InwardModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onSave={handleSaveInward}
        onShowToast={showToast}
      />

      <InwardStatusModal
        isOpen={isInwardStatusModalOpen}
        onClose={() => {
          setIsInwardStatusModalOpen(false);
          setSelectedInwardForStatus(null);
        }}
        tapal={selectedInwardForStatus}
        onSave={handleSaveInwardStatus}
        onShowToast={showToast}
      />

      <OutwardModal
        isOpen={isOutwardModalOpen}
        onClose={() => {
          setIsOutwardModalOpen(false);
          setPreselectedInwardId(null);
        }}
        inwards={inwards}
        preselectedInwardId={preselectedInwardId}
        onSave={handleSaveOutward}
        onShowToast={showToast}
      />

      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setPdfData(null);
        }}
        fileData={pdfData}
        title={pdfTitle}
        subtitle={pdfSubtitle}
        fileName={pdfFileName}
        onShowToast={showToast}
      />

      <PrintSlipModal
        isOpen={isPrintSlipOpen}
        onClose={() => {
          setIsPrintSlipOpen(false);
          setSelectedFileForSlip(null);
        }}
        file={selectedFileForSlip}
        onShowToast={showToast}
      />

      <PrintReportModal
        isOpen={isPrintReportModalOpen}
        data={printReportData}
        onClose={() => {
          setIsPrintReportModalOpen(false);
          setPrintReportData(null);
        }}
        onShowToast={showToast}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPendingDeleteAction(null);
        }}
        title={deleteModalTitle}
        details={deleteModalDetails}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        staff={staff}
        onLogin={setCurrentUser}
        onShowToast={showToast}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleSaveNewUser}
        onShowToast={showToast}
      />
    </div>
  );
}
