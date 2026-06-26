import firestore from "@react-native-firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string;
  name?: string;
  createdAt?: any;
  updatedAt?: any;
};

export const createUserProfile = async (profile: UserProfile) => {
  await firestore()
    .collection("users")
    .doc(profile.uid)
    .set({
      ...profile,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const getUserProfile = async (uid: string) => {
  const documentSnapshot = await firestore()
    .collection("users")
    .doc(uid)
    .get();

  if (!documentSnapshot.exists) {
    return null;
  }

  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
) => {
  await firestore()
    .collection("users")
    .doc(uid)
    .update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};