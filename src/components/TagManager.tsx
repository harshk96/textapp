import React, { useState } from 'react';
import { Tag } from '../types';
import { Settings, Plus, X, Palette, Trash2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface TagManagerProps {
  tags: Tag[];
  onAddTag: (name: string, color: string) => void;
  onUpdateTag: (id: string, tag: Partial<Tag>) => void;
  onDeleteTag: (id: string) => void;
  onClose: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
  '#64748b', '#475569'
];

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onClose
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), selectedColor);
      setNewTagName('');
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
  };

  const saveEdit = (id: string) => {
    onUpdateTag(id, { name: editName });
    setEditingTagId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Manage Tags
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Add New Tag */}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
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
                    selectedColor === color && "ring-2 ring-offset-2 ring-blue-500 scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </form>

          {/* Tag List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                  {editingTagId === tag.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(tag.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(tag.id)}
                      className="bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-700 rounded px-2 py-0.5 text-sm outline-none w-full text-gray-900 dark:text-white"
                    />
                  ) : (
                    <span 
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => startEdit(tag)}
                    >
                      {tag.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
