import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";

export function useAuth() {
    const router = useRouter();
    const { value: token, loading: tokenLoading, clear: clearToken } = useLocalStorage<string>("token", "");
    const { value: userId, loading: userIdLoading, clear: clearUserId } = useLocalStorage<string>("userid", "");
    const { clear: clearUsername } = useLocalStorage<string>("username", "");
    const { clear: clearAvatarId } = useLocalStorage<string>("avatarId", "");

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogOut = useCallback(async (delay = 0) => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            if (token && userId) {
                await fetch(`${getApiDomain()}/users/logout/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", token: token },
                });
            }
        } catch (e) {
            console.error("Logout failed", e);
        }

        clearToken();
        clearUserId();
        clearUsername();
        clearAvatarId();

        setTimeout(() => {
            router.push("/");
        }, delay);
    }, [router, clearToken, clearUserId, clearUsername, isLoggingOut, token, userId]);

    return {
        token,
        userId,
        isLoading: tokenLoading || userIdLoading,
        isLoggingOut,
        handleLogOut
    };
}