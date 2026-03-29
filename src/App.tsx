import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase } from './hooks/useFirebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchBar } from './components/SearchBar';
import { StoryList } from './components/StoryList';
import { StoryEditor } from './components/StoryEditor';
import { SettingsModal } from './components/SettingsModal';
import { FolderTree } from './components/FolderTree';
import { Story, Tag, Folder } from './types';
import { cn } from './lib/utils';
import { 
  BookOpen, 
  LogOut, 
  LogIn, 
  Settings, 
  Loader2, 
  Github,
  Moon,
  Sun,
  Download,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const { 
    user, 
    loading, 
    stories, 
    tags, 
    folders,
    login, 
    logout, 
    addStory, 
    updateStory, 
    deleteStory,
    addTag,
    updateTag,
    deleteTag,
    addFolder,
    updateFolder,
    deleteFolder
  } = useFirebase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewStory, setIsNewStory] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'stories' | 'folders'>('stories');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('storyarch-dark-mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (themeColor) themeColor.setAttribute('content', '#111827'); // gray-900
    } else {
      document.documentElement.classList.remove('dark');
      if (themeColor) themeColor.setAttribute('content', '#ffffff');
    }
    localStorage.setItem('storyarch-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.every(tagId => story.tags.includes(tagId));

      const matchesFolder = 
        selectedFolderId === null || 
        story.folderId === selectedFolderId;

      return matchesSearch && matchesTags && matchesFolder;
    });
  }, [stories, searchQuery, selectedTags, selectedFolderId]);

  const selectedStory = useMemo(() => 
    stories.find(s => s.id === selectedStoryId) || null
  , [stories, selectedStoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 text-center space-y-8 border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rotate-3">
            <BookOpen className="w-10 h-10 text-white -rotate-3" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">StoryArch</h1>
            <p className="text-gray-500 dark:text-gray-400">Your personal library for stories, notes, and ideas. Secure, offline-first, and beautifully organized.</p>
          </div>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <div className="pt-4 flex items-center justify-center gap-4 text-gray-400">
            <Github className="w-5 h-5 cursor-pointer hover:text-gray-600" />
            <span className="text-xs uppercase tracking-widest font-bold">v1.1.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans relative">
        {/* Sidebar (Desktop & Tablet) */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">StoryArch</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col px-4 space-y-6">
            <FolderTree 
              folders={folders}
              stories={stories}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => {
                setSelectedFolderId(id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onAddFolder={addFolder}
              onDeleteFolder={deleteFolder}
              onUpdateFolder={updateFolder}
              onNewStoryInFolder={(folderId) => {
                setSelectedFolderId(folderId);
                setIsNewStory(true);
                setSelectedStoryId(null);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Stories</h3>
                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full opacity-60">{filteredStories.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto -mx-4">
                <StoryList 
                  stories={filteredStories}
                  tags={tags}
                  selectedStoryId={selectedStoryId}
                  onSelectStory={(id) => {
                    setSelectedStoryId(id);
                    setIsNewStory(false);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || ''} 
                  alt={user.displayName || ''} 
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[120px]">{user.displayName}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Author</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <BookOpen className="w-6 h-6 text-blue-600" />
              </button>
              <h1 className="font-bold text-lg tracking-tight">StoryArch</h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsNewStory(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-500"><Settings className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Mobile Search & List (Visible when no story selected) */}
          <div className={cn(
            "lg:hidden flex-1 flex flex-col",
            (selectedStoryId || isNewStory) ? "hidden" : "flex"
          )}>
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              allTags={tags}
              onNewStory={() => setIsNewStory(true)}
            />
            <div className="flex-1 overflow-y-auto">
              <StoryList 
                stories={filteredStories}
                tags={tags}
                selectedStoryId={selectedStoryId}
                onSelectStory={setSelectedStoryId}
              />
            </div>
          </div>

          {/* Editor Area */}
          <div className={cn(
            "flex-1 bg-white dark:bg-gray-900 z-30 lg:z-0 lg:block",
            (selectedStoryId || isNewStory) ? "block" : "hidden lg:block"
          )}>
            <div className="h-full flex flex-col">
              <div className="hidden lg:block">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  allTags={tags}
                  onNewStory={() => {
                    setIsNewStory(true);
                    setSelectedStoryId(null);
                  }}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                {(selectedStoryId || isNewStory) ? (
                  <StoryEditor 
                    story={selectedStoryId ? stories.find(s => s.id === selectedStoryId) || null : null}
                    allTags={tags}
                    folders={folders}
                    onSave={(data) => {
                      if (selectedStoryId) updateStory(selectedStoryId, data);
                      else addStory({ ...data, folderId: selectedFolderId });
                    }}
                    onDelete={(id) => {
                      deleteStory(id);
                      setSelectedStoryId(null);
                    }}
                    onClose={() => {
                      setSelectedStoryId(null);
                      setIsNewStory(false);
                    }}
                    onAddTag={(name) => addTag({ name, color: '#3b82f6' })}
                  />
                ) : (
                  <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-12 space-y-6">
                    <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-200 dark:text-gray-700">
                      <BookOpen className="w-16 h-16" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select a story to read</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Choose a story from the list or create a new one to get started with your writing.</p>
                    </div>
                    <button
                      onClick={() => setIsNewStory(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 font-semibold"
                    >
                      Create New Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Bottom Nav (Optional, but let's keep it simple with the drawer) */}
        </main>

        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
                <SettingsModal 
                  user={user}
                  tags={tags}
                  onAddTag={(name, color) => addTag({ name, color })}
                  onUpdateTag={updateTag}
                  onDeleteTag={deleteTag}
                  onClose={() => setIsSettingsOpen(false)}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  deferredPrompt={deferredPrompt}
                  onInstall={handleInstall}
                />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default App;
