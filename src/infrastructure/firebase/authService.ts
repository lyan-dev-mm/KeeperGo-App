import auth from "@react-native-firebase/auth";

export const registerUser = async (email: string, password: string) => {
  const userCredential = await auth().createUserWithEmailAndPassword(
    email,
    password
  );

  return userCredential.user;
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await auth().signInWithEmailAndPassword(
    email,
    password
  );

  return userCredential.user;
};

export const logoutUser = async () => {
  await auth().signOut();
};

export const getCurrentUser = () => {
  return auth().currentUser;
};