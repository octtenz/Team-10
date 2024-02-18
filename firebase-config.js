import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db }
