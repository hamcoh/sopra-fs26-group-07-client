import { useState, useCallback } from "react";
import {getApiDomain} from "@/utils/domain";

export function useUserProfile() {
    const [username, setUsername] = useState<string>("");
    const [joinedDate, setJoinedDate] = useState<string>("");
    const [bio, setBio] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stats, setStats] = useState({
        winCount: 0,
        winRatePercentage: 0,
        totalGamesPlayed: 0,
        totalPoints: 0,
    });
    const [avatarId, setAvatarId] = useState<number>(1);

    const fetchUser = useCallback(async (userId: string, token: string, onAuthError?: () => void) => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${getApiDomain()}/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
            });

            if (res.status === 401) {
                if (onAuthError) onAuthError();
                throw new Error("Session expired. Please log in again.");
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load profile");

            setUsername(data.username);
            setBio(data.bio ?? null);
            const date = new Date(data.creationDate);
            setJoinedDate(date.toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
            }));
            setStats({
                winCount: data.winCount ?? 0,
                winRatePercentage: Math.round(data.winRatePercentage ?? 0),
                totalGamesPlayed: data.totalGamesPlayed ?? 0,
                totalPoints: data.totalPoints ?? 0,
            });
            setAvatarId(data.avatarId ?? 1);
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { username, joinedDate, bio, avatarId, stats, isLoading, fetchUser };
}