import React, { useState } from 'react';
import { Tag, User } from '../types';
import { X, Plus, Trash2, Edit2, Check, Tag as TagIcon, Download, Moon, Sun, User as UserIcon, Shield, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  user: User;
  tags: Tag[];
  onAddTag: (name: string, color: string) => void;
  onUpdateTag: (id: string, updates: Partial<Tag>) => void;
  onDeleteTag: (id: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  deferredPrompt: any;
  onInstall: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
  '#64748b', '#475569'
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  tags,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onClose,
  isDarkMode,
  setIsDarkMode,
  deferredPrompt,
  onInstall
}) => {
  const [activeTab, setActiveTab] = useState<'tags' | 'account' | 'appearance'>('tags');
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), selectedColor);
      setNewTagName('');
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  const saveEdit = () => {
    if (editingTagId && editingTagName.trim()) {
      onUpdateTag(editingTagId, { name: editingTagName.trim() });
      setEditingTagId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Preferences & Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:w-48 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-2 lg:p-4 gap-1 lg:gap-2 no-scrollbar">
            <button
              onClick={() => setActiveTab('tags')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === 'tags' 
                  ? "bg-brand text-white shadow-lg shadow-pink-200 dark:shadow-none" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-brand/10"
              )}
            >
              <TagIcon className="w-4 h-4" />
              Tags
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === 'appearance' 
                  ? "bg-brand text-white shadow-lg shadow-pink-200 dark:shadow-none" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-brand/10"
              )}
            >
              <Moon className="w-4 h-4" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === 'account' 
                  ? "bg-brand text-white shadow-lg shadow-pink-200 dark:shadow-none" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-brand/10"
              )}
            >
              <UserIcon className="w-4 h-4" />
              Account
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'tags' && (
              <div className="space-y-6">
                <form onSubmit={handleAddTag} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Create new tag..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-brand outline-none text-gray-900 dark:text-white transition-all"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-pink-200 dark:shadow-none"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full transition-transform hover:scale-110",
                          selectedColor === color && "ring-2 ring-offset-2 ring-brand scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Existing Tags ({tags.length})</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {tags.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                      >
                        {editingTagId === tag.id ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              autoFocus
                              className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-brand rounded-lg outline-none text-sm transition-all shadow-sm"
                            />
                            <button onClick={saveEdit} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingTagId(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tag.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(tag)}
                                className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteTag(tag.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none",
                      isDarkMode ? "bg-brand" : "bg-gray-300 dark:bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md",
                        isDarkMode ? "translate-x-7" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-brand/5 dark:bg-brand/10 rounded-2xl border border-brand/10 dark:border-brand/20 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none shrink-0">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-brand-dark dark:text-brand-light">Install StoryArch</h4>
                        <p className="text-xs text-brand/70 dark:text-brand-light/70 leading-relaxed">Install StoryArch as a native app on your device for a better experience and offline access.</p>
                      </div>
                    </div>
                    <button
                      onClick={onInstall}
                      disabled={!deferredPrompt}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                        deferredPrompt 
                          ? "bg-brand text-white hover:bg-brand-dark shadow-lg hover:shadow-pink-200 dark:shadow-none" 
                          : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      {deferredPrompt ? 'Install App Now' : 'App Already Installed'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-4 p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="w-24 h-24 rounded-3xl shadow-xl border-4 border-white dark:border-gray-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.displayName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                    <Shield className="w-3 h-3" />
                    Verified Account
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Storage & Sync</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Local Database</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">IndexedDB</p>
                      <p className="text-[10px] text-green-500 font-bold">Active & Synced</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Cloud Backup</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Firestore</p>
                      <p className="text-[10px] text-green-500 font-bold">Real-time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
