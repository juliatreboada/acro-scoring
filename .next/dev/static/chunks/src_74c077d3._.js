(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://lhvqstibxmuvphiixqof.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_qZDJfqtH_JwfQ0PEMVlPzA_K1TN6bnX"));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/ProfileContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileProvider",
    ()=>ProfileProvider,
    "ROLE_HOME",
    ()=>ROLE_HOME,
    "useProfile",
    ()=>useProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
// ─── constants ────────────────────────────────────────────────────────────────
const ROLE_PRIORITY = {
    super_admin: 4,
    admin: 3,
    club: 2,
    judge: 1
};
const ROLE_HOME = {
    super_admin: '/admin',
    admin: '/admin',
    club: '/club',
    judge: '/judge'
};
function storageKey(authId) {
    return `active_profile_${authId}`;
}
// ─── context ──────────────────────────────────────────────────────────────────
const ProfileContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    profileLoading: true,
    activeProfile: null,
    allProfiles: [],
    switchProfile: ()=>{}
});
function ProfileProvider({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const [profileLoading, setProfileLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [authId, setAuthId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [allProfiles, setAllProfiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeProfileId, setActiveProfileId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileProvider.useEffect": ()=>{
            async function load(userId, userEmail) {
                const { data: rows } = await supabase.from('profiles').select('id, role, club_id').eq('auth_id', userId);
                if (!rows?.length) {
                    setProfileLoading(false);
                    return;
                }
                // Load display name for each profile in parallel
                const entries = await Promise.all(rows.map({
                    "ProfileProvider.useEffect.load": async (p)=>{
                        const role = p.role;
                        const club_id = p.club_id ?? null;
                        let name = userEmail?.split('@')[0] ?? '—';
                        let avatar_url = null;
                        if (role === 'judge') {
                            const { data } = await supabase.from('judges').select('full_name, avatar_url').eq('id', p.id).single();
                            if (data) {
                                name = data.full_name;
                                avatar_url = data.avatar_url ?? null;
                            }
                        } else if (role === 'club' && club_id) {
                            const { data } = await supabase.from('clubs').select('club_name, avatar_url').eq('id', club_id).single();
                            if (data) {
                                name = data.club_name;
                                avatar_url = data.avatar_url ?? null;
                            }
                        } else if (role === 'admin' || role === 'super_admin') {
                            const { data } = await supabase.from('admins').select('full_name, avatar_url').eq('id', p.id).single();
                            if (data) {
                                name = data.full_name;
                                avatar_url = data.avatar_url ?? null;
                            }
                        }
                        return {
                            id: p.id,
                            role,
                            name,
                            club_id,
                            avatar_url
                        };
                    }
                }["ProfileProvider.useEffect.load"]));
                setAllProfiles(entries);
                // Restore from localStorage, fall back to highest-priority role
                const stored = localStorage.getItem(storageKey(userId));
                const validId = stored && entries.find({
                    "ProfileProvider.useEffect.load": (e)=>e.id === stored
                }["ProfileProvider.useEffect.load"]) ? stored : null;
                const defaultId = [
                    ...entries
                ].sort({
                    "ProfileProvider.useEffect.load": (a, b)=>ROLE_PRIORITY[b.role] - ROLE_PRIORITY[a.role]
                }["ProfileProvider.useEffect.load"])[0]?.id ?? null;
                setActiveProfileId(validId ?? defaultId);
                setProfileLoading(false);
            }
            // Subscribe to auth changes so sign-out / sign-in reload profiles correctly
            const { data: { subscription } } = supabase.auth.onAuthStateChange({
                "ProfileProvider.useEffect": (_event, session)=>{
                    if (session?.user) {
                        setAuthId(session.user.id);
                        setProfileLoading(true);
                        load(session.user.id, session.user.email);
                    } else {
                        // Signed out — clear everything
                        setAuthId(null);
                        setAllProfiles([]);
                        setActiveProfileId(null);
                        setProfileLoading(false);
                    }
                }
            }["ProfileProvider.useEffect"]);
            return ({
                "ProfileProvider.useEffect": ()=>{
                    subscription.unsubscribe();
                }
            })["ProfileProvider.useEffect"];
        }
    }["ProfileProvider.useEffect"], []); // eslint-disable-line react-hooks/exhaustive-deps
    const switchProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[switchProfile]": (id)=>{
            const profile = allProfiles.find({
                "ProfileProvider.useCallback[switchProfile].profile": (p)=>p.id === id
            }["ProfileProvider.useCallback[switchProfile].profile"]);
            if (!profile || !authId) return;
            localStorage.setItem(storageKey(authId), id);
            setActiveProfileId(id);
            router.push(ROLE_HOME[profile.role]);
        }
    }["ProfileProvider.useCallback[switchProfile]"], [
        allProfiles,
        authId,
        router
    ]);
    const activeProfile = allProfiles.find((p)=>p.id === activeProfileId) ?? null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfileContext.Provider, {
        value: {
            profileLoading,
            activeProfile,
            allProfiles,
            switchProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/ProfileContext.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
_s(ProfileProvider, "sNeZuuZHIw9eig2BkJGgVsqGdQQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProfileProvider;
function useProfile() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ProfileContext);
}
_s1(useProfile, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "ProfileProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-client] (ecmascript)");
'use client';
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProfileProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/providers.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_74c077d3._.js.map