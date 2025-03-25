"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/authContext";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 구독 정보 로드
  const loadSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSubscription(
          userData.subscription || {
            status: "inactive",
            plan: null,
            tokens: 0,
            startDate: null,
            endDate: null,
          }
        );
      }
    } catch (err) {
      console.error("구독 정보 로드 오류:", err);
      setError("구독 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 토큰 사용
  const useToken = useCallback(async () => {
    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const userData = userSnap.data();
      const userSubscription = userData.subscription || {};

      // 구독 상태 확인
      if (userSubscription.status !== "active") {
        throw new Error("활성화된 구독이 없습니다.");
      }

      // 토큰 수량 확인
      if (userSubscription.tokens <= 0) {
        throw new Error(
          "사용 가능한 토큰이 없습니다. 추가 토큰을 구매해주세요."
        );
      }

      // 토큰 차감
      await updateDoc(userRef, {
        "subscription.tokens": increment(-1),
      });

      // 구독 정보 다시 로드
      await loadSubscription();

      return true;
    } catch (err) {
      console.error("토큰 사용 오류:", err);
      throw err;
    }
  }, [user, loadSubscription]);

  // 디버깅용: 구독 활성화 및 토큰 추가 (결제 과정 생략)
  const activateSubscriptionForDebug = useCallback(
    async (tokens = 50, plan = "basic") => {
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(now.getMonth() + 1); // 한 달 후

        await updateDoc(userRef, {
          "subscription.status": "active",
          "subscription.plan": plan,
          "subscription.tokens": tokens,
          "subscription.startDate": now.toISOString(),
          "subscription.endDate": endDate.toISOString(),
        });

        // 구독 정보 다시 로드
        await loadSubscription();

        return true;
      } catch (err) {
        console.error("디버깅용 구독 활성화 오류:", err);
        throw err;
      }
    },
    [user, loadSubscription]
  );

  // 디버깅용: 토큰 추가 (결제 과정 생략)
  const addTokensForDebug = useCallback(
    async (tokens = 20) => {
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "subscription.tokens": increment(tokens),
        });

        // 구독 정보 다시 로드
        await loadSubscription();

        return true;
      } catch (err) {
        console.error("디버깅용 토큰 추가 오류:", err);
        throw err;
      }
    },
    [user, loadSubscription]
  );

  // 구독 정보 로드
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  return {
    subscription,
    loading,
    error,
    loadSubscription,
    useToken,
    activateSubscriptionForDebug,
    addTokensForDebug,
    hasActiveSubscription: subscription?.status === "active",
    remainingTokens: subscription?.tokens || 0,
  };
}
