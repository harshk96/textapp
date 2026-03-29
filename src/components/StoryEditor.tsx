import React, { useState, useEffect } from 'react';
import { Story, Tag } from '../types';
import { Save, Trash2, X, Tag as TagIcon, Plus, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface StoryEditorProps {
  story: Story | null;
  allTags: Tag[];
  onSave: (story: Partial<Story>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onAddTag: (name: string) => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  story,
  allTags,
  onSave,
  onDelete,
  onClose,
  onAddTag
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setContent(story.content);
      setSelectedTags(story.tags);
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setIsEditing(true);
    }
  }, [story]);

  const handleSave = () => {
    onSave({ title, content, tags: selectedTags });
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors lg:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {story ? 'Edit Story' : 'New Story'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {story && (
            <button
              onClick={() => onDelete(story.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Story"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {isEditing ? (
          <>
            <input
              type="text"
              placeholder="Story Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 p-0 bg-transparent text-gray-900 dark:text-white"
            />
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                      selectedTags.includes(tag.id)
                        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="text-xs px-3 py-1 border border-dashed border-gray-300 dark:border-gray-700 rounded-full focus:border-blue-500 outline-none bg-transparent text-gray-900 dark:text-white"
                  />
                  <button type="submit" className="ml-1 p-1 text-gray-400 hover:text-blue-600">
                    <Plus className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
            <textarea
              placeholder="Start writing your story... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 min-h-[400px] text-lg leading-relaxed border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 p-0 resize-none bg-transparent text-gray-900 dark:text-white"
            />
          </>
        ) : (
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title || 'Untitled'}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedTags.map(tagId => {
                const tag = allTags.find(t => t.id === tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
            <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
