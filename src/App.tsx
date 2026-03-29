import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase } from './hooks/useFirebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchBar } from './components/SearchBar';
import { StoryList } from './components/StoryList';
import { StoryEditor } from './components/StoryEditor';
import { TagManager } from './components/TagManager';
import { Story, Tag } from './types';
import { cn } from './lib/utils';
import { 
  BookOpen, 
  LogOut, 
  LogIn, 
  Settings, 
  Loader2, 
  Github,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const { 
    user, 
    loading, 
    stories, 
    tags, 
    login, 
    logout, 
    addStory, 
    updateStory, 
    deleteStory,
    addTag,
    updateTag,
    deleteTag
  } = useFirebase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isNewStory, setIsNewStory] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.every(tagId => story.tags.includes(tagId));

      return matchesSearch && matchesTags;
    });
  }, [stories, searchQuery, selectedTags]);

  const selectedStory = useMemo(() => 
    stories.find(s => s.id === selectedStoryId) || null
  , [stories, selectedStoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 rotate-3">
            <BookOpen className="w-10 h-10 text-white -rotate-3" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">StoryArch</h1>
            <p className="text-gray-500">Your personal library for stories, notes, and ideas. Secure, offline-first, and beautifully organized.</p>
          </div>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <div className="pt-4 flex items-center justify-center gap-4 text-gray-400">
            <Github className="w-5 h-5 cursor-pointer hover:text-gray-600" />
            <span className="text-xs uppercase tracking-widest font-bold">v1.0.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
        {/* Main Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">StoryArch</h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsTagManagerOpen(true)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 pb-4">
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
            <div className="flex-1 overflow-y-auto">
              <StoryList 
                stories={filteredStories}
                tags={tags}
                selectedStoryId={selectedStoryId}
                onSelectStory={(id) => {
                  setSelectedStoryId(id);
                  setIsNewStory(false);
                }}
              />
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
              <button 
                onClick={logout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile View / Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h1 className="font-bold text-lg">StoryArch</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-500">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsTagManagerOpen(true)} className="p-2 text-gray-500"><Settings className="w-5 h-5" /></button>
              <button onClick={logout} className="p-2 text-gray-500"><LogOut className="w-5 h-5" /></button>
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
            {(selectedStoryId || isNewStory) ? (
              <StoryEditor 
                story={selectedStory}
                allTags={tags}
                onSave={(data) => {
                  if (selectedStoryId) updateStory(selectedStoryId, data);
                  else addStory(data);
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
        </main>

        <AnimatePresence>
          {isTagManagerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TagManager 
                tags={tags}
                onAddTag={(name, color) => addTag({ name, color })}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
                onClose={() => setIsTagManagerOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default App;
