"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import useSubscriptionStore from "./stores/subscriptionStore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateSubscription, setLoading: setSubscriptionLoading } =
    useSubscriptionStore();

  // 사용자 정보를 Firestore에 저장
  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // 사용자 정보가 없으면 새로 생성
    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          // 초기 구독 상태 및 토큰 설정
          subscription: {
            status: "inactive",
            plan: null,
            tokens: 0,
            startDate: null,
            endDate: null,
          },
        });
        // 초기 구독 상태를 Zustand에 저장
        updateSubscription({
          status: "inactive",
          plan: null,
          tokens: 0,
          startDate: null,
          endDate: null,
        });
      } catch (error) {
        console.error("Error creating user document:", error);
      }
    } else {
      // 기존 사용자의 구독 정보를 Zustand에 저장
      const userData = userSnap.data();
      updateSubscription(
        userData.subscription || {
          status: "inactive",
          plan: null,
          tokens: 0,
          startDate: null,
          endDate: null,
        }
      );
    }
  };

  // 구글 로그인
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // 로그아웃
  const logOut = async () => {
    try {
      await signOut(auth);
      // 로그아웃 시 구독 정보 초기화
      updateSubscription(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        await createUserDocument(user);
      } else {
        // 로그아웃 시 구독 정보 초기화
        updateSubscription(null);
      }
    });

    return () => unsubscribe();
  }, [updateSubscription]);

  const value = {
    user,
    loading,
    signInWithGoogle,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
