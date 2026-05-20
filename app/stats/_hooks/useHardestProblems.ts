"use client";

import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";
import { GameStatsDTO } from "../_types";

export function useHardestProblems() {
    const { value: token, loading: tokenLoading } = useLocalStorage("token", "");
    const { value: userId, loading: userIdLoading } = useLocalStorage("userid", "");
    const [data, setData] = useState<GameStatsDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tokenLoading || userIdLoading) return;
        if (!token || !userId) {
            setError("Not authenticated");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${getApiDomain()}/stats/hardest-problems`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "token": token,
                        "userId": String(userId),
                    },
                });

                if (res.status === 204 || res.status === 404) {
                    setData([]);
                    return;
                }
                if (!res.ok) throw new Error(`Server error (${res.status})`);

                const json = await res.json();
                setData(Array.isArray(json) ? json : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unexpected error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, userId, tokenLoading, userIdLoading]);

    return { data, loading, error };
}