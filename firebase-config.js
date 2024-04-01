import firebase from 'firebase/compat/app';
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/compat/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDtPR5OAYDU5_4zDRbbIUAZYBYzrK5D4nE",
    authDomain: "team10-c90d8.firebaseapp.com",
    projectId: "team10-c90d8",
    storageBucket: "team10-c90d8.appspot.com",
    messagingSenderId: "48096993648",
    appId: "1:48096993648:web:6894706c4677ac302a2fb5",
    measurementId: "G-9QYS5XVZ2K"
    // databaseURL: 'https://todoapp-XXXXXX.firebaseio.com',
};

if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}
export const FIREBASE_APP = firebase;
// export const FIREBASE_APP = initializeApp(firebaseConfig);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_AUTH = firebase.auth();
export const FIREBASE_DB = firebase.firestore();
