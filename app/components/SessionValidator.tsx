"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiDomain } from "@/utils/domain";

const AUTH_KEYS = ["token", "userid", "username", "avatarId"];
const PUBLIC_PATHS = ["/", "/login", "/register"];

/**
 * Validates the stored session token against the backend on app load.
 * If the token is stale (e.g. after a server redeployment / DB wipe),
 * all auth data is cleared and the user is redirected to /login.
 * Network errors are ignored — we only log out on explicit 401/403.
 */
export default function SessionValidator() {
    const router = useRouter();

    useEffect(() => {
        // useLocalStorage stores values via JSON.stringify, so we must parse them back
        const token  = JSON.parse(localStorage.getItem("token")  ?? "null");
        const userId = JSON.parse(localStorage.getItem("userid") ?? "null");

        if (!token || !userId) return; // anonymous — nothing to validate

        fetch(`${getApiDomain()}/users/${userId}`, {
            headers: { token },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));

                    const isOnPublicPage = PUBLIC_PATHS.includes(window.location.pathname);
                    if (!isOnPublicPage) {
                        router.replace("/login?reason=session_expired");
                    }
                    // On login/register/landing: just clear — the login page will
                    // show the expiry message if it detects the reason param.
                }
            })
            .catch(() => {
                // Network error — don't log out. Could be a temporary blip.
            });
    }, []); // run once on initial mount

    return null;
}
