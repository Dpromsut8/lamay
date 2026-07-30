// Firebase Configuration & Initialization Setup
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyD-MockKeyForLamayFarmApp",
  authDomain: "lamay-smart-farm.firebaseapp.com",
  databaseURL: "https://lamay-smart-farm-default-rtdb.firebaseio.com",
  projectId: "lamay-smart-farm",
  storageBucket: "lamay-smart-farm.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// ตรวจสอบเพื่อป้องกันการ Initialize ซ้ำซ้อน (Singleton Pattern สำหรับ Firebase App)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ส่งออก Services หลักที่มักใช้งานบ่อยในโปรเจกต์ Smart Farm
export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

