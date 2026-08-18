import { collection, doc, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { MESSAGE_SEED } from './motivationalMessagesSeed';

const CHUNK_SIZE = 450;

function getSeedStatusDoc() {
  return doc(db, 'metadata', 'seedStatus');
}

export async function seedMotivationalMessagesIfNeeded(): Promise<{ seeded: boolean; count: number }> {
  const statusSnap = await getDoc(getSeedStatusDoc());
  if (statusSnap.exists() && statusSnap.data()?.motivationalMessagesSeeded) {
    return { seeded: false, count: 0 };
  }

  const messagesRef = collection(db, 'motivational_messages');
  let count = 0;

  for (let i = 0; i < MESSAGE_SEED.length; i += CHUNK_SIZE) {
    const chunk = MESSAGE_SEED.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((msg) => {
      const newDocRef = doc(messagesRef);
      batch.set(newDocRef, {
        text: msg.text,
        category: msg.category,
        active: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        randomIndex: Math.random(),
      });
      count += 1;
    });

    await batch.commit();
  }

  await setDoc(getSeedStatusDoc(), {
    motivationalMessagesSeeded: true,
    seededAt: new Date().toISOString(),
    totalMessages: count,
  });

  return { seeded: true, count };
}