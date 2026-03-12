import { useState } from 'react';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

const ApiKeySettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'dk_live_••••••••••••••••1234',
      createdAt: '2026-01-15',
      lastUsed: '2026-02-10',
    },
  ]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyName.trim()) {
      showToast('Please enter a key name', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `dk_live_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setShowNewKeyForm(false);
      showToast('API key generated successfully', 'success');
    } catch (error) {
      showToast('Failed to generate API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('API key copied to clipboard', 'success');
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(apiKeys.filter(key => key.id !== id));
      showToast('API key revoked', 'success');
    } catch (error) {
      showToast('Failed to revoke API key', 'error');
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">API Key Management</h3>
        <p className="text-sm text-[#444444] mt-1">
          Manage API keys for programmatic access to DocuFlow.
        </p>
      </div>

      {/* API Keys List */}
      <div className="space-y-4 mb-6">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 bg-black border border-[#111111] rounded-lg">
            <p className="text-[#444444]">No API keys created yet</p>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="border border-[#111111] bg-black rounded-lg p-4 hover:border-[#A0A0A0] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{apiKey.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm bg-[#0A0A0A] border border-[#111111] text-[#888888] px-3 py-1 rounded font-mono">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="text-[#444444] hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[#444444]">
                    <span>Created: {apiKey.createdAt}</span>
                    {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevokeKey(apiKey.id)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate New Key */}
      {!showNewKeyForm ? (
        <Button variant="gray" onClick={() => setShowNewKeyForm(true)}>
          Generate New API Key
        </Button>
      ) : (
        <form onSubmit={handleGenerateKey} className="border-t border-[#111111] pt-6">
          <h4 className="font-medium text-white mb-4">Generate New API Key</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#444444] uppercase tracking-wide mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API, Development"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors"
                required
              />
              <p className="text-xs text-[#444444] mt-1">
                Choose a descriptive name to identify this key
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="gray" isLoading={loading}>
                Generate Key
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewKeyForm(false);
                  setNewKeyName('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* API Documentation Link */}
      <div className="mt-6 pt-6 border-t border-[#111111]">
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-white">API Documentation</h4>
              <p className="text-sm text-[#888888] mt-1">
                Learn how to use the DocuFlow API in your applications.
              </p>
              <a
                href="#"
                className="text-sm text-white hover:text-white/80 font-medium mt-2 inline-block transition-colors"
              >
                View API Docs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
