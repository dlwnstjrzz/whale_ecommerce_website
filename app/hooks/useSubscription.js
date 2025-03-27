"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/authContext";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import useSubscriptionStore from "@/lib/stores/subscriptionStore";

export function useSubscription() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    subscription,
    loading,
    error,
    updateSubscription,
    setLoading,
    setError,
  } = useSubscriptionStore();

  // 토큰 사용
  const consumeToken = useCallback(async () => {
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
        router.push("/subscription");
        throw new Error(
          "활성화된 구독이 필요합니다. 구독 플랜을 선택해주세요."
        );
      }

      // 토큰 수량 확인
      if (userSubscription.tokens <= 0) {
        router.push("/subscription/add-tokens");
        throw new Error(
          "사용 가능한 토큰이 없습니다. 추가 토큰을 구매해주세요."
        );
      }

      // 토큰 차감
      await updateDoc(userRef, {
        "subscription.tokens": increment(-1),
      });

      // 구독 정보 업데이트
      const updatedSubscription = {
        ...userSubscription,
        tokens: userSubscription.tokens - 1,
      };
      updateSubscription(updatedSubscription);

      return true;
    } catch (err) {
      console.error("토큰 사용 오류:", err);
      throw err;
    }
  }, [user, updateSubscription, router]);

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

        const updatedSubscription = {
          status: "active",
          plan,
          tokens,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
        };

        await updateDoc(userRef, {
          subscription: updatedSubscription,
        });

        // 구독 정보 업데이트
        updateSubscription(updatedSubscription);

        return true;
      } catch (err) {
        console.error("디버깅용 구독 활성화 오류:", err);
        throw err;
      }
    },
    [user, updateSubscription]
  );

  // 디버깅용: 토큰 추가 (결제 과정 생략)
  const addTokensForDebug = useCallback(
    async (tokens = 20) => {
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const currentTokens = userData.subscription?.tokens || 0;

        await updateDoc(userRef, {
          "subscription.tokens": increment(tokens),
        });

        // 구독 정보 업데이트
        const updatedSubscription = {
          ...userData.subscription,
          tokens: currentTokens + tokens,
        };
        updateSubscription(updatedSubscription);

        return true;
      } catch (err) {
        console.error("디버깅용 토큰 추가 오류:", err);
        throw err;
      }
    },
    [user, updateSubscription]
  );

  return {
    subscription,
    loading,
    error,
    consumeToken,
    activateSubscriptionForDebug,
    addTokensForDebug,
    hasActiveSubscription: subscription?.status === "active",
    remainingTokens: subscription?.tokens || 0,
  };
}
