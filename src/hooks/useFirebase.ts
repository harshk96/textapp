import React, { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  db, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  setDoc,
  Timestamp
} from '../lib/firebase';
import { Story, Tag, Folder, OperationType } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { dbLocal } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useFirebase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use Dexie for local data
  const stories = useLiveQuery(
    () => dbLocal.stories.orderBy('updatedAt').reverse().toArray(),
    []
  ) || [];
  
  const tags = useLiveQuery(
    () => dbLocal.tags.toArray(),
    []
  ) || [];

  const folders = useLiveQuery(
    () => dbLocal.folders.toArray(),
    []
  ) || [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync logic
  useEffect(() => {
    if (!user) {
      dbLocal.stories.clear();
      dbLocal.tags.clear();
      dbLocal.folders.clear();
      return;
    }

    const storiesQuery = query(
      collection(db, 'stories'),
      where('authorId', '==', user.uid)
    );

    const tagsQuery = query(
      collection(db, 'tags'),
      where('authorId', '==', user.uid)
    );

    const foldersQuery = query(
      collection(db, 'folders'),
      where('authorId', '==', user.uid)
    );

    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = { id: change.doc.id, ...change.doc.data() } as Story;
        if (change.type === 'added' || change.type === 'modified') {
          await dbLocal.stories.put(data);
        } else if (change.type === 'removed') {
          await dbLocal.stories.delete(change.doc.id);
        }
      });
    });

    const unsubTags = onSnapshot(tagsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = { id: change.doc.id, ...change.doc.data() } as Tag;
        if (change.type === 'added' || change.type === 'modified') {
          await dbLocal.tags.put(data);
        } else if (change.type === 'removed') {
          await dbLocal.tags.delete(change.doc.id);
        }
      });
    });

    const unsubFolders = onSnapshot(foldersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = { id: change.doc.id, ...change.doc.data() } as Folder;
        if (change.type === 'added' || change.type === 'modified') {
          await dbLocal.folders.put(data);
        } else if (change.type === 'removed') {
          await dbLocal.folders.delete(change.doc.id);
        }
      });
    });

    return () => {
      unsubStories();
      unsubTags();
      unsubFolders();
    };
  }, [user]);

  const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
    const errInfo = {
      error: error.message,
      operationType: operation,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName,
          email: p.email,
          photoUrl: p.photoURL
        })) || []
      }
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    // throw new Error(JSON.stringify(errInfo));
  };

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  const addStory = async (story: Partial<Story>) => {
    if (!user) return;
    try {
      const docRef = doc(collection(db, 'stories'));
      const newStory: Story = {
        id: docRef.id,
        title: story.title || '',
        content: story.content || '',
        tags: story.tags || [],
        folderId: story.folderId || null,
        authorId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(docRef, newStory);
      await dbLocal.stories.put(newStory);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'stories');
    }
  };

  const updateStory = async (id: string, story: Partial<Story>) => {
    try {
      const updateData = {
        ...story,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, 'stories', id), updateData);
      const existing = await dbLocal.stories.get(id);
      if (existing) {
        await dbLocal.stories.update(id, updateData);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `stories/${id}`);
    }
  };

  const deleteStory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stories', id));
      await dbLocal.stories.delete(id);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `stories/${id}`);
    }
  };

  const addTag = async (tag: Partial<Tag>) => {
    if (!user) return;
    try {
      const docRef = doc(collection(db, 'tags'));
      const newTag: Tag = {
        id: docRef.id,
        name: tag.name || '',
        color: tag.color || '#3b82f6',
        authorId: user.uid,
      };
      await setDoc(docRef, newTag);
      await dbLocal.tags.put(newTag);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tags');
    }
  };

  const updateTag = async (id: string, tag: Partial<Tag>) => {
    try {
      await updateDoc(doc(db, 'tags', id), tag);
      await dbLocal.tags.update(id, tag);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tags/${id}`);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tags', id));
      await dbLocal.tags.delete(id);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tags/${id}`);
    }
  };

  const addFolder = async (name: string, parentId: string | null = null) => {
    if (!user) return;
    try {
      const docRef = doc(collection(db, 'folders'));
      const newFolder: Folder = {
        id: docRef.id,
        name,
        parentId,
        authorId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(docRef, newFolder);
      await dbLocal.folders.put(newFolder);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'folders');
    }
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    try {
      await updateDoc(doc(db, 'folders', id), data);
      await dbLocal.folders.update(id, data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `folders/${id}`);
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'folders', id));
      await dbLocal.folders.delete(id);
      // Optional: Move stories in this folder to root
      const storiesInFolder = await dbLocal.stories.where('folderId').equals(id).toArray();
      for (const s of storiesInFolder) {
        await updateStory(s.id, { folderId: null });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `folders/${id}`);
    }
  };

  return {
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
  };
};
