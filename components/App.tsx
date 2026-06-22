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
      <div className="flex border-b border-ff-border bg-ff-bg-secondary shrink-0">
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
