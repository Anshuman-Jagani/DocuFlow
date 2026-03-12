import { type ReactNode, useState } from 'react';
import { cn } from '../../utils/helpers';

interface Tab { id: string; label: string; icon?: ReactNode; content: ReactNode; }
interface TabsProps { tabs: Tab[]; defaultTab?: string; onChange?: (tabId: string) => void; className?: string; }

const Tabs = ({ tabs, defaultTab, onChange, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const handleTabChange = (tabId: string) => { setActiveTab(tabId); onChange?.(tabId); };

  return (
    <div className={className}>
      <div className="border-b border-[#111111]">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={cn(
                'group inline-flex items-center py-3 px-1 border-b-2 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200',
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-[#333333] hover:text-white/60 hover:border-white/20'
              )}
            >
              {tab.icon && (
                <span className={cn('mr-2', activeTab === tab.id ? 'text-white' : 'text-[#333333] group-hover:text-white/60')}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{tabs.find(t => t.id === activeTab)?.content}</div>
    </div>
  );
};

export default Tabs;
