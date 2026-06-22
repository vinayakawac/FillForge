import React, { useState, useEffect } from 'react';
import ProfileTab from './ProfileTab';
import SettingsTab from './SettingsTab';
import HistoryTab from './HistoryTab';
import DebugTab from './DebugTab';

type Tab = 'profile' | 'settings' | 'history' | 'debug';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
  { id: 'history', label: 'History' },
  { id: 'debug', label: 'Debug' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Tab Bar */}
      <div className="flex border-b border-ff-border bg-ff-bg-secondary shrink-0 relative pr-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 text-xs font-medium transition-colors duration-150
              ${activeTab === tab.id
                ? 'text-ff-accent border-b-2 border-ff-accent bg-ff-bg-primary'
                : 'text-ff-text-secondary hover:text-ff-text-primary'
              }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Close Button */}
        <button 
          onClick={() => window.parent.postMessage({ type: 'CLOSE_UI' }, '*')}
          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-ff-text-secondary hover:text-red-500 transition-colors"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'debug' && <DebugTab />}
      </div>
    </div>
  );
}
