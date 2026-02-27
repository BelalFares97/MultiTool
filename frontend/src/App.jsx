import React, { useState } from 'react';

// Layout & Modals
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import NewCaseModal from './components/modals/NewCaseModal';
import NewFinanceRequestModal from './components/modals/NewFinanceRequestModal';
import SettingsPanel from './components/settings/SettingsPanel';

// Pages
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import ConversationalDocPage from './pages/ConversationalDocPage';
import RmsAssistantPage from './pages/RmsAssistantPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import MudaqqiqPage from './pages/MudaqqiqPage';
import MujazPage from './pages/MujazPage';

// Hooks
import { useSettings } from './hooks/useSettings';
import { useCases } from './hooks/useCases';
import { useChat } from './hooks/useChat';

// Utilities
import { getTranslation } from './i18n/translations';
import { generateMujazPDF } from './utils/generateMujazPDF';

function App() {
  // Hooks
  const settings = useSettings();
  const {
    cases,
    selectedCase,
    handleCreateCase,
    handleCreateFinanceRequest,
    handleDeleteCase,
    handleUpdateCase,
    handleOpenCase
  } = useCases(settings.userName);

  const t = getTranslation(settings.language);
  const chat = useChat(settings.language, t);

  // App State
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isNewFinanceRequestOpen, setIsNewFinanceRequestOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState({ client: '', industry: 'Contracting', files: [], folderName: '' });

  // Mujaz report state (lifted so Topbar can trigger PDF export)
  const [mujazReport, setMujazReport] = useState(null);
  const [mujazMeta, setMujazMeta] = useState(null);

  // Page Info
  const pageInfo = {
    'Dashboard': { title: t('page_dashboard_title'), subtitle: `${t('page_dashboard_subtitle')} ${settings.userName.split(' ')[0]}` },
    'Tamkeen': { title: t('page_rms_title'), subtitle: t('page_rms_subtitle') },
    'RafeeQ': { title: t('page_conversational_title'), subtitle: t('page_conversational_subtitle') },
    'MudaQQiQ': { title: t('page_mudaqqiq_title'), subtitle: t('page_mudaqqiq_subtitle') },
    'Mujaz': { title: t('page_mujaz_title'), subtitle: t('page_mujaz_subtitle') },
    'Cases': { title: t('page_cases_title'), subtitle: t('page_cases_subtitle') },
    'Miqyas Credit': { title: t('page_risk_title'), subtitle: t('page_risk_subtitle') },
  };

  // Handlers for App level logic
  const handleCaseFiles = (e) => {
    const files = Array.from(e.target.files);
    const folderName = newCaseData.client ? `${newCaseData.client}_docs` : 'untitled_docs';
    setNewCaseData(prev => ({ ...prev, files: [...prev.files, ...files], folderName }));
  };

  const removeFile = (index) => {
    setNewCaseData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const onOpenCase = (caseItem) => {
    handleOpenCase(caseItem);
    setActivePage('Tamkeen');
  };

  const onOpenRiskUnit = (caseItem) => {
    handleOpenCase(caseItem);
    setActivePage('Miqyas Credit');
  };

  const INDUSTRIES_LIST = ['Contracting', 'Shipping', 'Energy', 'Retail', 'Healthcare', 'IT Services', 'Finance', 'Manufacturing', 'Real Estate'];

  return (
    <div className={`layouts-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        clientLogo={settings.clientLogo}
        clientName={settings.clientName}
        activePage={activePage}
        setActivePage={setActivePage}
        userImage={settings.userImage}
        userName={settings.userName}
        navItems={settings.navItems}
        language={settings.language}
      />

      <main className="main-content-wrapper">
        <Topbar
          activePage={activePage}
          pageInfo={pageInfo}
          language={settings.language}
          setIsNewCaseOpen={setIsNewCaseOpen}
          setIsNewFinanceRequestOpen={setIsNewFinanceRequestOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          onGeneratePDF={() => generateMujazPDF({ analysisResult: mujazReport, metadata: mujazMeta })}
          hasMujazReport={!!mujazReport}
        />

        <div className="main-content">
          {activePage === 'Dashboard' && (
            <DashboardPage
              language={settings.language}
              clientName={settings.clientName}
              setActivePage={setActivePage}
              cases={cases}
            />
          )}

          {activePage === 'Cases' && (
            <CasesPage
              cases={cases}
              handleOpenCase={onOpenCase}
              handleOpenRiskIntelligence={onOpenRiskUnit}
              handleDeleteCase={(id) => handleDeleteCase(id, t)}
              language={settings.language}
            />
          )}

          {activePage === 'RafeeQ' && (
            <ConversationalDocPage
              {...chat}
              clientLogo={settings.clientLogo}
              userImage={settings.userImage}
              language={settings.language}
            />
          )}

          {activePage === 'Tamkeen' && (
            <RmsAssistantPage
              selectedCase={selectedCase}
              handleUpdateCase={handleUpdateCase}
              language={settings.language}
            />
          )}

          {activePage === 'Miqyas Credit' && (
            <RiskIntelligencePage
              selectedCase={selectedCase}
              language={settings.language}
            />
          )}

          {activePage === 'MudaQQiQ' && (
            <MudaqqiqPage
              language={settings.language}
            />
          )}

          {activePage === 'Mujaz' && (
            <MujazPage
              language={settings.language}
              onReportReady={(result, meta) => { setMujazReport(result); setMujazMeta(meta); }}
            />
          )}
        </div>
      </main>

      <NewCaseModal
        isNewCaseOpen={isNewCaseOpen}
        setIsNewCaseOpen={setIsNewCaseOpen}
        newCaseData={newCaseData}
        setNewCaseData={setNewCaseData}
        industriesList={INDUSTRIES_LIST}
        handleCaseFiles={handleCaseFiles}
        removeFile={removeFile}
        handleCreateCase={async () => {
          const success = await handleCreateCase(newCaseData);
          if (success) {
            setIsNewCaseOpen(false);
            setNewCaseData({ client: '', industry: 'Contracting', files: [], folderName: '' });
            setActivePage('Cases');
          }
        }}
        language={settings.language}
      />

      <NewFinanceRequestModal
        isOpen={isNewFinanceRequestOpen}
        onClose={() => setIsNewFinanceRequestOpen(false)}
        onCreate={(data) => {
          handleCreateFinanceRequest(data);
          setActivePage('Cases');
        }}
        language={settings.language}
      />

      <SettingsPanel
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        {...settings}
      />
    </div>
  );
}

export default App;
