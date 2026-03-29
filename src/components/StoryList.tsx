import React from 'react';
import { Story, Tag } from '../types';
import { format } from 'date-fns';
import { Calendar, Tag as TagIcon, ChevronRight, Folder as FolderIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';

interface StoryListProps {
  stories: Story[];
  tags: Tag[];
  selectedStoryId: string | null;
  onSelectStory: (id: string) => void;
}

export const StoryList: React.FC<StoryListProps> = ({
  stories,
  tags,
  selectedStoryId,
  onSelectStory
}) => {
  const getTagName = (tagId: string) => tags.find(t => t.id === tagId)?.name || 'Unknown';
  const getTagColor = (tagId: string) => tags.find(t => t.id === tagId)?.color || '#94a3b8';

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 dark:text-gray-500 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-brand/10 dark:bg-brand/20 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
          <TagIcon className="w-10 h-10 text-brand" />
        </div>
        <p className="text-xl font-black text-gray-900 dark:text-white mb-2">No stories found</p>
        <p className="text-sm max-w-[200px] leading-relaxed">Try adjusting your search or create a new story to begin.</p>
      </div>
    );
  }

  const renderStoryItem = (index: number) => {
    const story = stories[index];
    return (
      <motion.button
        key={story.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => onSelectStory(story.id)}
        className={cn(
          "w-full text-left p-5 lg:p-4 transition-all hover:bg-brand/5 dark:hover:bg-brand/10 flex items-start gap-4 group border-b border-gray-100 dark:border-gray-800",
          selectedStoryId === story.id ? "bg-brand/10 dark:bg-brand/20 border-l-4 border-brand" : "border-l-4 border-transparent"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 lg:mb-1">
            <h3 className={cn(
              "font-semibold truncate text-lg lg:text-base transition-colors",
              selectedStoryId === story.id ? "text-brand-dark dark:text-brand-light" : "text-gray-900 dark:text-gray-100"
            )}>
              {story.title || 'Untitled Story'}
            </h3>
            <ChevronRight className={cn(
              "w-5 h-5 lg:w-4 lg:h-4 text-gray-300 dark:text-gray-600 transition-transform group-hover:translate-x-1",
              selectedStoryId === story.id && "text-brand"
            )} />
          </div>
          
          <p className="text-base lg:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 lg:mb-3 leading-relaxed">
            {story.content || 'No content...'}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {story.updatedAt ? format(story.updatedAt.toDate(), 'MMM d, yyyy') : 'Just now'}
            </div>
            
            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {story.tags.slice(0, 3).map(tagId => (
                  <span
                    key={tagId}
                    className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    style={{ borderColor: `${getTagColor(tagId)}40`, color: getTagColor(tagId) }}
                  >
                    {getTagName(tagId)}
                  </span>
                ))}
                {story.tags.length > 3 && (
                  <span className="text-gray-300 dark:text-gray-600">+{story.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="h-full">
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={stories.length}
        itemContent={renderStoryItem}
        increaseViewportBy={200}
      />
    </div>
  );
};
