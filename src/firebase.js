import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZaCAsOI-qkzLPxoa9Ca0QIi5BZDzCtMA",
  authDomain: "cmed-nukud.firebaseapp.com",
  projectId: "cmed-nukud",
  storageBucket: "cmed-nukud.appspot.com",
  messagingSenderId: "866261350185",
  appId: "1:866261350185:android:c626b7ad0edb664ac1e938"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
