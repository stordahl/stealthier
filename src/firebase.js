import firebase from 'firebase/app'
import 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcIn3QuK0X1HBER4JCxGi15zC6OkhZZqI",
    authDomain: "stealthier-c583b.firebaseapp.com",
    databaseURL: "https://stealthier-c583b.firebaseio.com",
    projectId: "stealthier-c583b",
    storageBucket: "stealthier-c583b.appspot.com",
    messagingSenderId: "765436020541",
    appId: "1:765436020541:web:6956d6d500e3c31bab2754",
    measurementId: "G-1MWK3R3K37"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();