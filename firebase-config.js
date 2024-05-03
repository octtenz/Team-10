import firebase from 'firebase/compat/app';
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/compat/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/compat/firestore';

/**
 * Firebase configuration object containing settings for Firebase services
 */
const firebaseConfig = {
    apiKey: "AIzaSyAPJbr9fq7RQRVxi9l52Eb_0OE07ILfThU",
    authDomain: "team-10-f81c2.firebaseapp.com",
    projectId: "team-10-f81c2",
    storageBucket: "team-10-f81c2.appspot.com",
    messagingSenderId: "168094770908",
    appId: "1:168094770908:web:8e43509c7560e500bc7619"
};

/**
 * Initialize app base on firebase configuration if didn't
 */
if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

/**
 * Export Firebase app, authentication, firestore instance
 */
export const FIREBASE_APP = firebase;
export const FIREBASE_AUTH = firebase.auth();
export const FIREBASE_DB = firebase.firestore();
