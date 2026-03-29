export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // For nested folders
  authorId: string;
  createdAt: any;
  updatedAt: any;
}

export type { User } from 'firebase/auth';

export interface Story {
  id: string;
  title: string;
  content: string;
  tags: string[]; // Array of tag IDs
  folderId: string | null; // Folder association
  createdAt: any;
  updatedAt: any;
  authorId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  authorId: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
