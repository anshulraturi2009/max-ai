import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { isAdminEmail } from "../constants/app";
import { firebaseApp } from "./firebase";

const USERS_COLLECTION = "users";
const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";

export const db = firebaseApp ? getFirestore(firebaseApp) : null;

function nowMs() {
  return Date.now();
}

function previewText(value = "") {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }

  return normalized.length > 120 ? `${normalized.slice(0, 120)}...` : normalized;
}

function mapTimestamp(value, fallback = 0) {
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value === "number") {
    return value;
  }

  return fallback;
}

function mapConversation(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: mapTimestamp(data.createdAt, data.createdAtMs),
    updatedAt: mapTimestamp(data.updatedAt, data.updatedAtMs),
    lastMessageAt: mapTimestamp(data.lastMessageAt, data.lastMessageAtMs),
  };
}

function mapMessage(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    timestamp: mapTimestamp(data.createdAt, data.createdAtMs),
  };
}

function mapUser(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: mapTimestamp(data.createdAt, data.createdAtMs),
    lastSeenAt: mapTimestamp(data.lastSeenAt, data.lastSeenAtMs),
  };
}

export async function upsertUserProfile(user) {
  if (!db || !user) {
    return;
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const existingUser = await getDoc(userRef);
  const timestampMs = nowMs();
  const sharedPayload = {
    uid: user.uid,
    email: user.email ?? "",
    emailLower: (user.email ?? "").toLowerCase(),
    displayName: user.displayName ?? "MAX AI User",
    photoURL: user.photoURL ?? "",
    role: isAdminEmail(user.email) ? "admin" : "user",
    lastSeenAt: serverTimestamp(),
    lastSeenAtMs: timestampMs,
  };

  if (existingUser.exists()) {
    await setDoc(userRef, sharedPayload, { merge: true });
    return;
  }

  await setDoc(
    userRef,
    {
      ...sharedPayload,
      createdAt: serverTimestamp(),
      createdAtMs: timestampMs,
    },
    { merge: true },
  );
}

export async function createConversation({ user, personaId }) {
  if (!db || !user) {
    return null;
  }

  const conversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
  const timestampMs = nowMs();

  await setDoc(conversationRef, {
    userId: user.uid,
    userEmail: user.email ?? "",
    userEmailLower: (user.email ?? "").toLowerCase(),
    userName: user.displayName ?? "MAX AI User",
    userPhotoURL: user.photoURL ?? "",
    title: "Fresh thread",
    personaId,
    status: "active",
    messageCount: 0,
    lastMessagePreview: "",
    lastMessageRole: "",
    createdAt: serverTimestamp(),
    createdAtMs: timestampMs,
    updatedAt: serverTimestamp(),
    updatedAtMs: timestampMs,
    lastMessageAt: serverTimestamp(),
    lastMessageAtMs: timestampMs,
  });

  return conversationRef.id;
}

export async function updateConversationPersona(conversationId, personaId) {
  if (!db || !conversationId) {
    return;
  }

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
    personaId,
    updatedAt: serverTimestamp(),
    updatedAtMs: nowMs(),
  });
}

export async function appendConversationMessage({
  conversationId,
  conversationTitle,
  messageCount = 0,
  role,
  content,
  personaId,
  user,
}) {
  if (!db || !conversationId || !content.trim()) {
    return;
  }

  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  const messageRef = doc(collection(conversationRef, MESSAGES_COLLECTION));
  const timestampMs = nowMs();
  const nextTitle =
    messageCount === 0 && role === "user" ? previewText(content).slice(0, 38) || "Fresh thread" : conversationTitle || "Fresh thread";

  const batch = writeBatch(db);
  batch.set(messageRef, {
    role,
    content: content.trim(),
    personaId,
    authorId: role === "user" ? user?.uid ?? "user" : "max-ai",
    authorName:
      role === "user"
        ? user?.displayName ?? "MAX AI User"
        : "MAX AI",
    createdAt: serverTimestamp(),
    createdAtMs: timestampMs,
  });
  batch.update(conversationRef, {
    personaId,
    title: nextTitle,
    updatedAt: serverTimestamp(),
    updatedAtMs: timestampMs,
    lastMessageAt: serverTimestamp(),
    lastMessageAtMs: timestampMs,
    lastMessagePreview: previewText(content),
    lastMessageRole: role,
    messageCount: increment(1),
  });
  await batch.commit();
}

export async function clearConversation(conversationId) {
  if (!db || !conversationId) {
    return;
  }

  const messagesRef = collection(
    db,
    CONVERSATIONS_COLLECTION,
    conversationId,
    MESSAGES_COLLECTION,
  );
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);

  snapshot.docs.forEach((messageDoc) => {
    batch.delete(messageDoc.ref);
  });

  batch.update(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
    title: "Fresh thread",
    messageCount: 0,
    lastMessagePreview: "",
    lastMessageRole: "",
    updatedAt: serverTimestamp(),
    updatedAtMs: nowMs(),
  });

  await batch.commit();
}

export function subscribeToUserConversations(userId, onData, onError) {
  if (!db || !userId) {
    return () => {};
  }

  const conversationsQuery = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where("userId", "==", userId),
  );

  return onSnapshot(
    conversationsQuery,
    (snapshot) => {
      const conversations = snapshot.docs
        .map(mapConversation)
        .sort((left, right) => right.updatedAt - left.updatedAt);
      onData(conversations);
    },
    onError,
  );
}

export function subscribeToConversationMessages(conversationId, onData, onError) {
  if (!db || !conversationId) {
    return () => {};
  }

  const messagesQuery = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy("createdAtMs", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapMessage));
    },
    onError,
  );
}

export function subscribeToAllUsers(onData, onError) {
  if (!db) {
    return () => {};
  }

  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const users = snapshot.docs
        .map(mapUser)
        .sort((left, right) => right.lastSeenAt - left.lastSeenAt);
      onData(users);
    },
    onError,
  );
}

export function subscribeToAllConversations(onData, onError) {
  if (!db) {
    return () => {};
  }

  return onSnapshot(
    collection(db, CONVERSATIONS_COLLECTION),
    (snapshot) => {
      const conversations = snapshot.docs
        .map(mapConversation)
        .sort((left, right) => right.updatedAt - left.updatedAt);
      onData(conversations);
    },
    onError,
  );
}
