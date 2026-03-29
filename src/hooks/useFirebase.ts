import React, { useState, useEffect } from 'react';
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
  orderBy
} from '../lib/firebase';
import { Story, Tag, OperationType } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';

export const useFirebase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setStories([]);
      setTags([]);
      return;
    }

    const storiesQuery = query(
      collection(db, 'stories'),
      where('authorId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const tagsQuery = query(
      collection(db, 'tags'),
      where('authorId', '==', user.uid)
    );

    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
      const s = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(s);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'stories'));

    const unsubTags = onSnapshot(tagsQuery, (snapshot) => {
      const t = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
      setTags(t);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tags'));

    return () => {
      unsubStories();
      unsubTags();
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
    throw new Error(JSON.stringify(errInfo));
  };

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  const addStory = async (story: Partial<Story>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'stories'), {
        ...story,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'stories');
    }
  };

  const updateStory = async (id: string, story: Partial<Story>) => {
    try {
      await updateDoc(doc(db, 'stories', id), {
        ...story,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `stories/${id}`);
    }
  };

  const deleteStory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stories', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `stories/${id}`);
    }
  };

  const addTag = async (tag: Partial<Tag>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'tags'), {
        ...tag,
        authorId: user.uid,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tags');
    }
  };

  const updateTag = async (id: string, tag: Partial<Tag>) => {
    try {
      await updateDoc(doc(db, 'tags', id), tag);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tags/${id}`);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tags', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tags/${id}`);
    }
  };

  return {
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
  };
};
