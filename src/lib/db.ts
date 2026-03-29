import Dexie, { Table } from 'dexie';
import { Story, Tag, Folder } from '../types';

export class StoryArchDB extends Dexie {
  stories!: Table<Story>;
  tags!: Table<Tag>;
  folders!: Table<Folder>;

  constructor() {
    super('StoryArchDB');
    this.version(1).stores({
      stories: 'id, title, authorId, folderId, *tags, updatedAt',
      tags: 'id, name, authorId',
      folders: 'id, name, authorId, parentId'
    });
  }
}

export const dbLocal = new StoryArchDB();
