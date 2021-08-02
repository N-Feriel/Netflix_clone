import firebase from "firebase";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_FIREBASE,
  authDomain: "netflix-clone-14d99.firebaseapp.com",
  projectId: "netflix-clone-14d99",
  storageBucket: "netflix-clone-14d99.appspot.com",
  messagingSenderId: "1039451379465",
  appId: "1:1039451379465:web:eae14754175b47e62a65d8",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();

const auth = firebase.auth();

export { auth };
export default db;
