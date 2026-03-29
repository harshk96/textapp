import React from 'react';
import { Story, Tag } from '../types';
import { format } from 'date-fns';
import { Calendar, Tag as TagIcon, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <TagIcon className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium">No stories found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800 h-full overflow-y-auto">
      <AnimatePresence initial={false}>
        {stories.map((story) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onSelectStory(story.id)}
            className={cn(
              "w-full text-left p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-4 group",
              selectedStoryId === story.id ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500" : "border-l-4 border-transparent"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={cn(
                  "font-semibold truncate",
                  selectedStoryId === story.id ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
                )}>
                  {story.title || 'Untitled Story'}
                </h3>
                <ChevronRight className={cn(
                  "w-4 h-4 text-gray-300 dark:text-gray-600 transition-transform group-hover:translate-x-1",
                  selectedStoryId === story.id && "text-blue-400"
                )} />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
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
        ))}
      </AnimatePresence>
    </div>
  );
};
