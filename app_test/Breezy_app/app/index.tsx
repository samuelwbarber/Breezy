// app/index.tsx (or wherever your index file is)
import React, { useEffect } from "react";
import { useUser } from "./context/userContext";
import { useRouter } from "expo-router";

export default function Index() {
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Defer the navigation until after the root layout is mounted.
    const timer = setTimeout(() => {
      if (currentUser) {
        //router.replace("/(tabs)/home");
        router.replace("/signInScreen");
      } else {
        router.replace("/signInScreen");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentUser, router]);

  return null;
}
