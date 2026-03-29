import React, { useState } from 'react';
import { Folder, Story } from '../types';
import { Folder as FolderIcon, FolderPlus, ChevronRight, ChevronDown, Trash2, Edit2, FilePlus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FolderTreeProps {
  folders: Folder[];
  stories: Story[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onUpdateFolder: (id: string, data: Partial<Folder>) => void;
  onNewStoryInFolder: (folderId: string | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  stories,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  onUpdateFolder,
  onNewStoryInFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isAddingFolder, setIsAddingFolder] = useState<string | null>(null); // parentId or 'root'
  const [newFolderName, setNewFolderName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  const handleAddFolder = (parentId: string | null) => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim(), parentId);
      setNewFolderName('');
      setIsAddingFolder(null);
    }
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isFolderExpanded = expandedFolders.has(folder.id);
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const storyCount = stories.filter(s => s.folderId === folder.id).length;

    return (
      <div key={folder.id} className="select-none">
        <div 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group",
            selectedFolderId === folder.id 
              ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" 
              : "hover:bg-brand/5 dark:hover:bg-brand/10 text-gray-600 dark:text-gray-400"
          )}
          style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
          >
            {isFolderExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <FolderIcon className={cn("w-4 h-4", selectedFolderId === folder.id ? "fill-current" : "")} />
          <span className="flex-1 truncate text-xs font-bold">{folder.name}</span>
          <span className="text-[10px] font-bold opacity-40 group-hover:opacity-0 transition-opacity">{storyCount}</span>
          
          <div className="flex lg:hidden lg:group-hover:flex items-center gap-0.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onNewStoryInFolder(folder.id); }}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
              title="New Story"
            >
              <Plus className="w-4 h-4 lg:w-3 lg:h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAddingFolder(folder.id); }}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
              title="New Subfolder"
            >
              <FolderPlus className="w-4 h-4 lg:w-3 lg:h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-md transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 lg:w-3 lg:h-3" />
            </button>
          </div>
        </div>

        {isFolderExpanded && (
          <div className="mt-0.5">
            {childFolders.map(child => renderFolder(child, depth + 1))}
            {isAddingFolder === folder.id && (
              <div className="flex items-center gap-2 px-3 py-1" style={{ paddingLeft: `${(depth + 1) * 1 + 0.75}rem` }}>
                <input 
                  autoFocus
                  className="flex-1 bg-white dark:bg-gray-800 border-2 border-brand rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onBlur={() => setIsAddingFolder(null)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFolder(folder.id)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between group px-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Folders
        </button>
        <button 
          onClick={() => setIsAddingFolder('root')}
          className="p-1 text-gray-400 hover:text-brand dark:hover:text-brand-light opacity-0 group-hover:opacity-100 transition-all"
          title="New Root Folder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden"
          >
            <div 
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all group",
                selectedFolderId === null 
                  ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light" 
                  : "hover:bg-brand/5 dark:hover:bg-brand/10 text-gray-600 dark:text-gray-400"
              )}
              onClick={() => onSelectFolder(null)}
            >
              <FolderIcon className={cn("w-4 h-4", selectedFolderId === null ? "fill-current" : "")} />
              <span className="flex-1 truncate text-xs font-bold">All Stories</span>
              <span className="text-[10px] font-bold opacity-40 group-hover:opacity-0 transition-opacity">{stories.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewStoryInFolder(null);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isAddingFolder === 'root' && (
              <div className="px-3 py-1">
                <input 
                  autoFocus
                  className="w-full bg-white dark:bg-gray-800 border-2 border-brand rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onBlur={() => setIsAddingFolder(null)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFolder(null)}
                />
              </div>
            )}

            {rootFolders.map(folder => renderFolder(folder))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
