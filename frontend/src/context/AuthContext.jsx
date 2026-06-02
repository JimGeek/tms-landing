import React, { createContext, useContext, useState, useEffect } from 'react';
import { createGeniusSdk } from '../lib/geniusSdk';

const AuthContext = createContext();

const SSO_ORIGIN = import.meta.env.VITE_SSO_ORIGIN || 'https://auth.superhomes.app';
const API_URL = import.meta.env.VITE_API_URL || 'https://api.superhomes.app';
const BRAND_SLUG = import.meta.env.VITE_BRAND_SLUG || 'themetalstore';

// One SDK instance for the whole app — SSO methods are configured once here.
const sdk = createGeniusSdk({
    apiUrl: API_URL,
    brandSlug: BRAND_SLUG,
    captureKey: import.meta.env.VITE_CAPTURE_KEY || '',
    ssoOrigin: SSO_ORIGIN,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pull the user profile from /auth/me/ given an access token. Used to
    // hydrate `user` when we rehydrate the session from SSO without a
    // locally-cached user record.
    const hydrateUserFromToken = async (accessToken) => {
        try {
            const res = await fetch(`${API_URL}/api/v1/auth/me/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) return null;
            const wrapped = await res.json();
            const data = wrapped?.data ?? wrapped;
            return data?.user ?? null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        // 1. Local cache — fastest path.
        const storedUser = localStorage.getItem('tms_user');
        const storedToken = localStorage.getItem('tms_token');
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setLoading(false);
                return;
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse stored user', e);
                localStorage.removeItem('tms_user');
                localStorage.removeItem('tms_token');
            }
        }

        // 2. Cross-brand SSO check (Phase 2). If the user is logged in at
        //    any other brand site, lift their tokens here transparently.
        sdk.bootstrapSso({
            onToken: async ({ access, refresh }) => {
                localStorage.setItem('tms_token', access);
                if (refresh) localStorage.setItem('tms_refresh_token', refresh);
                const profile = await hydrateUserFromToken(access);
                if (profile) {
                    setUser(profile);
                    localStorage.setItem('tms_user', JSON.stringify(profile));
                }
                setLoading(false);
            },
            onNoSession: () => setLoading(false),
        });
    }, []);

    const login = (data, options = {}) => {
        const access = data.access;
        const refresh = data.refresh;

        if (data.user) {
            setUser(data.user);
            localStorage.setItem('tms_user', JSON.stringify(data.user));
        }
        if (access) localStorage.setItem('tms_token', access);
        if (refresh) localStorage.setItem('tms_refresh_token', refresh);

        // Push to central SSO so other brand sites pick it up silently.
        // Skip if the caller already routed through SSO (avoids redirect loop)
        // or explicitly opts out.
        if (access && refresh && options.pushToSso !== false) {
            sdk.pushToSso({
                access,
                refresh,
                returnTo: options.returnTo || window.location.href,
            });
        }
    };

    const logout = (options = {}) => {
        setUser(null);
        localStorage.removeItem('tms_user');
        localStorage.removeItem('tms_token');
        localStorage.removeItem('tms_refresh_token');
        // Tear down the central session too, otherwise the next visit to
        // any brand site will silently sign the user back in.
        if (options.clearSso !== false) {
            sdk.clearSso({ returnTo: options.returnTo || window.location.origin });
        }
    };

    const value = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
