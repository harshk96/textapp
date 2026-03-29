import React, { useState, useEffect, useMemo } from 'react';
import { Story, Tag, Folder } from '../types';
import { Save, Trash2, X, Tag as TagIcon, Plus, ChevronLeft, Folder as FolderIcon, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface StoryEditorProps {
  story: Story | null;
  allTags: Tag[];
  folders: Folder[];
  onSave: (story: Partial<Story>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onAddTag: (name: string) => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  story,
  allTags,
  folders,
  onSave,
  onDelete,
  onClose,
  onAddTag
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Debounced content for preview performance with large stories
  const [debouncedContent, setDebouncedContent] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setContent(story.content);
      setSelectedTags(story.tags);
      setFolderId(story.folderId || null);
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setFolderId(null);
      setIsEditing(true);
    }
  }, [story]);

  const handleSave = () => {
    onSave({ title, content, tags: selectedTags, folderId });
    if (!story) onClose();
    else setIsEditing(false);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      onAddTag(newTagName.trim());
      setNewTagName('');
    }
  };

  if (!story && !isEditing) return null;

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-300",
      isFullscreen && "fixed inset-0 z-[100]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors lg:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {story ? 'Edit Story' : 'New Story'}
            </h2>
            {story && (
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Last updated {new Date(story.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6 lg:w-5 lg:h-5" /> : <Maximize2 className="w-6 h-6 lg:w-5 lg:h-5" />}
          </button>
          {story && (
            <button
              onClick={() => onDelete(story.id)}
              className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Story"
            >
              <Trash2 className="w-6 h-6 lg:w-5 lg:h-5" />
            </button>
          )}
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 lg:px-4 py-2.5 lg:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/20 font-bold text-sm"
            >
              <Save className="w-5 h-5 lg:w-4 lg:h-4" />
              <span>Save</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 lg:px-4 py-2.5 lg:py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors font-bold text-sm"
            >
              Edit Story
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-12 space-y-8 max-w-4xl mx-auto w-full scroll-smooth">
        {isEditing ? (
          <div className="space-y-8">
            <input
              type="text"
              placeholder="Story Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl lg:text-4xl font-bold border-none focus:ring-0 placeholder-gray-200 dark:placeholder-gray-800 p-0 bg-transparent text-gray-900 dark:text-white tracking-tight"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <FolderIcon className="w-3 h-3" />
                  Location
                </label>
                <select
                  value={folderId || ''}
                  onChange={(e) => setFolderId(e.target.value || null)}
                  className="w-full px-4 py-3 lg:py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base lg:text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <option value="">Root Folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <TagIcon className="w-3 h-3" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "px-3.5 py-1.5 lg:px-3 lg:py-1 rounded-full text-[11px] lg:text-[10px] font-bold uppercase tracking-wider transition-all border",
                        selectedTags.includes(tag.id)
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-blue-900/20"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-blue-300 dark:hover:border-blue-700"
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                  <form onSubmit={handleAddNewTag} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="text-[11px] lg:text-[10px] font-bold px-3.5 py-1.5 lg:px-3 lg:py-1 border border-dashed border-gray-300 dark:border-gray-700 rounded-full focus:border-blue-500 outline-none bg-transparent text-gray-900 dark:text-white w-28 lg:w-24"
                    />
                    <button type="submit" className="ml-1 p-1.5 text-gray-400 hover:text-blue-600">
                      <Plus className="w-4 h-4 lg:w-3 lg:h-3" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <textarea
              placeholder="Start writing your story... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 min-h-[600px] text-lg lg:text-xl leading-relaxed border-none focus:ring-0 placeholder-gray-200 dark:placeholder-gray-800 p-0 resize-none bg-transparent text-gray-900 dark:text-white font-serif"
            />
          </div>
        ) : (
          <div className="prose prose-lg prose-blue dark:prose-invert max-w-none animate-in fade-in duration-500">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">{title || 'Untitled'}</h1>
            
            <div className="flex flex-wrap gap-2 lg:gap-3 mb-8 lg:mb-10">
              {selectedTags.map(tagId => {
                const tag = allTags.find(t => t.id === tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="px-3.5 py-1.5 lg:px-4 lg:py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>

            <div className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-[1.8] whitespace-pre-wrap font-serif">
              <ReactMarkdown>{debouncedContent}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
