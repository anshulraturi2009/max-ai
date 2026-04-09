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
  runTransaction,
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
const PUBLIC_SITE_COLLECTION = "publicSite";
const LOGIN_SHOWCASE_DOC = "loginShowcase";

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

function normalizeShowcaseUsers(users = []) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      uid: entry.uid ?? "",
      displayName: entry.displayName ?? "MAX AI User",
      photoURL: entry.photoURL ?? "",
      seenAtMs: typeof entry.seenAtMs === "number" ? entry.seenAtMs : 0,
    }))
    .sort((left, right) => right.seenAtMs - left.seenAtMs)
    .slice(0, 3);
}

export function isUserProfileComplete(user) {
  if (!user) {
    return false;
  }

  return Boolean(
    user.uid &&
      (user.email ?? "").trim() &&
      (user.displayName ?? "").trim() &&
      (user.phoneNumber ?? "").trim() &&
      (user.gender ?? "").trim(),
  );
}

export async function getUserProfile(uid) {
  if (!db || !uid) {
    return null;
  }

  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snapshot.exists() ? snapshot.data() : null;
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
    gender: user.gender ?? "",
    dob: user.dob ?? "",
    phoneNumber: user.phoneNumber ?? "",
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

export async function migrateLegacyUserData(nextUser, legacyUser = null) {
  if (!db || !nextUser?.uid || !nextUser?.email) {
    return;
  }

  const emailLower = (nextUser.email ?? "").toLowerCase();
  const conversationMap = new Map();

  const emailSnapshot = await getDocs(
    query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("userEmailLower", "==", emailLower),
    ),
  );
  emailSnapshot.docs.forEach((documentSnapshot) => {
    conversationMap.set(documentSnapshot.id, documentSnapshot);
  });

  if (legacyUser?.uid && legacyUser.uid !== nextUser.uid) {
    const legacySnapshot = await getDocs(
      query(
        collection(db, CONVERSATIONS_COLLECTION),
        where("userId", "==", legacyUser.uid),
      ),
    );
    legacySnapshot.docs.forEach((documentSnapshot) => {
      conversationMap.set(documentSnapshot.id, documentSnapshot);
    });
  }

  const conversationsToUpdate = Array.from(conversationMap.values()).filter(
    (documentSnapshot) => {
      const data = documentSnapshot.data() ?? {};
      return (
        data.userId !== nextUser.uid ||
        (data.userEmailLower ?? "") !== emailLower ||
        (data.userName ?? "") !== (nextUser.displayName ?? "MAX AI User") ||
        (data.userPhotoURL ?? "") !== (nextUser.photoURL ?? "")
      );
    },
  );

  if (!conversationsToUpdate.length) {
    return;
  }

  const timestampMs = nowMs();
  const chunks = [];
  for (let index = 0; index < conversationsToUpdate.length; index += 400) {
    chunks.push(conversationsToUpdate.slice(index, index + 400));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((conversationSnapshot) => {
      batch.update(conversationSnapshot.ref, {
        userId: nextUser.uid,
        userEmail: nextUser.email ?? "",
        userEmailLower: emailLower,
        userName: nextUser.displayName ?? "MAX AI User",
        userPhotoURL: nextUser.photoURL ?? "",
        updatedAt: serverTimestamp(),
        updatedAtMs: timestampMs,
      });
    });
    await batch.commit();
  }
}

export async function syncLoginShowcaseUser(user) {
  if (!db || !user) {
    return;
  }

  const showcaseRef = doc(db, PUBLIC_SITE_COLLECTION, LOGIN_SHOWCASE_DOC);
  const timestampMs = nowMs();
  const nextUser = {
    uid: user.uid,
    displayName: user.displayName ?? "MAX AI User",
    photoURL: user.photoURL ?? "",
    seenAtMs: timestampMs,
  };

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(showcaseRef);
    const currentUsers = normalizeShowcaseUsers(snapshot.data()?.users);
    const nextUsers = [
      nextUser,
      ...currentUsers.filter((entry) => entry.uid !== user.uid),
    ].slice(0, 3);

    transaction.set(
      showcaseRef,
      {
        users: nextUsers,
        updatedAtMs: timestampMs,
      },
      { merge: true },
    );
  });
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
    workspaceContext: "",
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

export async function updateConversationWorkspaceContext(
  conversationId,
  workspaceContext,
) {
  if (!db || !conversationId) {
    return;
  }

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
    workspaceContext: workspaceContext?.trim() || "",
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
  clientTag = "",
  personaId,
  user,
  messageType = "text",
  media = null,
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
    clientTag,
    personaId,
    messageType,
    ...(media ? { media } : {}),
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

export function subscribeToLoginShowcase(onData, onError) {
  if (!db) {
    onData([]);
    return () => {};
  }

  const showcaseRef = doc(db, PUBLIC_SITE_COLLECTION, LOGIN_SHOWCASE_DOC);

  return onSnapshot(
    showcaseRef,
    (snapshot) => {
      onData(normalizeShowcaseUsers(snapshot.data()?.users));
    },
    onError,
  );
}
