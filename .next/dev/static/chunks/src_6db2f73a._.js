(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/admin/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── admin domain types ───────────────────────────────────────────────────────
__turbopack_context__.s([
    "CATEGORY_LABELS",
    ()=>CATEGORY_LABELS,
    "CATEGORY_SIZE",
    ()=>CATEGORY_SIZE,
    "NEXT_STATUS",
    ()=>NEXT_STATUS,
    "ROLE_CONFIG",
    ()=>ROLE_CONFIG,
    "ROUTINE_TYPES",
    ()=>ROUTINE_TYPES,
    "categoriesForRuleset",
    ()=>categoriesForRuleset,
    "categoryLabel",
    ()=>categoryLabel,
    "defaultSlots",
    ()=>defaultSlots,
    "sortByAgeGroupAndCategory",
    ()=>sortByAgeGroupAndCategory
]);
const CATEGORY_SIZE = {
    "Women's Pair": 2,
    "Men's Pair": 2,
    "Mixed Pair": 2,
    "Women's Group": 3,
    "Mixed Group": 4,
    'Pairs': 2,
    'Groups 3': 3,
    'Groups 4': 4
};
const ROLE_CONFIG = {
    CJP: {
        min: 1,
        max: 1
    },
    EJ: {
        min: 2,
        max: 5
    },
    AJ: {
        min: 2,
        max: 5
    },
    DJ: {
        min: 1,
        max: 2
    }
};
function defaultSlots(sectionId, panelId) {
    const slots = [];
    for (const [role, cfg] of Object.entries(ROLE_CONFIG)){
        for(let n = 1; n <= cfg.min; n++){
            slots.push({
                section_id: sectionId,
                panel_id: panelId,
                judge_id: null,
                role,
                role_number: n
            });
        }
    }
    return slots;
}
function categoriesForRuleset(ageGroup) {
    const r = ageGroup.toLowerCase();
    if (r.includes('escolar') || r.includes('base')) return [
        'Pairs',
        'Groups 3',
        'Groups 4'
    ];
    return [
        "Women's Pair",
        "Men's Pair",
        "Mixed Pair",
        "Women's Group",
        "Mixed Group"
    ];
}
const CATEGORY_LABELS = {
    en: {
        "Women's Pair": "Women's Pair",
        "Men's Pair": "Men's Pair",
        "Mixed Pair": "Mixed Pair",
        "Women's Group": "Women's Group",
        "Mixed Group": "Mixed Group",
        'Pairs': 'Pairs',
        'Groups 3': 'Groups 3',
        'Groups 4': 'Groups 4'
    },
    es: {
        "Women's Pair": 'Pareja Femenina',
        "Men's Pair": 'Pareja Masculina',
        "Mixed Pair": 'Pareja Mixta',
        "Women's Group": 'Grupo Femenino',
        "Mixed Group": 'Grupo Mixto',
        'Pairs': 'Parejas',
        'Groups 3': 'Tríos',
        'Groups 4': 'Cuartetos'
    }
};
function categoryLabel(category, lang) {
    return CATEGORY_LABELS[lang]?.[category] ?? category;
}
// ─── registration sort helpers ────────────────────────────────────────────────
// Category type order: pairs=0, groups3=1, groups4=2
const CATEGORY_TYPE_ORDER = {
    "Women's Pair": 0,
    "Mixed Pair": 0,
    "Men's Pair": 0,
    'Pairs': 0,
    "Women's Group": 1,
    'Groups 3': 1,
    "Mixed Group": 2,
    'Groups 4': 2
};
// Within pairs: Women's=0, Mixed=1, Men's=2
const PAIR_ORDER = {
    "Women's Pair": 0,
    'Pairs': 0,
    "Mixed Pair": 1,
    "Men's Pair": 2
};
function sortByAgeGroupAndCategory(items, rules) {
    return [
        ...items
    ].sort((a, b)=>{
        const ruleA = rules.find((r)=>r.id === a.age_group);
        const ruleB = rules.find((r)=>r.id === b.age_group);
        const sortDiff = (ruleB?.sort_order ?? 0) - (ruleA?.sort_order ?? 0);
        if (sortDiff !== 0) return sortDiff;
        const typeDiff = (CATEGORY_TYPE_ORDER[a.category] ?? 99) - (CATEGORY_TYPE_ORDER[b.category] ?? 99);
        if (typeDiff !== 0) return typeDiff;
        return (PAIR_ORDER[a.category] ?? 99) - (PAIR_ORDER[b.category] ?? 99);
    });
}
const ROUTINE_TYPES = [
    'Balance',
    'Dynamic',
    'Combined'
];
const NEXT_STATUS = {
    draft: 'registration_open',
    registration_open: 'registration_closed',
    registration_closed: 'active',
    active: 'finished'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/StructureTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StructureTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        sections: 'Sections',
        addSection: 'Add section',
        sectionLabel: 'Label',
        sectionLabelPlaceholder: 'e.g. Morning, Afternoon…',
        startingTime: 'Start time',
        waitingSec: 'Wait (s)',
        warmupMin: 'Warmup (min)',
        deleteSection: 'Delete section',
        noSections: 'No sections yet',
        noSectionsSub: 'Add a section to start building the schedule.',
        addSession: 'Add session',
        noSessions: 'No sessions in this section yet.',
        panelLabel: 'Panel',
        ageGroup: 'Age group',
        category: 'Category',
        routineType: 'Routine type',
        save: 'Add',
        cancel: 'Cancel',
        deleteSession: 'Remove',
        sessionName: (ag, cat, rt)=>`${ag} · ${cat} · ${rt}`,
        sectionN: (n)=>`Section ${n}`,
        panelBadge: (n)=>`P${n}`,
        panelN: (n)=>`Panel ${n}`
    },
    es: {
        sections: 'Jornadas',
        addSection: 'Añadir jornada',
        sectionLabel: 'Etiqueta',
        sectionLabelPlaceholder: 'p.ej. Mañana, Tarde…',
        startingTime: 'Hora inicio',
        waitingSec: 'Espera (s)',
        warmupMin: 'Calent. (min)',
        deleteSection: 'Eliminar jornada',
        noSections: 'Sin jornadas',
        noSectionsSub: 'Añade una joranada para empezar a construir el programa.',
        addSession: 'Añadir sesión',
        noSessions: 'Sin sesiones en esta jornada.',
        panelLabel: 'Panel',
        ageGroup: 'Grupo de edad',
        category: 'Categoría',
        routineType: 'Tipo de rutina',
        save: 'Añadir',
        cancel: 'Cancelar',
        deleteSession: 'Eliminar',
        sessionName: (ag, cat, rt)=>`${ag} · ${cat} · ${rt}`,
        sectionN: (n)=>`Jornada ${n}`,
        panelBadge: (n)=>`P${n}`,
        panelN: (n)=>`Panel ${n}`
    }
};
// ─── panel colours ────────────────────────────────────────────────────────────
const PANEL_STYLES = {
    1: {
        badge: 'bg-blue-100 text-blue-700',
        border: 'border-l-blue-400'
    },
    2: {
        badge: 'bg-violet-100 text-violet-700',
        border: 'border-l-violet-400'
    }
};
function AddSessionForm({ lang, panel, ageGroups, agLabels, ageGroupRules, sectionId, nextOrderIndex, onAdd, onCancel }) {
    _s();
    const t = T[lang];
    const [ageGroup, setAgeGroupState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [routineType, setRoutineType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const selectedRule = ageGroupRules.find((r)=>r.id === ageGroup);
    const availableCategories = ageGroup ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriesForRuleset"])(selectedRule?.age_group ?? '') : [];
    const availableRoutineTypes = (()=>{
        const count = selectedRule?.routine_count ?? 3;
        if (count === 1) return [
            'Combined'
        ];
        if (count === 2) return [
            'Balance',
            'Dynamic'
        ];
        return [
            'Balance',
            'Dynamic',
            'Combined'
        ];
    })();
    function handleAgeGroupChange(ag) {
        setAgeGroupState(ag);
        setCategory('');
        setRoutineType('');
    }
    function handleCategoryChange(cat) {
        setCategory(cat);
        setRoutineType('');
    }
    function handleAdd() {
        if (!ageGroup || !category || !routineType) return;
        onAdd({
            competition_id: panel.competition_id,
            panel_id: panel.id,
            section_id: sectionId,
            name: t.sessionName(agLabels[ageGroup] ?? ageGroup, category, routineType),
            age_group: ageGroup,
            category,
            routine_type: routineType,
            status: 'waiting',
            order_index: nextOrderIndex,
            dj_method: null,
            ej_method: null
        });
    }
    const selectCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: t.ageGroup
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: ageGroup,
                                onChange: (e)=>handleAgeGroupChange(e.target.value),
                                className: selectCls,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this),
                                    ageGroups.map((ag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: ag,
                                            children: agLabels[ag] ?? ag
                                        }, ag, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                            lineNumber: 141,
                                            columnNumber: 36
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    ageGroup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: t.category
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 146,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: category,
                                onChange: (e)=>handleCategoryChange(e.target.value),
                                className: selectCls,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                        lineNumber: 148,
                                        columnNumber: 15
                                    }, this),
                                    availableCategories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c,
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.[c] ?? c
                                        }, c, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                            lineNumber: 150,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this),
                    ageGroup && category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-medium text-slate-500",
                                children: t.routineType
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: routineType,
                                onChange: (e)=>setRoutineType(e.target.value),
                                className: selectCls,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this),
                                    availableRoutineTypes.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: r,
                                            children: r
                                        }, r, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                            lineNumber: 160,
                                            columnNumber: 49
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onCancel,
                        className: "flex-1 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAdd,
                        disabled: !ageGroup || !category || !routineType,
                        className: "flex-1 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all",
                        children: t.save
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
_s(AddSessionForm, "2nS/drYIF4ezYMaCFXwg7zDIqOA=");
_c = AddSessionForm;
// ─── session row ──────────────────────────────────────────────────────────────
function SessionRow({ session, borderStyle, onDelete, lang }) {
    const t = T[lang];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            'flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl border-l-4',
            borderStyle
        ].join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-medium text-slate-700 leading-snug",
                    children: session.name
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDelete,
                className: "shrink-0 text-xs text-slate-300 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all",
                children: t.deleteSession
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, this);
}
_c1 = SessionRow;
// ─── panel column ─────────────────────────────────────────────────────────────
function PanelColumn({ lang, panel, sessions, ageGroups, agLabels, ageGroupRules, sectionId, onAddSession, onDeleteSession }) {
    _s1();
    const t = T[lang];
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const styles = PANEL_STYLES[panel.panel_number];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    styles.badge
                ].join(' '),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-bold",
                    children: t.panelN(panel.panel_number)
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 221,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            sessions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionRow, {
                    session: s,
                    borderStyle: styles.border,
                    onDelete: ()=>onDeleteSession(s.id),
                    lang: lang
                }, s.id, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 226,
                    columnNumber: 9
                }, this)),
            showForm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AddSessionForm, {
                lang: lang,
                panel: panel,
                ageGroups: ageGroups,
                agLabels: agLabels,
                ageGroupRules: ageGroupRules,
                sectionId: sectionId,
                nextOrderIndex: sessions.length + 1,
                onAdd: (s)=>{
                    onAddSession(s);
                    setShowForm(false);
                },
                onCancel: ()=>setShowForm(false)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 237,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setShowForm(true),
                className: "flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 transition-all",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-3.5 h-3.5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M12 4.5v15m7.5-7.5h-15"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 252,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 251,
                        columnNumber: 11
                    }, this),
                    t.addSession
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 249,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
        lineNumber: 218,
        columnNumber: 5
    }, this);
}
_s1(PanelColumn, "kaMG6XwWu8g4QBLwMinxod9pp4Q=");
_c2 = PanelColumn;
function SectionBlock({ lang, section, sessions, panels, ageGroups, agLabels, ageGroupRules, onUpdateLabel, onUpdateTimes, onDelete, onAddSession, onDeleteSession }) {
    _s2();
    const t = T[lang];
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [label, setLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(section.label ?? '');
    const [startingTime, setStartingTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(section.starting_time?.slice(0, 5) ?? '');
    const [waitingSec, setWaitingSec] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(section.waiting_time_seconds?.toString() ?? '');
    const [warmupMin, setWarmupMin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(section.warmup_duration_minutes?.toString() ?? '');
    const twoPanel = panels.length === 2;
    function saveTimes() {
        onUpdateTimes({
            starting_time: startingTime || null,
            waiting_time_seconds: waitingSec !== '' ? parseInt(waitingSec, 10) : null,
            warmup_duration_minutes: warmupMin !== '' ? parseInt(warmupMin, 10) : null
        });
    }
    const inputCls = 'w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-slate-200 rounded-2xl overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wide",
                        children: t.sectionN(section.section_number)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 310,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: label,
                        onChange: (e)=>setLabel(e.target.value),
                        onBlur: ()=>onUpdateLabel(label.trim()),
                        placeholder: t.sectionLabelPlaceholder,
                        className: "flex-1 text-sm font-medium text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onDelete,
                        className: "shrink-0 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all",
                        children: t.deleteSection
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-end gap-3 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 w-28",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-semibold text-slate-400 uppercase tracking-wide",
                                children: t.startingTime
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 330,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "time",
                                value: startingTime,
                                onChange: (e)=>setStartingTime(e.target.value),
                                onBlur: saveTimes,
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 331,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 w-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-semibold text-slate-400 uppercase tracking-wide",
                                children: t.waitingSec
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 338,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                value: waitingSec,
                                onChange: (e)=>setWaitingSec(e.target.value),
                                onBlur: saveTimes,
                                placeholder: "0",
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 339,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 w-24",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[10px] font-semibold text-slate-400 uppercase tracking-wide",
                                children: t.warmupMin
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                value: warmupMin,
                                onChange: (e)=>setWarmupMin(e.target.value),
                                onBlur: saveTimes,
                                placeholder: "0",
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 348,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 346,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 328,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: twoPanel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: panels.sort((a, b)=>a.panel_number - b.panel_number).map((panel)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PanelColumn, {
                            lang: lang,
                            panel: panel,
                            sessions: sessions.filter((s)=>s.panel_id === panel.id),
                            ageGroups: ageGroups,
                            agLabels: agLabels,
                            ageGroupRules: ageGroupRules,
                            sectionId: section.id,
                            onAddSession: onAddSession,
                            onDeleteSession: onDeleteSession
                        }, panel.id, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 362,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 360,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        sessions.length === 0 && !showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400 text-center py-2",
                            children: t.noSessions
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 379,
                            columnNumber: 15
                        }, this),
                        sessions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionRow, {
                                session: s,
                                borderStyle: PANEL_STYLES[1].border,
                                onDelete: ()=>onDeleteSession(s.id),
                                lang: lang
                            }, s.id, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 382,
                                columnNumber: 15
                            }, this)),
                        showForm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AddSessionForm, {
                            lang: lang,
                            panel: panels[0],
                            ageGroups: ageGroups,
                            agLabels: agLabels,
                            ageGroupRules: ageGroupRules,
                            sectionId: section.id,
                            nextOrderIndex: sessions.length + 1,
                            onAdd: (s)=>{
                                onAddSession(s);
                                setShowForm(false);
                            },
                            onCancel: ()=>setShowForm(false)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 391,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowForm(true),
                            className: "w-full flex items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 transition-all",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-4 h-4",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M12 4.5v15m7.5-7.5h-15"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                        lineNumber: 406,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                    lineNumber: 405,
                                    columnNumber: 17
                                }, this),
                                t.addSession
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 403,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 377,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 358,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
        lineNumber: 307,
        columnNumber: 5
    }, this);
}
_s2(SectionBlock, "jGuLPGLZJRgde4UaolbkEy0oWOs=");
_c3 = SectionBlock;
function StructureTab({ lang, competitionId, ageGroups, agLabels, ageGroupRules, panels, sections, sessions, onAddSection, onUpdateSectionLabel, onUpdateSectionTimes, onDeleteSection, onAddSession, onDeleteSession }) {
    _s3();
    const t = T[lang];
    const sorted = [
        ...sections
    ].sort((a, b)=>a.section_number - b.section_number);
    const [activeSectionId, setActiveSectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(sorted[0]?.id ?? '');
    // auto-select the newest section when one is added
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StructureTab.useEffect": ()=>{
            if (sorted.length === 0) {
                setActiveSectionId('');
                return;
            }
            if (!sorted.find({
                "StructureTab.useEffect": (s)=>s.id === activeSectionId
            }["StructureTab.useEffect"])) {
                setActiveSectionId(sorted[sorted.length - 1].id);
            }
        }
    }["StructureTab.useEffect"], [
        sections
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    const activeSection = sorted.find((s)=>s.id === activeSectionId) ?? sorted[0];
    function handleDelete(sec) {
        const idx = sorted.findIndex((s)=>s.id === sec.id);
        const next = sorted[idx + 1] ?? sorted[idx - 1];
        onDeleteSection(sec.id);
        if (next) setActiveSectionId(next.id);
    }
    if (sections.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-medium text-slate-500",
                    children: t.noSections
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 466,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-400 mt-1 mb-4",
                    children: t.noSectionsSub
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 467,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onAddSection,
                    className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M12 4.5v15m7.5-7.5h-15"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 471,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 470,
                            columnNumber: 11
                        }, this),
                        t.addSection
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                    lineNumber: 468,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
            lineNumber: 465,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center border-b border-slate-200 mb-6 gap-0",
                children: [
                    sorted.map((sec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveSectionId(sec.id),
                            className: [
                                'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                                activeSectionId === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                            ].join(' '),
                            children: sec.label ?? t.sectionN(sec.section_number)
                        }, sec.id, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 484,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAddSection,
                        className: "px-3 py-2.5 text-slate-400 hover:text-blue-600 border-b-2 border-transparent transition-all",
                        title: t.addSection,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2.5,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M12 4.5v15m7.5-7.5h-15"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                                lineNumber: 504,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                            lineNumber: 503,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                        lineNumber: 498,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 482,
                columnNumber: 7
            }, this),
            activeSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionBlock, {
                lang: lang,
                section: activeSection,
                sessions: sessions.filter((s)=>s.section_id === activeSection.id).sort((a, b)=>a.order_index - b.order_index),
                panels: panels,
                ageGroups: ageGroups,
                agLabels: agLabels,
                ageGroupRules: ageGroupRules,
                onUpdateLabel: (label)=>onUpdateSectionLabel(activeSection.id, label),
                onUpdateTimes: (times)=>onUpdateSectionTimes(activeSection.id, times),
                onDelete: ()=>handleDelete(activeSection),
                onAddSession: onAddSession,
                onDeleteSession: onDeleteSession
            }, activeSection.id, false, {
                fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
                lineNumber: 511,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StructureTab.tsx",
        lineNumber: 480,
        columnNumber: 5
    }, this);
}
_s3(StructureTab, "0vQzjQBcC28G4F3oPHVU7wGz7nE=");
_c4 = StructureTab;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "AddSessionForm");
__turbopack_context__.k.register(_c1, "SessionRow");
__turbopack_context__.k.register(_c2, "PanelColumn");
__turbopack_context__.k.register(_c3, "SectionBlock");
__turbopack_context__.k.register(_c4, "StructureTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/shared/ClickableImg.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClickableImg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ClickableImg({ src, alt, className }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                alt: alt ?? '',
                className: [
                    className,
                    'cursor-zoom-in'
                ].filter(Boolean).join(' '),
                onClick: (e)=>{
                    e.stopPropagation();
                    setOpen(true);
                }
            }, void 0, false, {
                fileName: "[project]/src/components/shared/ClickableImg.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 cursor-zoom-out",
                onClick: ()=>setOpen(false),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: src,
                        alt: alt ?? '',
                        className: "max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl",
                        onClick: (e)=>e.stopPropagation()
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/ClickableImg.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setOpen(false),
                        className: "absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M6 18L18 6M6 6l12 12"
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/ClickableImg.tsx",
                                lineNumber: 39,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/shared/ClickableImg.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/ClickableImg.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/shared/ClickableImg.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true);
}
_s(ClickableImg, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c = ClickableImg;
var _c;
__turbopack_context__.k.register(_c, "ClickableImg");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/JudgesTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JudgesTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/ClickableImg.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        pool: 'Competition judges',
        poolHint: 'Add judges from the global pool who will attend this competition.',
        addJudge: 'Add judge',
        newJudge: 'Invite judge',
        noPool: 'No judges added yet.',
        removeFromPool: 'Remove',
        assignments: 'Role assignments',
        assignmentsHint: 'Assign judges to each role per section and panel. Assignments can differ between sections.',
        unassigned: 'Unassigned',
        selectJudge: 'Select judge…',
        sectionN: (n)=>`Section ${n}`,
        panelN: (n)=>`Panel ${n}`,
        noSections: 'No sections defined yet. Go to Structure to add sections.',
        warningRemove: 'This judge is assigned to one or more roles. Remove anyway?',
        fieldName: 'Full name',
        fieldEmail: 'Email',
        fieldPhone: 'Phone (optional)',
        fieldLicence: 'Licence',
        cancel: 'Cancel',
        create: 'Send invite',
        inviteSent: (email)=>`Invite sent to ${email}`,
        inviteError: 'Failed to send invite',
        lock: 'Lock assignments',
        unlock: 'Unlock'
    },
    es: {
        pool: 'Jueces de la competición',
        poolHint: 'Añade jueces del pool global que asistirán a esta competición.',
        addJudge: 'Añadir juez',
        newJudge: 'Invitar juez',
        noPool: 'Sin jueces añadidos.',
        removeFromPool: 'Quitar',
        assignments: 'Asignación de roles',
        assignmentsHint: 'Asigna jueces a cada rol por jornada y panel. Las asignaciones pueden cambiar entre jornadas.',
        unassigned: 'Sin asignar',
        selectJudge: 'Seleccionar juez…',
        sectionN: (n)=>`Jornada ${n}`,
        panelN: (n)=>`Panel ${n}`,
        noSections: 'Sin jornadas definidas. Ve a Estructura para añadir jornadas.',
        warningRemove: 'Este juez tiene roles asignados. ¿Quitar igualmente?',
        fieldName: 'Nombre completo',
        fieldEmail: 'Email',
        fieldPhone: 'Teléfono (opcional)',
        fieldLicence: 'Licencia',
        cancel: 'Cancelar',
        create: 'Enviar invitación',
        inviteSent: (email)=>`Invitación enviada a ${email}`,
        inviteError: 'Error al enviar la invitación',
        lock: 'Bloquear asignación',
        unlock: 'Desbloquear'
    }
};
const ROLE_ORDER = [
    'CJP',
    'DJ',
    'EJ',
    'AJ'
];
const PANEL_HEADER = {
    1: 'bg-blue-50 text-blue-700 border-blue-200',
    2: 'bg-violet-50 text-violet-700 border-violet-200'
};
// ─── avatar ───────────────────────────────────────────────────────────────────
function Avatar({ judge, size = 'md' }) {
    const initials = judge.full_name.split(' ').map((w)=>w[0]).join('').slice(0, 2).toUpperCase();
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';
    return judge.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        src: judge.avatar_url,
        alt: judge.full_name,
        className: [
            sz,
            'rounded-full object-cover'
        ].join(' ')
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            sz,
            'rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0'
        ].join(' '),
        children: initials
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
_c = Avatar;
// ─── judge pool ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
    full_name: '',
    email: '',
    phone: '',
    licence: ''
};
function JudgePool({ lang, judges, globalJudges, assignments, nominations, clubs, onAdd, onRemove, onCreateJudge }) {
    _s();
    const t = T[lang];
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPicker, setShowPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCreateForm, setShowCreateForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_FORM);
    const [inviteState, setInviteState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const poolIds = new Set(judges.map((j)=>j.id));
    const available = globalJudges.filter((j)=>!poolIds.has(j.id));
    const clubById = Object.fromEntries(clubs.map((c)=>[
            c.id,
            c
        ]));
    function handleRemove(judgeId) {
        const isAssigned = assignments.some((a)=>a.judge_id === judgeId);
        if (isAssigned && !confirm(t.warningRemove)) return;
        onRemove(judgeId);
    }
    async function handleCreate(e) {
        e.preventDefault();
        if (!form.full_name.trim() || !form.email.trim()) return;
        const email = form.email.trim();
        try {
            await onCreateJudge?.({
                full_name: form.full_name.trim(),
                email,
                phone: form.phone.trim() || null,
                licence: form.licence.trim() || null
            });
            setForm(EMPTY_FORM);
            setInviteState({
                ok: true,
                email
            });
            setShowCreateForm(false);
        } catch  {
            setInviteState({
                ok: false,
                email
            });
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setCollapsed((v)=>!v),
                        className: "flex items-center gap-2 flex-1 min-w-0 text-left group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: [
                                    'w-4 h-4 text-slate-400 shrink-0 transition-transform',
                                    collapsed ? '-rotate-90' : ''
                                ].join(' '),
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M19 9l-7 7-7-7"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors",
                                        children: [
                                            t.pool,
                                            judges.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-2 text-xs font-medium text-slate-400",
                                                children: [
                                                    "(",
                                                    judges.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                lineNumber: 148,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    collapsed && judges.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 mt-0.5",
                                        children: [
                                            judges.slice(0, 5).map((j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                                    judge: j,
                                                    size: "sm"
                                                }, j.id, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 46
                                                }, this)),
                                            judges.length > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-slate-400",
                                                children: [
                                                    "+",
                                                    judges.length - 5
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                lineNumber: 154,
                                                columnNumber: 39
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 152,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0",
                        children: [
                            onCreateJudge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setShowCreateForm((v)=>!v);
                                    setShowPicker(false);
                                },
                                className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                            lineNumber: 165,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 164,
                                        columnNumber: 17
                                    }, this),
                                    t.newJudge
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 162,
                                columnNumber: 15
                            }, this),
                            available.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setShowPicker((v)=>!v);
                                            setShowCreateForm(false);
                                        },
                                        className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M12 4.5v15m7.5-7.5h-15"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                lineNumber: 174,
                                                columnNumber: 19
                                            }, this),
                                            t.addJudge
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 172,
                                        columnNumber: 17
                                    }, this),
                                    showPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden",
                                        children: available.map((j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    onAdd(j.id);
                                                    setShowPicker(false);
                                                },
                                                className: "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                                        judge: j,
                                                        size: "sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                        lineNumber: 184,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium text-slate-700 truncate",
                                                                children: j.full_name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                                lineNumber: 186,
                                                                columnNumber: 27
                                                            }, this),
                                                            j.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-slate-400 truncate",
                                                                children: j.email
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                                lineNumber: 187,
                                                                columnNumber: 39
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                        lineNumber: 185,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, j.id, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                                lineNumber: 182,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 180,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 171,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            !collapsed && showCreateForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleCreate,
                className: "mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-600 mb-1",
                                        children: [
                                            t.fieldName,
                                            " *"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        required: true,
                                        value: form.full_name,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    full_name: e.target.value
                                                })),
                                        className: "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 204,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-600 mb-1",
                                        children: [
                                            t.fieldEmail,
                                            " *"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        required: true,
                                        value: form.email,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    email: e.target.value
                                                })),
                                        className: "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 212,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-600 mb-1",
                                        children: [
                                            t.fieldLicence,
                                            " *"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        required: true,
                                        value: form.licence,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    licence: e.target.value
                                                })),
                                        className: "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 218,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-600 mb-1",
                                        children: t.fieldPhone
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: form.phone,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    phone: e.target.value
                                                })),
                                        className: "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 201,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-2 pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setShowCreateForm(false);
                                    setForm(EMPTY_FORM);
                                },
                                className: "px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all",
                                children: t.cancel
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all",
                                children: t.create
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 235,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 200,
                columnNumber: 9
            }, this),
            !collapsed && inviteState && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'mb-3 px-4 py-2.5 rounded-xl text-sm',
                    inviteState.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                ].join(' '),
                children: inviteState.ok ? t.inviteSent(inviteState.email) : t.inviteError
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 249,
                columnNumber: 9
            }, this),
            !collapsed && (judges.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl",
                children: t.noPool
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 255,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: judges.map((j)=>{
                    const nom = nominations.find((n)=>n.judge_id === j.id);
                    const nominatingClub = nom?.club_id ? clubById[nom.club_id] : null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-200 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                judge: j,
                                size: "sm"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 265,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-slate-700 leading-tight",
                                        children: j.full_name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 267,
                                        columnNumber: 19
                                    }, this),
                                    nominatingClub && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 leading-tight",
                                        children: nominatingClub.club_name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 269,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 266,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleRemove(j.id),
                                className: "text-slate-300 hover:text-red-500 transition-colors ml-1 shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-3.5 h-3.5",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor",
                                    strokeWidth: 2.5,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M6 18L18 6M6 6l12 12"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 275,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 274,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 272,
                                columnNumber: 17
                            }, this)
                        ]
                    }, j.id, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 264,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 259,
                columnNumber: 9
            }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
_s(JudgePool, "yuMjkFzc1tmQS1Adu3OCORtO3Dc=");
_c1 = JudgePool;
// ─── slot cell ────────────────────────────────────────────────────────────────
function SlotCell({ label, slot, poolJudges, locked, selectPlaceholder, onAssign }) {
    const assigned = poolJudges.find((j)=>j.id === slot.judge_id);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-bold text-slate-400",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 300,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: [
                    assigned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                        judge: assigned,
                        size: "sm"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 303,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-7 h-7 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 304,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: slot.judge_id ?? '',
                        disabled: locked,
                        onChange: (e)=>onAssign(slot.id, e.target.value || null),
                        className: "min-w-0 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: selectPlaceholder
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 312,
                                columnNumber: 11
                            }, this),
                            poolJudges.map((j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: j.id,
                                    children: j.full_name
                                }, j.id, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 314,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 306,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 299,
        columnNumber: 5
    }, this);
}
_c2 = SlotCell;
// ─── panel assignment column ──────────────────────────────────────────────────
function PanelAssignmentColumn({ lang, panel, section, slots, poolJudges, locked, onToggleLock, onAssign, onAddSlot, onRemoveSlot }) {
    const t = T[lang];
    const headerCls = PANEL_HEADER[panel.panel_number] ?? PANEL_HEADER[1];
    const byRole = (role)=>slots.filter((s)=>s.role === role).sort((a, b)=>a.role_number - b.role_number);
    const cjpSlots = byRole('CJP');
    const djSlots = byRole('DJ');
    const ejSlots = byRole('EJ');
    const ajSlots = byRole('AJ');
    // Columns: col 0 = CJP/DJ, cols 1..n = EJ/AJ pairs
    const ejCount = ejSlots.length;
    const totalCols = 1 + ejCount;
    const canAddEjAj = ejSlots.length < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"]['EJ'].max;
    const canRemoveEjAj = ejSlots.length > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"]['EJ'].min;
    const canAddDj = djSlots.length < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"]['DJ'].max;
    const canRemoveDj = djSlots.length > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"]['DJ'].min;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-slate-200 rounded-xl overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'px-4 py-2 text-xs font-bold border-b flex items-center gap-4',
                    headerCls
                ].join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "shrink-0",
                        children: t.panelN(panel.panel_number)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 359,
                        columnNumber: 9
                    }, this),
                    cjpSlots[0] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold opacity-70 shrink-0",
                                children: "CJP"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 363,
                                columnNumber: 13
                            }, this),
                            (()=>{
                                const assigned = poolJudges.find((j)=>j.id === cjpSlots[0].judge_id);
                                return assigned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                    judge: assigned,
                                    size: "sm"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 364,
                                    columnNumber: 111
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-7 h-7 rounded-full bg-white/50 border-2 border-dashed border-current opacity-40 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 364,
                                    columnNumber: 151
                                }, this);
                            })(),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: cjpSlots[0].judge_id ?? '',
                                disabled: locked,
                                onChange: (e)=>onAssign(cjpSlots[0].id, e.target.value || null),
                                className: [
                                    'min-w-0 w-full max-w-52 border rounded-lg px-2 py-1 text-xs bg-white/70 focus:outline-none focus:ring-2 focus:ring-current disabled:opacity-50 disabled:cursor-not-allowed',
                                    headerCls
                                ].join(' '),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t.selectJudge
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 371,
                                        columnNumber: 15
                                    }, this),
                                    poolJudges.map((j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: j.id,
                                            children: j.full_name
                                        }, j.id, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                            lineNumber: 372,
                                            columnNumber: 36
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 365,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 362,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onToggleLock,
                        className: [
                            'ml-auto shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                            locked ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white/60 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                        ].join(' '),
                        children: locked ? `🔒 ${t.unlock}` : `🔓 ${t.lock}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 376,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 358,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
                            gap: '0.75rem 1rem'
                        },
                        children: [
                            djSlots[0] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SlotCell, {
                                label: djSlots.length > 1 ? 'DJ1' : 'DJ',
                                slot: djSlots[0],
                                poolJudges: poolJudges,
                                locked: locked,
                                selectPlaceholder: t.selectJudge,
                                onAssign: onAssign
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 391,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 399,
                                columnNumber: 15
                            }, this),
                            ejSlots.map((slot)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SlotCell, {
                                    label: ejSlots.length > 1 ? `EJ${slot.role_number}` : 'EJ',
                                    slot: slot,
                                    poolJudges: poolJudges,
                                    locked: locked,
                                    selectPlaceholder: t.selectJudge,
                                    onAssign: onAssign
                                }, slot.id, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 401,
                                    columnNumber: 13
                                }, this)),
                            djSlots[1] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SlotCell, {
                                label: "DJ2",
                                slot: djSlots[1],
                                poolJudges: poolJudges,
                                locked: locked,
                                selectPlaceholder: t.selectJudge,
                                onAssign: onAssign
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 414,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 422,
                                columnNumber: 15
                            }, this),
                            ajSlots.map((slot)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SlotCell, {
                                    label: ajSlots.length > 1 ? `AJ${slot.role_number}` : 'AJ',
                                    slot: slot,
                                    poolJudges: poolJudges,
                                    locked: locked,
                                    selectPlaceholder: t.selectJudge,
                                    onAssign: onAssign
                                }, slot.id, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                    lineNumber: 424,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 386,
                        columnNumber: 9
                    }, this),
                    !locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 pt-2 border-t border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: "EJ / AJ"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 440,
                                        columnNumber: 15
                                    }, this),
                                    canRemoveEjAj && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onRemoveSlot('EJ');
                                            onRemoveSlot('AJ');
                                        },
                                        className: "w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold",
                                        children: "−"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 442,
                                        columnNumber: 17
                                    }, this),
                                    canAddEjAj && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            onAddSlot('EJ');
                                            onAddSlot('AJ');
                                        },
                                        className: "w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold",
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 448,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 439,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: "DJ"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 455,
                                        columnNumber: 15
                                    }, this),
                                    canRemoveDj && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onRemoveSlot('DJ'),
                                        className: "w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold",
                                        children: "−"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 457,
                                        columnNumber: 17
                                    }, this),
                                    canAddDj && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onAddSlot('DJ'),
                                        className: "w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold",
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 463,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 454,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 438,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 384,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 357,
        columnNumber: 5
    }, this);
}
_c3 = PanelAssignmentColumn;
// ─── section assignment block ─────────────────────────────────────────────────
function SectionAssignmentBlock({ lang, section, panels, slots, poolJudges, panelLocks, onToggleLock, onAssign, onAddSlot, onRemoveSlot }) {
    const t = T[lang];
    const label = section.label ? `${t.sectionN(section.section_number)} · ${section.label}` : t.sectionN(section.section_number);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-slate-600",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 495,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4",
                children: [
                    ...panels
                ].sort((a, b)=>a.panel_number - b.panel_number).map((panel)=>{
                    const locked = panelLocks.some((l)=>l.section_id === section.id && l.panel_id === panel.id && l.locked);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PanelAssignmentColumn, {
                        lang: lang,
                        panel: panel,
                        section: section,
                        slots: slots.filter((s)=>s.panel_id === panel.id),
                        poolJudges: poolJudges,
                        locked: locked,
                        onToggleLock: ()=>onToggleLock(section.id, panel.id),
                        onAssign: onAssign,
                        onAddSlot: (role)=>onAddSlot(section.id, panel.id, role),
                        onRemoveSlot: (role)=>onRemoveSlot(section.id, panel.id, role)
                    }, panel.id, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 500,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 496,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 494,
        columnNumber: 5
    }, this);
}
_c4 = SectionAssignmentBlock;
function JudgesTab({ lang, globalJudges, judgePool, nominations, clubs, assignments, sections, panels, panelLocks, onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot, onTogglePanelLock, onCreateJudge }) {
    _s1();
    const t = T[lang];
    const poolJudges = globalJudges.filter((j)=>judgePool.includes(j.id));
    const sortedSections = [
        ...sections
    ].sort((a, b)=>a.section_number - b.section_number);
    const [activeSectionId, setActiveSectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(sortedSections[0]?.id ?? '');
    const activeSection = sortedSections.find((s)=>s.id === activeSectionId) ?? sortedSections[0];
    function tabLabel(sec) {
        return sec.label ?? t.sectionN(sec.section_number);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(JudgePool, {
                lang: lang,
                judges: poolJudges,
                globalJudges: globalJudges,
                assignments: assignments,
                nominations: nominations,
                clubs: clubs,
                onAdd: onAddToPool,
                onRemove: onRemoveFromPool,
                onCreateJudge: onCreateJudge
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 561,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-slate-700 mb-1",
                        children: t.assignments
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 574,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mb-4",
                        children: t.assignmentsHint
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 575,
                        columnNumber: 9
                    }, this),
                    sortedSections.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-xl",
                        children: t.noSections
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                        lineNumber: 578,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex border-b border-slate-200 mb-6 gap-0",
                                children: sortedSections.map((sec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveSectionId(sec.id),
                                        className: [
                                            'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                                            activeSectionId === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                        ].join(' '),
                                        children: tabLabel(sec)
                                    }, sec.id, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                        lineNumber: 586,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 584,
                                columnNumber: 13
                            }, this),
                            activeSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionAssignmentBlock, {
                                lang: lang,
                                section: activeSection,
                                panels: panels,
                                slots: assignments.filter((a)=>a.section_id === activeSection.id),
                                poolJudges: poolJudges,
                                panelLocks: panelLocks,
                                onToggleLock: onTogglePanelLock,
                                onAssign: onAssignJudge,
                                onAddSlot: onAddSlot,
                                onRemoveSlot: onRemoveSlot
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                                lineNumber: 603,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
                lineNumber: 573,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/JudgesTab.tsx",
        lineNumber: 560,
        columnNumber: 5
    }, this);
}
_s1(JudgesTab, "9T3UaOFteNukOvmvTE2tnW6APsw=");
_c5 = JudgesTab;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "Avatar");
__turbopack_context__.k.register(_c1, "JudgePool");
__turbopack_context__.k.register(_c2, "SlotCell");
__turbopack_context__.k.register(_c3, "PanelAssignmentColumn");
__turbopack_context__.k.register(_c4, "SectionAssignmentBlock");
__turbopack_context__.k.register(_c5, "JudgesTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/ImportTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImportTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// ─── translations ──────────────────────────────────────────────────────────────
const T = {
    en: {
        title: 'Import registrations',
        step1: 'File & club',
        step2: 'Review',
        clubLabel: 'Club',
        clubPlaceholder: 'Search club…',
        newClub: 'New club (not in system)',
        clubName: 'Club name',
        contactName: 'Contact name',
        inviteEmail: 'Invite email',
        ruleset: 'Ruleset',
        fileLabel: 'File (.ods, .xlsx, .csv)',
        parse: 'Parse file',
        noFile: 'Select a file first',
        noClub: 'Select or create a club first',
        noRuleset: 'Select a ruleset',
        parseError: 'Could not read file. Make sure it is a valid .ods, .xlsx or .csv.',
        noTeams: 'No teams found in the file. Check the format (first column must be TOP/BASE).',
        reviewTitle: (n)=>`${n} team${n !== 1 ? 's' : ''} found — review and edit before confirming`,
        teamN: (n)=>`Team ${n}`,
        ageGroup: 'Age group',
        category: 'Category',
        coach: 'Coach',
        firstName: 'First name',
        lastName1: 'Surname 1',
        lastName2: 'Surname 2',
        dob: 'Date of birth',
        pairType: 'Pair type',
        womensPair: "Women's Pair",
        mensPair: "Men's Pair",
        mixedPair: "Mixed Pair",
        selectPair: '— select pair type —',
        ageGroupUnmatched: 'Age group not matched — select manually',
        ageGroupNotInCompetition: 'Age group not in this competition — team will not be registered',
        pairTypeRequired: 'Pair type required',
        dobInvalid: 'Invalid date of birth',
        missingName: 'Missing name fields',
        ageOutOfRange: (name, age, min, max)=>`${name}: age ${age} not valid for this group (${min}–${max ?? '∞'})`,
        confirm: 'Confirm import',
        confirming: 'Importing…',
        errorsRemain: 'Fix all errors before confirming',
        back: '← Back',
        done: 'Import complete',
        doneDesc: (teams, invite)=>`${teams} team${teams !== 1 ? 's' : ''} registered.${invite ? ' Invite email sent to the new club.' : ''}`,
        inviteError: 'Invite email failed',
        importAnother: 'Import another file',
        gymnast: (n)=>`Gymnast ${n}`
    },
    es: {
        title: 'Importar inscripciones',
        step1: 'Archivo y club',
        step2: 'Revisión',
        clubLabel: 'Club',
        clubPlaceholder: 'Buscar club…',
        newClub: 'Club nuevo (no registrado)',
        clubName: 'Nombre del club',
        contactName: 'Persona de contacto',
        inviteEmail: 'Email de invitación',
        ruleset: 'Tipo de competición',
        fileLabel: 'Archivo (.ods, .xlsx, .csv)',
        parse: 'Leer archivo',
        noFile: 'Selecciona un archivo primero',
        noClub: 'Selecciona o crea un club primero',
        noRuleset: 'Selecciona el tipo de competición',
        parseError: 'No se pudo leer el archivo. Comprueba que sea un .ods, .xlsx o .csv válido.',
        noTeams: 'No se encontraron equipos. Comprueba el formato (primera columna debe ser TOP/BASE).',
        reviewTitle: (n)=>`${n} equipo${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''} — revisa y edita antes de confirmar`,
        teamN: (n)=>`Equipo ${n}`,
        ageGroup: 'Grupo de edad',
        category: 'Categoría',
        coach: 'Entrenador/a',
        firstName: 'Nombre',
        lastName1: 'Primer apellido',
        lastName2: 'Segundo apellido',
        dob: 'Fecha de nacimiento',
        pairType: 'Tipo de pareja',
        womensPair: 'Pareja Femenina',
        mensPair: 'Pareja Masculina',
        mixedPair: 'Pareja Mixta',
        selectPair: '— seleccionar tipo —',
        ageGroupUnmatched: 'Grupo de edad no encontrado — seleccionar manualmente',
        ageGroupNotInCompetition: 'Grupo de edad no incluido en esta competición — el equipo no se inscribirá',
        pairTypeRequired: 'Debes seleccionar el tipo de pareja',
        dobInvalid: 'Fecha de nacimiento inválida',
        missingName: 'Faltan campos de nombre',
        ageOutOfRange: (name, age, min, max)=>`${name}: edad ${age} no válida para este grupo (${min}–${max ?? '∞'})`,
        confirm: 'Confirmar importación',
        confirming: 'Importando…',
        errorsRemain: 'Corrige todos los errores antes de confirmar',
        back: '← Volver',
        done: 'Importación completada',
        doneDesc: (teams, invite)=>`${teams} equipo${teams !== 1 ? 's' : ''} registrado${teams !== 1 ? 's' : ''}.${invite ? ' Email de invitación enviado al nuevo club.' : ''}`,
        inviteError: 'Fallo al enviar la invitación',
        importAnother: 'Importar otro archivo',
        gymnast: (n)=>`Gimnasta ${n}`
    }
};
// ─── helpers ──────────────────────────────────────────────────────────────────
function normalizeStr(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
// Filter age group rules by ruleset using the age_group name:
//   Base     → rules whose name contains "base"
//   Escolar  → rules whose name contains "escolar"
//   Nacional → rules whose name contains neither
function filterRulesByRuleset(rules, ruleset) {
    const key = normalizeStr(ruleset);
    if (key === 'nacional') {
        return rules.filter((r)=>{
            const ag = normalizeStr(r.age_group);
            return !ag.includes('base') && !ag.includes('escolar');
        });
    }
    return rules.filter((r)=>normalizeStr(r.age_group).includes(key));
}
function parseDob(raw) {
    const s = String(raw).trim();
    if (!s) return {
        iso: '',
        valid: false
    };
    // yyyy-MM-dd (ISO — from date input or already-formatted cell)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        if (!isNaN(new Date(s + 'T00:00:00').getTime())) return {
            iso: s,
            valid: true
        };
    }
    // dd/MM/yyyy, dd-MM-yyyy, dd/MM/yy, dd-MM-yy  (single or double digit day/month)
    const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (m) {
        let year = parseInt(m[3]);
        if (m[3].length === 2) year = year < 30 ? 2000 + year : 1900 + year;
        const iso = `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        if (!isNaN(new Date(iso + 'T00:00:00').getTime())) return {
            iso,
            valid: true
        };
    }
    // Excel / ODS date serial (integer or float like 43319.999...)
    const serial = parseFloat(s);
    if (!isNaN(serial) && serial > 1000 && !/[\/\-]/.test(s)) {
        try {
            const jsDate = new Date((Math.round(serial) - 25569) * 86400 * 1000);
            if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 1900) {
                return {
                    iso: jsDate.toISOString().slice(0, 10),
                    valid: true
                };
            }
        } catch  {}
    }
    return {
        iso: '',
        valid: false
    };
}
function deriveCategory(count, ruleset) {
    if (ruleset === 'Escolar' || ruleset === 'Base') {
        if (count === 2) return 'Pairs';
        if (count === 3) return 'Groups 3';
        if (count === 4) return 'Groups 4';
        return '';
    }
    // Nacional
    if (count === 2) return '' // needs pair type selector
    ;
    if (count === 3) return "Women's Group";
    if (count === 4) return "Mixed Group";
    return '';
}
function computeWarnings(team, ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear) {
    const t = T[lang];
    const w = [];
    if (!team.ageGroupId) {
        w.push(t.ageGroupUnmatched);
    } else if (!competitionAgeGroups.includes(team.ageGroupId)) {
        w.push(t.ageGroupNotInCompetition);
    } else {
        // Age validation against age group rule
        const rule = ageGroupRules.find((r)=>r.id === team.ageGroupId);
        if (rule) {
            for (const g of team.gymnasts){
                if (!g.dob_valid) continue;
                const birthYear = new Date(g.date_of_birth + 'T00:00:00').getFullYear();
                const age = competitionYear - birthYear;
                const name = [
                    g.first_name,
                    g.last_name_1
                ].filter(Boolean).join(' ');
                if (age < rule.min_age || rule.max_age !== null && age > rule.max_age) {
                    w.push(t.ageOutOfRange(name, age, rule.min_age, rule.max_age));
                }
            }
        }
    }
    if (!team.category && ruleset === 'Nacional' && team.gymnasts.length === 2) w.push(t.pairTypeRequired);
    if (team.gymnasts.some((g)=>!g.dob_valid)) w.push(t.dobInvalid);
    if (team.gymnasts.some((g)=>!g.first_name.trim() || !g.last_name_1.trim())) w.push(t.missingName);
    return w;
}
function parseFile(buffer, ruleset, ageGroupRules) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: 'array',
        cellDates: false
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(ws, {
        header: 1,
        defval: ''
    });
    // Skip header row (first row), skip fully empty rows
    const dataRows = rows.slice(1).filter((r)=>r.some((c)=>String(c).trim() !== ''));
    const teams = [];
    let current = null;
    for (const row of dataRows){
        const position = String(row[0] ?? '').trim().toUpperCase();
        const fullName = String(row[1] ?? '').trim();
        const dobRaw = String(row[4] ?? '').trim() // Birthdate — col E, index 4
        ;
        const categoria = String(row[5] ?? '').trim() // CATEGORIA merged cell — col F, index 5
        ;
        const coach = String(row[6] ?? '').trim() // ENTRENADOR/A — col G, index 6
        ;
        if (position === 'TOP') {
            if (current) teams.push(current);
            // If name column is empty, skip this row — it's not a real team entry
            if (!fullName) {
                current = null;
                continue;
            }
            // Match age group against ruleset-filtered rules (accent-insensitive)
            const catNorm = normalizeStr(categoria);
            const rulesetPool = filterRulesByRuleset(ageGroupRules, ruleset);
            const matchedRule = catNorm ? rulesetPool.find((r)=>{
                const agNorm = normalizeStr(r.age_group);
                return agNorm === catNorm || agNorm.includes(catNorm) || catNorm.includes(agNorm);
            }) : undefined;
            current = {
                _id: crypto.randomUUID(),
                ageGroupRaw: categoria,
                ageGroupId: matchedRule?.id ?? '',
                category: '',
                coach,
                gymnasts: [],
                warnings: []
            };
        }
        if (!current || !fullName) continue;
        if (position !== 'TOP' && position !== 'BASE' && position !== '') continue;
        const words = fullName.split(/\s+/).filter(Boolean);
        const { iso, valid } = parseDob(dobRaw);
        current.gymnasts.push({
            first_name: words[0] ?? '',
            last_name_1: words[1] ?? '',
            last_name_2: words.slice(2).join(' '),
            dob_raw: dobRaw,
            date_of_birth: iso,
            dob_valid: valid
        });
    }
    if (current) teams.push(current);
    // Derive categories now that gymnast counts are known
    for (const team of teams){
        team.category = deriveCategory(team.gymnasts.length, ruleset);
    // warnings computed later with full context
    }
    return teams;
}
// ─── sub-components ───────────────────────────────────────────────────────────
function WarningBadge({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "w-3 h-3 shrink-0",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 321,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 320,
                columnNumber: 7
            }, this),
            text
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
        lineNumber: 319,
        columnNumber: 5
    }, this);
}
_c = WarningBadge;
function ImportTab({ lang, competitionId, ageGroupRules, competitionAgeGroups, competitionYear }) {
    _s();
    const t = T[lang];
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const fileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── step state ───────────────────────────────────────────────────────────────
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('upload');
    // ── upload step ──────────────────────────────────────────────────────────────
    const [clubs, setClubs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [clubSearch, setClubSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedClubId, setSelectedClubId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isNewClub, setIsNewClub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newClub, setNewClub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        club_name: '',
        email: '',
        contact_name: ''
    });
    const [ruleset, setRuleset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [fileError, setFileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [parseError, setParseError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [fileBuffer, setFileBuffer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // ── review step ──────────────────────────────────────────────────────────────
    const [teams, setTeams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // ── done step ────────────────────────────────────────────────────────────────
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── fetch clubs ───────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ImportTab.useEffect": ()=>{
            fetch('/api/admin/clubs').then({
                "ImportTab.useEffect": (r)=>r.json()
            }["ImportTab.useEffect"]).then({
                "ImportTab.useEffect": (data)=>Array.isArray(data) ? setClubs(data) : null
            }["ImportTab.useEffect"]).catch({
                "ImportTab.useEffect": ()=>null
            }["ImportTab.useEffect"]);
        }
    }["ImportTab.useEffect"], []);
    const filteredClubs = clubs.filter((c)=>c.club_name.toLowerCase().includes(clubSearch.toLowerCase()));
    // ── file read ─────────────────────────────────────────────────────────────────
    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setParseError('');
        const reader = new FileReader();
        reader.onload = (ev)=>{
            const buf = ev.target?.result;
            if (buf instanceof ArrayBuffer) setFileBuffer(buf);
        };
        reader.readAsArrayBuffer(file);
    }
    function handleParse() {
        if (!fileBuffer) {
            setParseError(t.noFile);
            return;
        }
        if (!ruleset) {
            setParseError(t.noRuleset);
            return;
        }
        if (!selectedClubId && !isNewClub) {
            setParseError(t.noClub);
            return;
        }
        if (isNewClub && (!newClub.club_name.trim() || !newClub.email.trim())) {
            setParseError(t.noClub);
            return;
        }
        try {
            const parsed = parseFile(fileBuffer, ruleset, ageGroupRules);
            if (!parsed.length) {
                setParseError(t.noTeams);
                return;
            }
            // Compute warnings with final context
            const withWarnings = parsed.map((team)=>({
                    ...team,
                    warnings: computeWarnings(team, ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear)
                }));
            setTeams(withWarnings);
            setParseError('');
            setStep('review');
        } catch  {
            setParseError(t.parseError);
        }
    }
    // ── team edit helpers ─────────────────────────────────────────────────────────
    function updateTeam(teamIdx, patch) {
        setTeams((prev)=>prev.map((team, i)=>{
                if (i !== teamIdx) return team;
                const updated = {
                    ...team,
                    ...patch
                };
                updated.warnings = computeWarnings(updated, ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear);
                return updated;
            }));
    }
    function updateGymnast(teamIdx, gymIdx, patch) {
        setTeams((prev)=>prev.map((team, i)=>{
                if (i !== teamIdx) return team;
                const gymnasts = team.gymnasts.map((g, j)=>{
                    if (j !== gymIdx) return g;
                    const updated = {
                        ...g,
                        ...patch
                    };
                    // Re-validate DOB if it changed (date input returns yyyy-MM-dd directly)
                    if (patch.date_of_birth !== undefined) {
                        const iso = patch.date_of_birth;
                        updated.date_of_birth = iso;
                        updated.dob_valid = iso !== '' && !isNaN(new Date(iso + 'T00:00:00').getTime());
                    }
                    return updated;
                });
                const updated = {
                    ...team,
                    gymnasts
                };
                updated.warnings = computeWarnings(updated, ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear);
                return updated;
            }));
    }
    // ── confirm import ────────────────────────────────────────────────────────────
    const hasErrors = teams.some((t)=>t.warnings.length > 0);
    async function handleConfirm() {
        if (hasErrors) return;
        setStep('importing');
        const body = {
            competitionId,
            clubId: isNewClub ? null : selectedClubId,
            newClub: isNewClub ? {
                club_name: newClub.club_name.trim(),
                email: newClub.email.trim(),
                contact_name: newClub.contact_name.trim() || undefined
            } : undefined,
            teams: teams.map((team)=>({
                    ageGroupId: team.ageGroupId,
                    category: team.category,
                    gymnasts: team.gymnasts.map((g)=>({
                            first_name: g.first_name.trim(),
                            last_name_1: g.last_name_1.trim(),
                            last_name_2: g.last_name_2.trim(),
                            date_of_birth: g.date_of_birth
                        }))
                }))
        };
        const res = await fetch('/api/admin/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            setStep('review');
            return;
        }
        const data = await res.json();
        setResult({
            teamsCreated: data.teamsCreated,
            inviteSent: data.inviteSent,
            inviteError: data.inviteError ?? null,
            errors: data.errors ?? []
        });
        setStep('done');
    }
    function resetAll() {
        setStep('upload');
        setSelectedClubId('');
        setIsNewClub(false);
        setNewClub({
            club_name: '',
            email: '',
            contact_name: ''
        });
        setRuleset('');
        setFileBuffer(null);
        setFileName('');
        setParseError('');
        setTeams([]);
        setResult(null);
        if (fileRef.current) fileRef.current.value = '';
    }
    // ── render ────────────────────────────────────────────────────────────────────
    if (step === 'done' && result) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg mx-auto py-16 text-center space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-7 h-7 text-emerald-600",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M4.5 12.75l6 6 9-13.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 514,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 513,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 512,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-bold text-slate-800",
                    children: t.done
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 517,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-500",
                    children: t.doneDesc(result.teamsCreated, result.inviteSent)
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 518,
                    columnNumber: 9
                }, this),
                isNewClub && result.inviteError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2",
                    children: [
                        "⚠ ",
                        t.inviteError,
                        ": ",
                        result.inviteError
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 520,
                    columnNumber: 11
                }, this),
                result.errors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-left bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold text-red-600",
                            children: "Errors:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 526,
                            columnNumber: 13
                        }, this),
                        result.errors.map((e, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-500",
                                children: e
                            }, i, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 528,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 525,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: resetAll,
                    className: "mt-4 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all",
                    children: t.importAnother
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 532,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
            lineNumber: 511,
            columnNumber: 7
        }, this);
    }
    if (step === 'review' || step === 'importing') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-400 mb-1",
                                    children: [
                                        isNewClub ? newClub.club_name : clubs.find((c)=>c.id === selectedClubId)?.club_name,
                                        " · ",
                                        ruleset
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 546,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-slate-700",
                                    children: t.reviewTitle(teams.length)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 549,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 545,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setStep('upload'),
                            className: "text-xs text-slate-400 hover:text-slate-600 transition-colors",
                            children: t.back
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 551,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 544,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: teams.map((team, ti)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: [
                                'border rounded-2xl overflow-hidden',
                                team.warnings.length ? 'border-red-200' : 'border-slate-200'
                            ].join(' '),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: [
                                        'px-4 py-3 border-b flex flex-wrap items-start gap-3',
                                        team.warnings.length ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                                    ].join(' '),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5 w-16 shrink-0 pt-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-bold text-slate-400 uppercase tracking-wide",
                                                    children: t.teamN(ti + 1)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 568,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setTeams((prev)=>prev.filter((_, i)=>i !== ti)),
                                                    title: "Remove team",
                                                    className: "ml-auto text-slate-300 hover:text-red-500 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-3.5 h-3.5",
                                                        fill: "none",
                                                        viewBox: "0 0 24 24",
                                                        stroke: "currentColor",
                                                        strokeWidth: 2,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M6 18L18 6M6 6l12 12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 578,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                        lineNumber: 577,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 571,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 567,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-36",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1",
                                                    children: t.ageGroup
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: team.ageGroupId,
                                                    onChange: (e)=>updateTeam(ti, {
                                                            ageGroupId: e.target.value
                                                        }),
                                                    className: inputCls,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: [
                                                                "— ",
                                                                t.ageGroup,
                                                                " —"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 591,
                                                            columnNumber: 21
                                                        }, this),
                                                        (team.ageGroupId ? filterRulesByRuleset(ageGroupRules, ruleset) : ageGroupRules).map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: r.id,
                                                                children: r.age_group
                                                            }, r.id, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                                lineNumber: 596,
                                                                columnNumber: 23
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 586,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 584,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-36",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1",
                                                    children: t.category
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 603,
                                                    columnNumber: 19
                                                }, this),
                                                team.gymnasts.length === 2 && ruleset === 'Nacional' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: team.category,
                                                    onChange: (e)=>updateTeam(ti, {
                                                            category: e.target.value
                                                        }),
                                                    className: inputCls,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: t.selectPair
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 610,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Women's Pair",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.["Women's Pair"] ?? t.womensPair
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 611,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Men's Pair",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.["Men's Pair"] ?? t.mensPair
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 612,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Mixed Pair",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.["Mixed Pair"] ?? t.mixedPair
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 613,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 605,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    readOnly: true,
                                                    value: team.category ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.[team.category] ?? team.category : '—',
                                                    className: inputCls + ' bg-slate-50 text-slate-400 cursor-default'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 602,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-36",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs text-slate-400 mb-1",
                                                    children: t.coach
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 626,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: team.coach,
                                                    onChange: (e)=>updateTeam(ti, {
                                                            coach: e.target.value
                                                        }),
                                                    className: inputCls
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 625,
                                            columnNumber: 17
                                        }, this),
                                        team.warnings.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full flex flex-wrap gap-1.5 pt-1",
                                            children: team.warnings.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WarningBadge, {
                                                    text: w
                                                }, w, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 638,
                                                    columnNumber: 45
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 637,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 565,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "divide-y divide-slate-100",
                                    children: team.gymnasts.map((g, gi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs text-slate-400 mb-1",
                                                            children: t.firstName
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 648,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: g.first_name,
                                                            onChange: (e)=>updateGymnast(ti, gi, {
                                                                    first_name: e.target.value
                                                                }),
                                                            className: inputCls + (!g.first_name.trim() ? ' border-red-300 focus:ring-red-400' : '')
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 649,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 647,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs text-slate-400 mb-1",
                                                            children: t.lastName1
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 657,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: g.last_name_1,
                                                            onChange: (e)=>updateGymnast(ti, gi, {
                                                                    last_name_1: e.target.value
                                                                }),
                                                            className: inputCls + (!g.last_name_1.trim() ? ' border-red-300 focus:ring-red-400' : '')
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 658,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 656,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs text-slate-400 mb-1",
                                                            children: t.lastName2
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 666,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: g.last_name_2,
                                                            onChange: (e)=>updateGymnast(ti, gi, {
                                                                    last_name_2: e.target.value
                                                                }),
                                                            className: inputCls
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 667,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 665,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs text-slate-400 mb-1",
                                                            children: t.dob
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 675,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "date",
                                                            value: g.date_of_birth,
                                                            onChange: (e)=>updateGymnast(ti, gi, {
                                                                    date_of_birth: e.target.value
                                                                }),
                                                            className: inputCls + (!g.dob_valid ? ' border-red-300 focus:ring-red-400' : '')
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                            lineNumber: 676,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                    lineNumber: 674,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, gi, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 646,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 644,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, team._id, true, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 560,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 558,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-end gap-3 pt-2",
                    children: [
                        hasErrors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-red-500",
                            children: t.errorsRemain
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 693,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirm,
                            disabled: hasErrors || step === 'importing',
                            className: "px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2",
                            children: [
                                step === 'importing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 701,
                                    columnNumber: 15
                                }, this),
                                step === 'importing' ? t.confirming : t.confirm
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 695,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                    lineNumber: 691,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
            lineNumber: 542,
            columnNumber: 7
        }, this);
    }
    // ── upload step ───────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-lg space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-base font-semibold text-slate-800",
                children: t.title
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 713,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500",
                        children: t.clubLabel
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 717,
                        columnNumber: 9
                    }, this),
                    !isNewClub ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: t.clubPlaceholder,
                                value: clubSearch,
                                onChange: (e)=>{
                                    setClubSearch(e.target.value);
                                    setSelectedClubId('');
                                },
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 720,
                                columnNumber: 13
                            }, this),
                            clubSearch && filteredClubs.length > 0 && !selectedClubId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden",
                                children: filteredClubs.slice(0, 8).map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setSelectedClubId(c.id);
                                            setClubSearch(c.club_name);
                                        },
                                        className: "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-slate-800",
                                                children: c.club_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                lineNumber: 736,
                                                columnNumber: 21
                                            }, this),
                                            c.contact_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-slate-400 text-xs ml-2",
                                                children: c.contact_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                                lineNumber: 737,
                                                columnNumber: 40
                                            }, this)
                                        ]
                                    }, c.id, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 730,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 728,
                                columnNumber: 15
                            }, this),
                            selectedClubId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-emerald-600 flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3.5 h-3.5",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M4.5 12.75l6 6 9-13.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                            lineNumber: 745,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 744,
                                        columnNumber: 17
                                    }, this),
                                    clubs.find((c)=>c.id === selectedClubId)?.club_name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 743,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setIsNewClub(true);
                                    setSelectedClubId('');
                                    setClubSearch('');
                                },
                                className: "text-xs text-blue-500 hover:text-blue-700 transition-colors",
                                children: [
                                    "+ ",
                                    t.newClub
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 750,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: [
                                            t.clubName,
                                            " *"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 761,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: newClub.club_name,
                                        onChange: (e)=>setNewClub((p)=>({
                                                    ...p,
                                                    club_name: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 762,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 760,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: [
                                            t.inviteEmail,
                                            " *"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 767,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        value: newClub.email,
                                        onChange: (e)=>setNewClub((p)=>({
                                                    ...p,
                                                    email: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 768,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 766,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: t.contactName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 773,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: newClub.contact_name,
                                        onChange: (e)=>setNewClub((p)=>({
                                                    ...p,
                                                    contact_name: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                        lineNumber: 774,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 772,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setIsNewClub(false),
                                className: "text-xs text-slate-400 hover:text-slate-600 transition-colors",
                                children: [
                                    "← ",
                                    t.clubLabel
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 778,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 759,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 716,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500 mb-2",
                        children: t.ruleset
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 788,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            'Base',
                            'Escolar',
                            'Nacional'
                        ].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setRuleset(r),
                                className: [
                                    'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                                    ruleset === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                ].join(' '),
                                children: r
                            }, r, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 791,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 789,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 787,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500 mb-2",
                        children: t.fileLabel
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 809,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>fileRef.current?.click(),
                        className: "border-2 border-dashed border-slate-200 rounded-2xl px-6 py-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-8 h-8 text-slate-300 mx-auto mb-2",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 1.5,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                    lineNumber: 815,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 814,
                                columnNumber: 11
                            }, this),
                            fileName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-slate-700",
                                children: fileName
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 818,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-400",
                                children: ".ods · .xlsx · .csv"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                                lineNumber: 819,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 810,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: fileRef,
                        type: "file",
                        accept: ".ods,.xlsx,.xls,.csv",
                        className: "hidden",
                        onChange: handleFileChange
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 821,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 808,
                columnNumber: 7
            }, this),
            parseError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-red-500 flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-3.5 h-3.5 shrink-0",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                            lineNumber: 833,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                        lineNumber: 832,
                        columnNumber: 11
                    }, this),
                    parseError
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 831,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleParse,
                disabled: !fileBuffer,
                className: "px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
                children: t.parse
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
                lineNumber: 839,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/ImportTab.tsx",
        lineNumber: 712,
        columnNumber: 5
    }, this);
}
_s(ImportTab, "2Yc3kpaGQeR0Jc7cTmDX1d4q0bk=");
_c1 = ImportTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "WarningBadge");
__turbopack_context__.k.register(_c1, "ImportTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/RegistrationsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RegistrationsTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/ClickableImg.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$ImportTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/ImportTab.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        noRegistrations: 'No teams registered yet.',
        import: 'Import',
        backToList: 'Back to registrations',
        registered: (n)=>`${n} registered`,
        dropout: (n)=>`${n} dropout`,
        dropouts: (n)=>`${n} dropouts`,
        markDropout: 'Mark as dropout',
        undoDropout: 'Undo dropout',
        baja: 'Dropout',
        licenciaWarning: 'Missing licencia',
        licenciaWarningFull: 'One or more gymnasts have no licencia uploaded.',
        expandAll: 'Expand all',
        collapseAll: 'Collapse all'
    },
    es: {
        noRegistrations: 'Sin equipos registrados todavía.',
        import: 'Importar',
        backToList: 'Volver a inscripciones',
        registered: (n)=>`${n} inscrito${n === 1 ? '' : 's'}`,
        dropout: (n)=>`${n} baja`,
        dropouts: (n)=>`${n} bajas`,
        markDropout: 'Declarar baja',
        undoDropout: 'Deshacer baja',
        baja: 'Baja',
        licenciaWarning: 'Licencia pendiente',
        licenciaWarningFull: 'Uno o más gimnastas no tienen la licencia subida.',
        expandAll: 'Expandir todo',
        collapseAll: 'Contraer todo'
    }
};
// ─── club avatar ──────────────────────────────────────────────────────────────
function ClubAvatar({ club }) {
    if (!club) return null;
    return club.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: club.avatar_url,
        alt: club.club_name,
        className: "w-6 h-6 rounded-full object-cover shrink-0 ring-2 ring-white"
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] font-semibold flex items-center justify-center shrink-0 ring-2 ring-white",
        children: club.club_name.charAt(0).toUpperCase()
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = ClubAvatar;
// ─── team avatar ──────────────────────────────────────────────────────────────
function TeamAvatar({ team }) {
    const initials = team.gymnast_display.split('/').map((n)=>n.trim()[0]).join('').toUpperCase().slice(0, 2);
    return team.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        src: team.photo_url,
        alt: team.gymnast_display,
        className: "w-10 h-10 rounded-lg object-cover shrink-0"
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-10 h-10 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0",
        children: initials
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_c1 = TeamAvatar;
function RegistrationGroup({ age_group, category, items, lang, agLabels, open, onToggle, onToggleDropout }) {
    const t = T[lang];
    const activeCount = items.filter((i)=>!i.entry.dropped_out).length;
    const dropoutCount = items.filter((i)=>i.entry.dropped_out).length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "w-full flex items-center gap-3 mb-3 text-left group",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: [
                            'w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform',
                            open ? 'rotate-90' : ''
                        ].join(' '),
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M8.25 4.5l7.5 7.5-7.5 7.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-slate-700",
                        children: [
                            agLabels[age_group] ?? age_group,
                            " · ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryLabel"])(category, lang)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-slate-400",
                        children: t.registered(activeCount)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    dropoutCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-red-400",
                        children: [
                            "· ",
                            dropoutCount === 1 ? t.dropout(1) : t.dropouts(dropoutCount)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden",
                children: items.map(({ entry, team, club, missingLicencia })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: [
                            'flex items-center gap-3 px-4 py-3 transition-colors',
                            entry.dropped_out ? 'bg-slate-50' : 'bg-white'
                        ].join(' '),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: [
                                    'relative shrink-0',
                                    entry.dropped_out ? 'opacity-40' : ''
                                ].join(' '),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamAvatar, {
                                        team: team
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 132,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute -bottom-1 -right-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubAvatar, {
                                            club: club
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            entry.dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: [
                                    'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                                    entry.dropped_out ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'
                                ].join(' '),
                                children: [
                                    "#",
                                    entry.dorsal
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 139,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: [
                                                    'text-sm font-medium text-slate-800 truncate',
                                                    entry.dropped_out ? 'line-through text-slate-400' : ''
                                                ].join(' '),
                                                children: team.gymnast_display
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, this),
                                            missingLicencia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                title: t.licenciaWarningFull,
                                                className: "text-xs font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full shrink-0",
                                                children: [
                                                    "⚠ ",
                                                    t.licenciaWarning
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                                lineNumber: 154,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: [
                                            'text-xs truncate',
                                            entry.dropped_out ? 'text-slate-300' : 'text-slate-400'
                                        ].join(' '),
                                        children: club?.club_name ?? '—'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            entry.dropped_out && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0",
                                children: t.baja
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onToggleDropout(entry.id),
                                className: [
                                    'shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                                    entry.dropped_out ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-red-100 text-red-500 hover:bg-red-50'
                                ].join(' '),
                                children: entry.dropped_out ? t.undoDropout : t.markDropout
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this)
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 124,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                lineNumber: 122,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
_c2 = RegistrationGroup;
const LEVEL_ORDER = [
    'Escolar',
    'Base',
    'Nacional'
];
function getLevel(ageGroupId, rules) {
    const ag = rules.find((r)=>r.id === ageGroupId)?.age_group ?? '';
    if (ag.includes('Escolar')) return 'Escolar';
    if (ag.includes('Base')) return 'Base';
    return 'Nacional';
}
function RegistrationsTab({ lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, competitionId, ageGroupRules, competitionAgeGroups, competitionYear }) {
    _s();
    const t = T[lang];
    const [showImport, setShowImport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // empty Set = all open sentinel for both levels and groups
    const [openLevels, setOpenLevels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [openGroups, setOpenGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    if (showImport) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setShowImport(false),
                    className: "flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M15.75 19.5L8.25 12l7.5-7.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, this),
                        t.backToList
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$ImportTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    lang: lang,
                    competitionId: competitionId,
                    ageGroupRules: ageGroupRules,
                    competitionAgeGroups: competitionAgeGroups,
                    competitionYear: competitionYear
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                    lineNumber: 240,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
            lineNumber: 232,
            columnNumber: 7
        }, this);
    }
    const groupMap = new Map();
    for (const entry of entries){
        const team = globalTeams.find((tm)=>tm.id === entry.team_id);
        if (!team) continue;
        const club = clubs.find((c)=>c.id === team.club_id);
        const missingLicencia = (team.gymnast_ids ?? []).some((gid)=>!gymnasts.find((g)=>g.id === gid)?.licencia_url);
        const key = `${team.age_group}||${team.category}`;
        if (!groupMap.has(key)) {
            groupMap.set(key, {
                age_group: team.age_group,
                category: team.category,
                items: []
            });
        }
        groupMap.get(key).items.push({
            entry,
            team,
            club,
            missingLicencia
        });
    }
    const groups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortByAgeGroupAndCategory"])([
        ...groupMap.values()
    ], ageGroupRules);
    // ── Group by level ──────────────────────────────────────────────────────────
    const byLevel = new Map();
    for (const g of groups){
        const level = getLevel(g.age_group, ageGroupRules);
        if (!byLevel.has(level)) byLevel.set(level, []);
        byLevel.get(level).push(g);
    }
    const presentLevels = LEVEL_ORDER.filter((l)=>byLevel.has(l));
    // ── Open/close helpers ──────────────────────────────────────────────────────
    const allGroupKeys = groups.map((g)=>`${g.age_group}||${g.category}`);
    const isLevelOpen = (level)=>openLevels.size === 0 || openLevels.has(level);
    const toggleLevel = (level)=>{
        setOpenLevels((prev)=>{
            const next = prev.size === 0 ? new Set(presentLevels) : new Set(prev);
            if (next.has(level)) next.delete(level);
            else next.add(level);
            return next;
        });
    };
    const isGroupOpen = (key)=>openGroups.size === 0 || openGroups.has(key);
    const toggleGroup = (key)=>{
        setOpenGroups((prev)=>{
            const next = prev.size === 0 ? new Set(allGroupKeys) : new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };
    const expandAll = ()=>{
        setOpenLevels(new Set());
        setOpenGroups(new Set());
    };
    const collapseAll = ()=>{
        setOpenLevels(new Set([
            '__none__'
        ]));
        setOpenGroups(new Set([
            '__none__'
        ]));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-end gap-2 mb-5",
                children: [
                    entries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: expandAll,
                                className: "text-xs text-slate-400 hover:text-slate-600 transition-colors",
                                children: t.expandAll
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 309,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-200",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 313,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: collapseAll,
                                className: "text-xs text-slate-400 hover:text-slate-600 transition-colors",
                                children: t.collapseAll
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowImport(true),
                        className: "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, this),
                            t.import
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                lineNumber: 306,
                columnNumber: 7
            }, this),
            entries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl",
                children: t.noRegistrations
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                lineNumber: 330,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: presentLevels.map((level)=>{
                    const levelGroups = byLevel.get(level);
                    const levelOpen = isLevelOpen(level);
                    const totalActive = levelGroups.reduce((sum, g)=>sum + g.items.filter((i)=>!i.entry.dropped_out).length, 0);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-slate-200 rounded-2xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleLevel(level),
                                className: "w-full flex items-center gap-3 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: [
                                            'w-4 h-4 text-slate-400 shrink-0 transition-transform',
                                            levelOpen ? 'rotate-90' : ''
                                        ].join(' '),
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2.5,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M8.25 4.5l7.5 7.5-7.5 7.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                            lineNumber: 350,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 346,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold text-slate-700",
                                        children: level
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 352,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: t.registered(totalActive)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 353,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 342,
                                columnNumber: 17
                            }, this),
                            levelOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-5 py-4 space-y-6",
                                children: levelGroups.map((g)=>{
                                    const key = `${g.age_group}||${g.category}`;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RegistrationGroup, {
                                        age_group: g.age_group,
                                        category: g.category,
                                        items: g.items,
                                        lang: lang,
                                        agLabels: agLabels,
                                        open: isGroupOpen(key),
                                        onToggle: ()=>toggleGroup(key),
                                        onToggleDropout: onToggleDropout
                                    }, key, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                        lineNumber: 362,
                                        columnNumber: 25
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                                lineNumber: 358,
                                columnNumber: 19
                            }, this)
                        ]
                    }, level, true, {
                        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                        lineNumber: 340,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
                lineNumber: 334,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/RegistrationsTab.tsx",
        lineNumber: 305,
        columnNumber: 5
    }, this);
}
_s(RegistrationsTab, "kufrbrEi8pRRe3eseR61UCGiT3c=");
_c3 = RegistrationsTab;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "ClubAvatar");
__turbopack_context__.k.register(_c1, "TeamAvatar");
__turbopack_context__.k.register(_c2, "RegistrationGroup");
__turbopack_context__.k.register(_c3, "RegistrationsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/StartingOrderTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StartingOrderTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
// ─── time helpers ─────────────────────────────────────────────────────────────
function routineDurationSec(routineType, routineCount) {
    if (routineType === 'Balance') return 150;
    if (routineType === 'Combined' && routineCount === 3) return 150;
    return 120;
}
function addSecsToHHMM(hhmm, secs) {
    const [h, m] = hhmm.split(':').map(Number);
    const total = h * 3600 + m * 60 + secs;
    const adj = (total % 86400 + 86400) % 86400;
    return `${String(Math.floor(adj / 3600)).padStart(2, '0')}:${String(Math.floor(adj % 3600 / 60)).padStart(2, '0')}`;
}
function calcPanelTimes(section, panelSessions, sessionOrders, ageGroupRules) {
    const result = new Map();
    if (!section.starting_time) return result;
    const startHHMM = section.starting_time.slice(0, 5);
    const waitSec = section.waiting_time_seconds ?? 0;
    const warmupSec = (section.warmup_duration_minutes ?? 0) * 60;
    let elapsed = 0;
    const sorted = [
        ...panelSessions
    ].sort((a, b)=>a.order_index - b.order_index);
    for (const session of sorted){
        const rule = ageGroupRules.find((r)=>r.id === session.age_group);
        const duration = routineDurationSec(session.routine_type, rule?.routine_count ?? 2);
        const orders = sessionOrders.filter((o)=>o.session_id === session.id).sort((a, b)=>a.position - b.position);
        for (const o of orders){
            result.set(`${session.id}:${o.team_id}`, {
                compete: addSecsToHHMM(startHHMM, elapsed),
                warmup: addSecsToHHMM(startHHMM, elapsed - warmupSec)
            });
            elapsed += duration + waitSec;
        }
    }
    return result;
}
// Alternating 2-panel: P1[0], P2[0], P1[1], P2[1], … share a single clock
function calcInterleavedTimes(section, p1Sessions, p2Sessions, sessionOrders, ageGroupRules) {
    const result = new Map();
    if (!section.starting_time) return result;
    const startHHMM = section.starting_time.slice(0, 5);
    const waitSec = section.waiting_time_seconds ?? 0;
    const warmupSec = (section.warmup_duration_minutes ?? 0) * 60;
    function buildSeq(sessions) {
        const seq = [];
        for (const s of [
            ...sessions
        ].sort((a, b)=>a.order_index - b.order_index)){
            const rule = ageGroupRules.find((r)=>r.id === s.age_group);
            const dur = routineDurationSec(s.routine_type, rule?.routine_count ?? 2);
            for (const o of sessionOrders.filter((o)=>o.session_id === s.id).sort((a, b)=>a.position - b.position)){
                seq.push({
                    sessionId: s.id,
                    teamId: o.team_id,
                    duration: dur
                });
            }
        }
        return seq;
    }
    const seq1 = buildSeq(p1Sessions);
    const seq2 = buildSeq(p2Sessions);
    let elapsed = 0;
    const maxLen = Math.max(seq1.length, seq2.length);
    for(let i = 0; i < maxLen; i++){
        if (i < seq1.length) {
            result.set(`${seq1[i].sessionId}:${seq1[i].teamId}`, {
                compete: addSecsToHHMM(startHHMM, elapsed),
                warmup: addSecsToHHMM(startHHMM, elapsed - warmupSec)
            });
            elapsed += seq1[i].duration + waitSec;
        }
        if (i < seq2.length) {
            result.set(`${seq2[i].sessionId}:${seq2[i].teamId}`, {
                compete: addSecsToHHMM(startHHMM, elapsed),
                warmup: addSecsToHHMM(startHHMM, elapsed - warmupSec)
            });
            elapsed += seq2[i].duration + waitSec;
        }
    }
    return result;
}
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        hint: 'Set the order teams compete within each session.',
        noTeams: 'No teams registered for this session.',
        noSections: 'No sessions defined yet. Go to Structure to add sessions.',
        panelN: (n)=>`Panel ${n}`,
        sectionN: (n)=>`Section ${n}`,
        shuffle: 'Shuffle',
        lock: 'Publish',
        unlock: 'Published',
        notCompeting: 'Not competing',
        baja: 'Dropout',
        warmup: 'W',
        compete: 'C',
        viewSessions: 'Sessions',
        viewTimeline: 'Timeline',
        print: 'Print'
    },
    es: {
        hint: 'Establece el orden de actuación en cada sesión.',
        noTeams: 'Sin equipos inscritos para esta sesión.',
        noSections: 'Sin sesiones definidas. Ve a Estructura.',
        panelN: (n)=>`Panel ${n}`,
        sectionN: (n)=>`Jornada ${n}`,
        shuffle: 'Aleatorio',
        lock: 'Publicar',
        unlock: 'Publicado',
        notCompeting: 'No compiten',
        baja: 'Baja',
        warmup: 'C',
        compete: 'A',
        viewSessions: 'Sesiones',
        viewTimeline: 'Línea de tiempo',
        print: 'Imprimir'
    }
};
const PANEL_HEADER = {
    1: 'bg-blue-50 text-blue-700 border-blue-200',
    2: 'bg-violet-50 text-violet-700 border-violet-200'
};
const PANEL_COLORS = {
    1: {
        badge: 'bg-emerald-100 text-emerald-700',
        num: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
    },
    2: {
        badge: 'bg-violet-100 text-violet-700',
        num: 'bg-violet-50 text-violet-600 border border-violet-200'
    }
};
// ─── club avatar ──────────────────────────────────────────────────────────────
function ClubAvatar({ club }) {
    if (!club) return null;
    return club.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
        src: club.avatar_url,
        alt: club.club_name,
        className: "w-5 h-5 rounded-full object-cover shrink-0"
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[9px] font-semibold flex items-center justify-center shrink-0",
        children: club.club_name.charAt(0).toUpperCase()
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_c = ClubAvatar;
// ─── icons ────────────────────────────────────────────────────────────────────
function ShuffleIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "w-3.5 h-3.5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
            lineNumber: 170,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 169,
        columnNumber: 5
    }, this);
}
_c1 = ShuffleIcon;
function LockIcon({ locked }) {
    return locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "w-3.5 h-3.5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
            lineNumber: 178,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 177,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "w-3.5 h-3.5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
            lineNumber: 182,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 181,
        columnNumber: 5
    }, this);
}
_c2 = LockIcon;
// ─── session order card ───────────────────────────────────────────────────────
function SessionOrderCard({ session, globalTeams, clubs, entries, sessionOrders, isLocked, lang, agLabels, timesMap, onReorder, onToggleLock }) {
    _s();
    const t = T[lang];
    // Split entries into active and dropout for this session's category + age group
    const sessionEntries = entries.filter((e)=>{
        const team = globalTeams.find((tm)=>tm.id === e.team_id);
        return team && team.age_group === session.age_group && team.category === session.category;
    });
    const activeEntries = sessionEntries.filter((e)=>!e.dropped_out);
    const dropoutEntries = sessionEntries.filter((e)=>e.dropped_out);
    const activeTeams = globalTeams.filter((tm)=>activeEntries.some((e)=>e.team_id === tm.id));
    const dropoutTeams = globalTeams.filter((tm)=>dropoutEntries.some((e)=>e.team_id === tm.id));
    // Saved order for this session (includes both active and dropout team IDs)
    const orders = sessionOrders.filter((o)=>o.session_id === session.id).sort((a, b)=>a.position - b.position);
    // Ordered active teams (for unlocked view and arrows)
    const orderedActive = orders.length === 0 ? activeTeams : [
        ...orders.map((o)=>activeTeams.find((t)=>t.id === o.team_id)).filter((t)=>t !== undefined),
        ...activeTeams.filter((t)=>!orders.some((o)=>o.team_id === t.id))
    ];
    // Full order for locked view: everyone in saved position
    const orderedAll = orders.length === 0 ? [
        ...activeTeams.map((t)=>({
                team: t,
                isDropout: false
            })),
        ...dropoutTeams.map((t)=>({
                team: t,
                isDropout: true
            }))
    ] : orders.map((o)=>{
        const team = globalTeams.find((t)=>t.id === o.team_id);
        if (!team) return null;
        return {
            team,
            isDropout: dropoutEntries.some((e)=>e.team_id === team.id)
        };
    }).filter((x)=>x !== null);
    function shuffleOrder() {
        const ids = orderedActive.map((t)=>t.id);
        for(let i = ids.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [
                ids[j],
                ids[i]
            ];
        }
        // Save active order + dropout IDs appended (their position is preserved on lock)
        onReorder(session.id, [
            ...ids,
            ...dropoutTeams.map((t)=>t.id)
        ]);
    }
    const hasTeams = sessionEntries.length > 0;
    // ── drag-and-drop state (unlocked view) ───────────────────────────────────────
    const [dragIdx, setDragIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [overIdx, setOverIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const dragNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function handleDrop(toIdx) {
        if (dragIdx === null || dragIdx === toIdx) {
            setDragIdx(null);
            setOverIdx(null);
            return;
        }
        const ids = orderedActive.map((t)=>t.id);
        const [moved] = ids.splice(dragIdx, 1);
        ids.splice(toIdx, 0, moved);
        onReorder(session.id, [
            ...ids,
            ...dropoutTeams.map((t)=>t.id)
        ]);
        setDragIdx(null);
        setOverIdx(null);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            'border rounded-xl overflow-hidden',
            isLocked ? 'border-blue-200' : 'border-slate-200'
        ].join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'px-3 py-2 border-b flex items-start justify-between gap-2',
                    isLocked ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                ].join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-slate-700",
                                children: [
                                    (agLabels[session.age_group] ?? session.age_group).replace(/\s*\(.*?\)$/, ''),
                                    " · ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryLabel"])(session.category, lang)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-400",
                                children: session.routine_type
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 275,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 273,
                        columnNumber: 9
                    }, this),
                    hasTeams && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 shrink-0",
                        children: [
                            !isLocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: shuffleOrder,
                                className: "flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ShuffleIcon, {}, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 284,
                                        columnNumber: 17
                                    }, this),
                                    t.shuffle
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 280,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onToggleLock(session.id),
                                className: [
                                    'flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-lg transition-all',
                                    isLocked ? 'text-blue-600 bg-blue-100 border-blue-200 hover:bg-blue-50' : 'text-slate-500 hover:text-slate-700 hover:bg-white border-slate-200'
                                ].join(' '),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LockIcon, {
                                        locked: isLocked
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 297,
                                        columnNumber: 15
                                    }, this),
                                    isLocked ? t.unlock : t.lock
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 288,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 278,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 272,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3",
                children: !hasTeams ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-400 text-center py-3",
                    children: t.noTeams
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                    lineNumber: 307,
                    columnNumber: 11
                }, this) : isLocked ? // ── locked view: full order, dropouts in position, crossed ─────────────
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-0.5",
                    children: orderedAll.map(({ team, isDropout }, idx)=>{
                        const club = clubs.find((c)=>c.id === team.club_id);
                        const times = timesMap.get(`${session.id}:${team.id}`);
                        const dorsal = sessionEntries.find((e)=>e.team_id === team.id)?.dorsal;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: [
                                'flex items-center gap-2 py-1.5',
                                isDropout ? 'opacity-50' : ''
                            ].join(' '),
                            children: [
                                times && !isDropout ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col shrink-0 w-14 gap-0 text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-slate-400 font-mono leading-tight",
                                            children: [
                                                t.warmup,
                                                " ",
                                                times.warmup
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 319,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-slate-600 font-mono font-semibold leading-tight",
                                            children: [
                                                t.compete,
                                                " ",
                                                times.compete
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 320,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 318,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-14 shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 323,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: [
                                        'text-xs font-mono w-5 shrink-0 text-right',
                                        isDropout ? 'text-slate-300 line-through' : 'text-slate-400'
                                    ].join(' '),
                                    children: [
                                        idx + 1,
                                        "."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 325,
                                    columnNumber: 19
                                }, this),
                                dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: [
                                        'text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                                        isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'
                                    ].join(' '),
                                    children: [
                                        "#",
                                        dorsal
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 329,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: [
                                                'text-xs font-medium truncate',
                                                isDropout ? 'text-slate-400 line-through' : 'text-slate-700'
                                            ].join(' '),
                                            children: team.gymnast_display
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 335,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: [
                                                'flex items-center gap-1 text-xs truncate',
                                                isDropout ? 'text-slate-300' : 'text-slate-400'
                                            ].join(' '),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubAvatar, {
                                                    club: club
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 23
                                                }, this),
                                                club?.club_name ?? '—'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 338,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 334,
                                    columnNumber: 19
                                }, this),
                                isDropout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-semibold text-red-300 shrink-0",
                                    children: t.baja
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 344,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, team.id, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 316,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                    lineNumber: 310,
                    columnNumber: 11
                }, this) : // ── unlocked view: drag-and-drop active teams, dropouts below divider ──
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-0.5",
                    children: [
                        orderedActive.map((team, idx)=>{
                            const club = clubs.find((c)=>c.id === team.club_id);
                            const dorsal = sessionEntries.find((e)=>e.team_id === team.id)?.dorsal;
                            const isDragging = dragIdx === idx;
                            const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;
                            const dropAbove = isOver && dragIdx !== null && dragIdx > idx;
                            const dropBelow = isOver && dragIdx !== null && dragIdx < idx;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: isDragging ? dragNode : null,
                                draggable: true,
                                onDragStart: (e)=>{
                                    e.dataTransfer.effectAllowed = 'move';
                                    setDragIdx(idx);
                                },
                                onDragOver: (e)=>{
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    setOverIdx(idx);
                                },
                                onDragEnd: ()=>{
                                    setDragIdx(null);
                                    setOverIdx(null);
                                },
                                onDrop: (e)=>{
                                    e.preventDefault();
                                    handleDrop(idx);
                                },
                                className: [
                                    'flex items-center gap-2 py-1.5 rounded-lg transition-all select-none',
                                    isDragging ? 'opacity-40' : 'cursor-grab active:cursor-grabbing',
                                    dropAbove ? 'border-t-2 border-blue-400' : '',
                                    dropBelow ? 'border-b-2 border-blue-400' : '',
                                    isOver ? 'bg-blue-50' : ''
                                ].join(' '),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3.5 h-3.5 text-slate-300 shrink-0",
                                        fill: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 379,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 378,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-mono text-slate-400 w-5 shrink-0 text-right",
                                        children: [
                                            idx + 1,
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 381,
                                        columnNumber: 19
                                    }, this),
                                    dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white shrink-0",
                                        children: [
                                            "#",
                                            dorsal
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 383,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-slate-700 truncate",
                                                children: team.gymnast_display
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 386,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "flex items-center gap-1 text-xs text-slate-400 truncate",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubAvatar, {
                                                        club: club
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 23
                                                    }, this),
                                                    club?.club_name ?? '—'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 387,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 385,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, team.id, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 361,
                                columnNumber: 17
                            }, this);
                        }),
                        dropoutTeams.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 pt-2 pb-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px bg-slate-100"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 398,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-slate-300 shrink-0",
                                            children: t.notCompeting
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 399,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px bg-slate-100"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 400,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 397,
                                    columnNumber: 17
                                }, this),
                                dropoutTeams.map((team)=>{
                                    const club = clubs.find((c)=>c.id === team.club_id);
                                    const dorsal = sessionEntries.find((e)=>e.team_id === team.id)?.dorsal;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 py-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-5 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 407,
                                                columnNumber: 23
                                            }, this),
                                            dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-300 shrink-0",
                                                children: [
                                                    "#",
                                                    dorsal
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 409,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-slate-300 line-through truncate",
                                                        children: team.gymnast_display
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "flex items-center gap-1 text-xs text-slate-300 truncate",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubAvatar, {
                                                                club: club
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                                lineNumber: 414,
                                                                columnNumber: 27
                                                            }, this),
                                                            club?.club_name ?? '—'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                        lineNumber: 413,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 411,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-semibold text-red-300 shrink-0",
                                                children: t.baja
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                                lineNumber: 418,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, team.id, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 406,
                                        columnNumber: 21
                                    }, this);
                                })
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                    lineNumber: 352,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 270,
        columnNumber: 5
    }, this);
}
_s(SessionOrderCard, "Lc4Eyl41FxhX6bY3KxM+oGRIPtY=");
_c3 = SessionOrderCard;
// ─── panel column ─────────────────────────────────────────────────────────────
function PanelColumn({ lang, panel, sessions, globalTeams, clubs, entries, sessionOrders, lockedSessions, agLabels, timesMap, onReorder, onToggleLock }) {
    const t = T[lang];
    const headerCls = PANEL_HEADER[panel.panel_number] ?? PANEL_HEADER[1];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-slate-200 rounded-xl overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'px-4 py-2 text-xs font-bold border-b',
                    headerCls
                ].join(' '),
                children: t.panelN(panel.panel_number)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 452,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 space-y-3",
                children: sessions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-400 text-center py-3",
                    children: "—"
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                    lineNumber: 457,
                    columnNumber: 11
                }, this) : sessions.map((session)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionOrderCard, {
                        session: session,
                        globalTeams: globalTeams,
                        clubs: clubs,
                        entries: entries,
                        sessionOrders: sessionOrders,
                        isLocked: lockedSessions.includes(session.id),
                        lang: lang,
                        agLabels: agLabels,
                        timesMap: timesMap,
                        onReorder: onReorder,
                        onToggleLock: onToggleLock
                    }, session.id, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 460,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 455,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 451,
        columnNumber: 5
    }, this);
}
_c4 = PanelColumn;
function calcMergedTimes(section, mergedSlots, sessions, ageGroupRules) {
    const result = new Map();
    if (!section.starting_time) return result;
    const startHHMM = section.starting_time.slice(0, 5);
    const waitSec = section.waiting_time_seconds ?? 0;
    const warmupSec = (section.warmup_duration_minutes ?? 0) * 60;
    let elapsed = 0;
    for (const slot of mergedSlots){
        if (!slot.isDropout) {
            const sess = sessions.find((s)=>s.id === slot.sessionId);
            const rule = sess ? ageGroupRules.find((r)=>r.id === sess.age_group) : undefined;
            const dur = sess ? routineDurationSec(sess.routine_type, rule?.routine_count ?? 2) : 120;
            result.set(`${slot.sessionId}:${slot.teamId}`, {
                compete: addSecsToHHMM(startHHMM, elapsed),
                warmup: addSecsToHHMM(startHHMM, elapsed - warmupSec)
            });
            elapsed += dur + waitSec;
        }
    }
    return result;
}
function OrderTimelineView({ lang, panels, section, sessions, sessionOrders, entries, globalTeams, clubs, ageGroupRules, onReorderTimeline }) {
    _s1();
    const t = T[lang];
    const [dragInfo, setDragInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [overIdx, setOverIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const sortedPanels = [
        ...panels
    ].sort((a, b)=>a.panel_number - b.panel_number);
    const droppedIds = new Set(entries.filter((e)=>e.dropped_out).map((e)=>e.team_id));
    const dorsalMap = Object.fromEntries(entries.map((e)=>[
            e.team_id,
            e.dorsal
        ]));
    function buildPanelSlots(panel) {
        const panelSessions = sessions.filter((s)=>s.panel_id === panel.id).sort((a, b)=>a.order_index - b.order_index);
        const slots = [];
        for (const session of panelSessions){
            const orders = sessionOrders.filter((o)=>o.session_id === session.id).sort((a, b)=>a.position - b.position);
            const matchingTeams = globalTeams.filter((t)=>t.age_group === session.age_group && t.category === session.category);
            const matchingIds = new Set(matchingTeams.map((t)=>t.id));
            const orderedIds = orders.filter((o)=>matchingIds.has(o.team_id)).map((o)=>o.team_id);
            const unorderedIds = matchingTeams.filter((t)=>!orderedIds.includes(t.id)).map((t)=>t.id);
            for (const teamId of [
                ...orderedIds,
                ...unorderedIds
            ]){
                slots.push({
                    sessionId: session.id,
                    sessionName: session.name,
                    panelNumber: panel.panel_number,
                    teamId,
                    isDropout: droppedIds.has(teamId)
                });
            }
        }
        return slots;
    }
    // Build slot lookup for all panels
    const allPanelSlots = sortedPanels.flatMap((p)=>buildPanelSlots(p));
    const slotLookup = new Map(allPanelSlots.map((s)=>[
            `${s.sessionId}:${s.teamId}`,
            s
        ]));
    // Build merged list: use timeline_order if present, otherwise default interleaving
    const merged = (()=>{
        if (section.timeline_order && section.timeline_order.length > 0) {
            const used = new Set();
            const ordered = [];
            for (const entry of section.timeline_order){
                const key = `${entry.session_id}:${entry.team_id}`;
                const slot = slotLookup.get(key);
                if (slot) {
                    ordered.push(slot);
                    used.add(key);
                }
            }
            // Append any new slots not yet in timeline_order
            for (const slot of allPanelSlots){
                const key = `${slot.sessionId}:${slot.teamId}`;
                if (!used.has(key)) ordered.push(slot);
            }
            return ordered;
        }
        if (sortedPanels.length === 1) return [
            ...allPanelSlots
        ];
        const slots1 = buildPanelSlots(sortedPanels[0]);
        const slots2 = buildPanelSlots(sortedPanels[1]);
        const result = [];
        const len = Math.max(slots1.length, slots2.length);
        for(let i = 0; i < len; i++){
            if (i < slots1.length) result.push(slots1[i]);
            if (i < slots2.length) result.push(slots2[i]);
        }
        return result;
    })();
    const timesMap = calcMergedTimes(section, merged, sessions, ageGroupRules);
    // Compute drag validity bounds (based on panel-order preservation constraint)
    let dragBounds = {
        prevBound: -1,
        nextBound: merged.length
    };
    if (dragInfo) {
        const dragIdx = merged.findIndex((s)=>s.teamId === dragInfo.teamId && s.sessionId === dragInfo.sessionId);
        if (dragIdx !== -1) {
            const dragPanel = merged[dragIdx].panelNumber;
            let prevBound = -1;
            for(let i = dragIdx - 1; i >= 0; i--){
                if (merged[i].panelNumber === dragPanel) {
                    prevBound = i;
                    break;
                }
            }
            let nextBound = merged.length;
            for(let i = dragIdx + 1; i < merged.length; i++){
                if (merged[i].panelNumber === dragPanel) {
                    nextBound = i;
                    break;
                }
            }
            dragBounds = {
                prevBound,
                nextBound
            };
        }
    }
    function handleDrop(dropIdx) {
        if (!dragInfo) return;
        const dragIdx = merged.findIndex((s)=>s.teamId === dragInfo.teamId && s.sessionId === dragInfo.sessionId);
        setDragInfo(null);
        setOverIdx(null);
        if (dragIdx === -1 || dragIdx === dropIdx) return;
        const dragSlot = merged[dragIdx];
        if (dragSlot.isDropout || merged[dropIdx].isDropout) return;
        // Validate panel-order constraint
        if (dropIdx <= dragBounds.prevBound || dropIdx >= dragBounds.nextBound) return;
        // Reorder and save
        const newOrder = merged.map((s)=>({
                session_id: s.sessionId,
                team_id: s.teamId
            }));
        const [moved] = newOrder.splice(dragIdx, 1);
        newOrder.splice(dropIdx, 0, moved);
        onReorderTimeline(section.id, newOrder);
    }
    const teamById = Object.fromEntries(globalTeams.map((t)=>[
            t.id,
            t
        ]));
    const clubById = Object.fromEntries(clubs.map((c)=>[
            c.id,
            c
        ]));
    // Pre-compute sequential position numbers (active teams only)
    let _n = 0;
    const positions = merged.map((s)=>{
        if (!s.isDropout) _n++;
        return _n;
    });
    if (merged.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-center text-sm text-slate-400 py-16",
            children: t.noTeams
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
            lineNumber: 633,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border border-slate-200 rounded-2xl overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
            className: "divide-y divide-slate-50",
            children: merged.map((slot, idx)=>{
                const team = teamById[slot.teamId];
                const club = team ? clubById[team.club_id] : null;
                const slotTimes = timesMap.get(`${slot.sessionId}:${slot.teamId}`);
                const dorsal = dorsalMap[slot.teamId];
                const colors = PANEL_COLORS[slot.panelNumber] ?? PANEL_COLORS[1];
                const isDragging = dragInfo?.teamId === slot.teamId && dragInfo?.sessionId === slot.sessionId;
                const isValidDrop = dragInfo !== null && !slot.isDropout && !isDragging && idx > dragBounds.prevBound && idx < dragBounds.nextBound;
                const isDimmed = dragInfo !== null && !isDragging && !isValidDrop;
                const isOver = overIdx === idx && isValidDrop;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    draggable: !slot.isDropout,
                    onDragStart: !slot.isDropout ? (e)=>{
                        e.dataTransfer.effectAllowed = 'move';
                        setDragInfo({
                            sessionId: slot.sessionId,
                            teamId: slot.teamId
                        });
                    } : undefined,
                    onDragOver: (e)=>{
                        if (isValidDrop) {
                            e.preventDefault();
                            setOverIdx(idx);
                        }
                    },
                    onDragEnd: ()=>{
                        setDragInfo(null);
                        setOverIdx(null);
                    },
                    onDrop: (e)=>{
                        e.preventDefault();
                        handleDrop(idx);
                    },
                    className: [
                        'flex items-center gap-3 px-4 py-3 select-none transition-all',
                        slot.isDropout ? 'opacity-50' : '',
                        isDragging ? 'opacity-30' : '',
                        isDimmed ? 'opacity-25' : '',
                        isOver ? 'bg-blue-50 border-t-2 border-blue-400' : '',
                        !slot.isDropout ? 'cursor-grab active:cursor-grabbing' : ''
                    ].join(' '),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: [
                                'w-3.5 h-3.5 shrink-0',
                                slot.isDropout ? 'text-slate-100' : 'text-slate-300'
                            ].join(' '),
                            fill: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 670,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 669,
                            columnNumber: 15
                        }, this),
                        slotTimes && !slot.isDropout ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col shrink-0 w-14 gap-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-slate-400 leading-tight",
                                    children: [
                                        "⏰ ",
                                        slotTimes.warmup
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 675,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-semibold text-slate-600 leading-tight",
                                    children: [
                                        "▶ ",
                                        slotTimes.compete
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 676,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 674,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-14 shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 679,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: [
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                slot.isDropout ? 'bg-slate-100 text-slate-400' : colors.num
                            ].join(' '),
                            children: positions[idx]
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 682,
                            columnNumber: 15
                        }, this),
                        sortedPanels.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: [
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0',
                                colors.badge
                            ].join(' '),
                            children: [
                                "P",
                                slot.panelNumber
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 688,
                            columnNumber: 17
                        }, this),
                        dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: [
                                'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                                slot.isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'
                            ].join(' '),
                            children: [
                                "#",
                                dorsal
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 694,
                            columnNumber: 17
                        }, this),
                        team?.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: team.photo_url,
                            alt: "",
                            className: "w-9 h-9 rounded-full object-cover shrink-0"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 701,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-5 h-5 text-slate-300",
                                fill: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 705,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 704,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 703,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: [
                                        'text-sm font-medium text-slate-800 truncate',
                                        slot.isDropout ? 'line-through text-slate-400' : ''
                                    ].join(' '),
                                    children: team?.gymnast_display ?? slot.teamId
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 710,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "flex items-center gap-1 text-xs text-slate-400 truncate",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubAvatar, {
                                            club: club
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 714,
                                            columnNumber: 19
                                        }, this),
                                        club?.club_name ?? '',
                                        " · ",
                                        slot.sessionName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 713,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 709,
                            columnNumber: 15
                        }, this),
                        slot.isDropout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full",
                            children: t.baja
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 719,
                            columnNumber: 17
                        }, this)
                    ]
                }, `${slot.panelNumber}-${slot.teamId}-${idx}`, true, {
                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                    lineNumber: 652,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
            lineNumber: 638,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 637,
        columnNumber: 5
    }, this);
}
_s1(OrderTimelineView, "DBJW9p6xWtsxPEstpEBa1bG/QQs=");
_c5 = OrderTimelineView;
function StartingOrderTab({ lang, globalTeams, clubs, entries, sections, panels, sessions, sessionOrders, lockedSessions, agLabels, ageGroupRules, onReorder, onToggleLock, onReorderTimeline }) {
    _s2();
    const t = T[lang];
    const sortedSections = [
        ...sections
    ].sort((a, b)=>a.section_number - b.section_number);
    const [activeSectionId, setActiveSectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(sortedSections[0]?.id ?? '');
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('sessions');
    const activeSection = sortedSections.find((s)=>s.id === activeSectionId) ?? sortedSections[0];
    function tabLabel(sec) {
        return sec.label ?? t.sectionN(sec.section_number);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-4 print:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400",
                        children: t.hint
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 768,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>window.print(),
                                className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3.5 h-3.5",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                            lineNumber: 775,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 774,
                                        columnNumber: 13
                                    }, this),
                                    t.print
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 770,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex rounded-lg border border-slate-200 overflow-hidden shrink-0 text-xs font-semibold",
                                children: [
                                    'sessions',
                                    'timeline'
                                ].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setView(v),
                                        className: [
                                            'px-3 py-1.5 transition-colors',
                                            view === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-600'
                                        ].join(' '),
                                        children: v === 'sessions' ? t.viewSessions : t.viewTimeline
                                    }, v, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                        lineNumber: 781,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 779,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 769,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 767,
                columnNumber: 7
            }, this),
            sortedSections.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-xl",
                children: t.noSections
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 792,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "so-print-area",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex border-b border-slate-200 gap-0 print:hidden",
                        children: sortedSections.map((sec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveSectionId(sec.id),
                                className: [
                                    'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                                    activeSectionId === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                ].join(' '),
                                children: tabLabel(sec)
                            }, sec.id, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 799,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                        lineNumber: 797,
                        columnNumber: 11
                    }, this),
                    activeSection && (()=>{
                        const sortedPanels = [
                            ...panels
                        ].sort((a, b)=>a.panel_number - b.panel_number);
                        const sectionSessions = sessions.filter((s)=>s.section_id === activeSection.id);
                        if (view === 'timeline') {
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderTimelineView, {
                                lang: lang,
                                panels: sortedPanels,
                                section: activeSection,
                                sessions: sectionSessions,
                                sessionOrders: sessionOrders,
                                entries: entries,
                                globalTeams: globalTeams,
                                clubs: clubs,
                                ageGroupRules: ageGroupRules,
                                onReorderTimeline: onReorderTimeline
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                lineNumber: 820,
                                columnNumber: 17
                            }, this);
                        }
                        const timesMap = sortedPanels.length === 2 ? calcInterleavedTimes(activeSection, sectionSessions.filter((s)=>s.panel_id === sortedPanels[0].id), sectionSessions.filter((s)=>s.panel_id === sortedPanels[1].id), sessionOrders, ageGroupRules) : calcPanelTimes(activeSection, sectionSessions, sessionOrders, ageGroupRules);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: [
                                'grid gap-4',
                                panels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                            ].join(' '),
                            children: sortedPanels.map((panel)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PanelColumn, {
                                    lang: lang,
                                    panel: panel,
                                    sessions: sectionSessions.filter((s)=>s.panel_id === panel.id),
                                    globalTeams: globalTeams,
                                    clubs: clubs,
                                    entries: entries,
                                    sessionOrders: sessionOrders,
                                    lockedSessions: lockedSessions,
                                    agLabels: agLabels,
                                    timesMap: timesMap,
                                    onReorder: onReorder,
                                    onToggleLock: onToggleLock
                                }, panel.id, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                                    lineNumber: 847,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                            lineNumber: 845,
                            columnNumber: 15
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
                lineNumber: 796,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/StartingOrderTab.tsx",
        lineNumber: 766,
        columnNumber: 5
    }, this);
}
_s2(StartingOrderTab, "rZqBW2wxKfe2axImpjmH0BTH91E=");
_c6 = StartingOrderTab;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "ClubAvatar");
__turbopack_context__.k.register(_c1, "ShuffleIcon");
__turbopack_context__.k.register(_c2, "LockIcon");
__turbopack_context__.k.register(_c3, "SessionOrderCard");
__turbopack_context__.k.register(_c4, "PanelColumn");
__turbopack_context__.k.register(_c5, "OrderTimelineView");
__turbopack_context__.k.register(_c6, "StartingOrderTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompetitionDayTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        notActive: 'The competition is not live yet.',
        notActiveSub: 'Session controls become available once the competition is marked as active.',
        section: 'Section',
        panel: 'Panel',
        waiting: 'Waiting',
        active: 'Live',
        finished: 'Finished',
        start: 'Start session',
        finish: 'Finish session',
        confirmStart: 'Start this session? Judges will be able to submit scores.',
        confirmFinish: 'Mark this session as finished?',
        noTeams: 'No teams assigned.',
        dropout: 'Dropout',
        noOrder: 'Starting order not published.',
        scoring: 'Scoring',
        noMusic: 'No music uploaded',
        inputConfig: 'Scoring input',
        keyboard: 'Keyboard',
        elements: 'Elements'
    },
    es: {
        notActive: 'La competición aún no está en curso.',
        notActiveSub: 'Los controles de sesión estarán disponibles cuando la competición esté activa.',
        section: 'Jornada',
        panel: 'Panel',
        waiting: 'En espera',
        active: 'En curso',
        finished: 'Finalizada',
        start: 'Iniciar sesión',
        finish: 'Finalizar sesión',
        confirmStart: '¿Iniciar esta sesión? Los jueces podrán enviar puntuaciones.',
        confirmFinish: '¿Marcar esta sesión como finalizada?',
        noTeams: 'Sin equipos asignados.',
        dropout: 'Baja',
        noOrder: 'Orden de salida no publicado.',
        scoring: 'Puntuando',
        noMusic: 'Sin música subida',
        inputConfig: 'Entrada de puntuación',
        keyboard: 'Teclado',
        elements: 'Elementos'
    }
};
// ─── types ────────────────────────────────────────────────────────────────────
const SESSION_BADGE = {
    waiting: 'bg-slate-100 text-slate-500',
    active: 'bg-blue-600 text-white',
    finished: 'bg-green-100 text-green-700'
};
// ─── session card ─────────────────────────────────────────────────────────────
function SessionCard({ lang, session, sessionOrders, globalTeams, clubs, entries, canControl, showStart, cjpCurrentTeamId, musicPaths, onStart, onFinish, onConfigChange }) {
    _s();
    const t = T[lang];
    const matchingTeamIds = new Set(globalTeams.filter((tm)=>tm.age_group === session.age_group && tm.category === session.category).map((tm)=>tm.id));
    const droppedOutIds = new Set(entries.filter((e)=>e.dropped_out && matchingTeamIds.has(e.team_id)).map((e)=>e.team_id));
    const orders = sessionOrders.filter((o)=>o.session_id === session.id).sort((a, b)=>a.position - b.position);
    const orderedTeamIds = orders.map((o)=>o.team_id);
    const hasOrder = orderedTeamIds.length > 0;
    const statusLabel = t[session.status];
    const isActive = session.status === 'active';
    const isWaiting = session.status === 'waiting';
    const isFinished = session.status === 'finished';
    // ── music player state ────────────────────────────────────────────────────────
    const [currentIdx, setCurrentIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Init audio element once (client-only)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SessionCard.useEffect": ()=>{
            const audio = new Audio();
            audio.onended = ({
                "SessionCard.useEffect": ()=>setIsPlaying(false)
            })["SessionCard.useEffect"];
            audioRef.current = audio;
            return ({
                "SessionCard.useEffect": ()=>{
                    audio.pause();
                    audioRef.current = null;
                }
            })["SessionCard.useEffect"];
        }
    }["SessionCard.useEffect"], []);
    // Reset player when session goes active
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SessionCard.useEffect": ()=>{
            if (isActive) {
                setCurrentIdx(0);
                setIsPlaying(false);
                audioRef.current?.pause();
            }
        }
    }["SessionCard.useEffect"], [
        isActive
    ]);
    const activeTeamIds = orderedTeamIds.filter((id)=>!droppedOutIds.has(id));
    const clampedIdx = Math.min(currentIdx, Math.max(0, activeTeamIds.length - 1));
    const currentMusicTeamId = activeTeamIds[clampedIdx] ?? null;
    const currentMusicUrl = currentMusicTeamId ? musicPaths[currentMusicTeamId] ?? null : null;
    // Sync audio src + play/pause
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SessionCard.useEffect": ()=>{
            const audio = audioRef.current;
            if (!audio) return;
            if (!currentMusicUrl) {
                audio.pause();
                audio.src = '';
                if (isPlaying) setIsPlaying(false);
                return;
            }
            if (audio.src !== currentMusicUrl) {
                audio.pause();
                audio.src = currentMusicUrl;
                audio.load();
            }
            if (isPlaying) {
                audio.play().catch({
                    "SessionCard.useEffect": ()=>setIsPlaying(false)
                }["SessionCard.useEffect"]);
            } else {
                audio.pause();
            }
        }
    }["SessionCard.useEffect"], [
        currentMusicTeamId,
        isPlaying,
        currentMusicUrl
    ]); // eslint-disable-line
    function prev() {
        audioRef.current?.pause();
        setCurrentIdx((i)=>Math.max(0, i - 1));
    }
    function next() {
        if (clampedIdx < activeTeamIds.length - 1) {
            audioRef.current?.pause();
            setCurrentIdx((i)=>i + 1);
        } else {
            setIsPlaying(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            'rounded-2xl border overflow-hidden transition-all',
            isActive ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-slate-200'
        ].join(' '),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: [
                    'px-4 py-3 flex items-center justify-between gap-3',
                    isActive ? 'bg-blue-50' : 'bg-white'
                ].join(' '),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-0.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: [
                                        'px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1',
                                        SESSION_BADGE[session.status]
                                    ].join(' '),
                                    children: [
                                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 178,
                                            columnNumber: 28
                                        }, this),
                                        statusLabel
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 177,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-slate-800 truncate",
                                children: session.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    canControl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0",
                        children: [
                            isWaiting && showStart && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    if (confirm(t.confirmStart)) onStart();
                                },
                                className: "px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all",
                                children: t.start
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this),
                            isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    if (confirm(t.confirmFinish)) onFinish();
                                },
                                className: "px-3 py-1.5 text-xs font-semibold border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all",
                                children: t.finish
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                lineNumber: 193,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 185,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            canControl && !isFinished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-slate-100 px-3 py-2 bg-slate-50 flex flex-wrap gap-x-4 gap-y-1.5 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0",
                        children: t.inputConfig
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    [
                        'dj',
                        'ej'
                    ].map((role)=>{
                        const method = session[`${role}_method`];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-bold text-slate-500 uppercase w-4",
                                    children: role.toUpperCase()
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 210,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex rounded-md overflow-hidden border border-slate-200 text-[10px] font-semibold",
                                    children: [
                                        'keyboard',
                                        'elements'
                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                const newMethod = method === opt ? null : opt;
                                                if (role === 'dj') onConfigChange({
                                                    dj_method: newMethod
                                                });
                                                else onConfigChange({
                                                    ej_method: newMethod
                                                });
                                            },
                                            className: [
                                                'px-2 py-0.5 transition-colors',
                                                method === opt ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-600'
                                            ].join(' '),
                                            children: opt === 'keyboard' ? t.keyboard : t.elements
                                        }, opt, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 213,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 211,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, role, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                            lineNumber: 209,
                            columnNumber: 15
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                lineNumber: 204,
                columnNumber: 9
            }, this),
            (isActive || isFinished) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-slate-100",
                children: !hasOrder ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "px-4 py-3 text-xs text-slate-400 italic",
                    children: t.noOrder
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 237,
                    columnNumber: 13
                }, this) : orderedTeamIds.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "px-4 py-3 text-xs text-slate-400 italic",
                    children: t.noTeams
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 239,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                    className: "divide-y divide-slate-100",
                    children: orderedTeamIds.map((teamId, idx)=>{
                        const team = globalTeams.find((tm)=>tm.id === teamId);
                        const club = team ? clubs.find((c)=>c.id === team.club_id) : undefined;
                        const isDropout = droppedOutIds.has(teamId);
                        const isMusicActive = isActive && teamId === currentMusicTeamId && !isDropout;
                        const isCjpScoring = isActive && teamId === cjpCurrentTeamId && !isDropout;
                        const musicUrl = musicPaths[teamId] ?? null;
                        if (!team) return null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: [
                                'flex items-center gap-2.5 px-3 py-2.5 transition-colors',
                                isDropout ? 'opacity-40' : isMusicActive ? 'bg-blue-50' : ''
                            ].join(' '),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: [
                                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                        isDropout ? 'bg-slate-100 text-slate-400' : isMusicActive ? 'bg-blue-600 text-white' : isActive ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
                                    ].join(' '),
                                    children: isMusicActive && isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 rounded-full bg-white animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                        lineNumber: 263,
                                        columnNumber: 27
                                    }, this) : idx + 1
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 257,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: [
                                                'text-sm font-medium truncate',
                                                isDropout ? 'line-through text-slate-400' : isMusicActive ? 'text-blue-700 font-semibold' : 'text-slate-800'
                                            ].join(' '),
                                            children: team.gymnast_display
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 269,
                                            columnNumber: 23
                                        }, this),
                                        club && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400 truncate",
                                            children: club.club_name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 275,
                                            columnNumber: 32
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 268,
                                    columnNumber: 21
                                }, this),
                                isCjpScoring && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-3 h-3 text-amber-500",
                                            fill: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 282,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 281,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold text-amber-600 uppercase tracking-wide",
                                            children: t.scoring
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 284,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 280,
                                    columnNumber: 23
                                }, this),
                                isDropout && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full",
                                    children: t.dropout
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 290,
                                    columnNumber: 23
                                }, this),
                                isMusicActive && (musicUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1 shrink-0 ml-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: prev,
                                            disabled: clampedIdx === 0,
                                            className: "w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-30 flex items-center justify-center transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-3 h-3 text-blue-700",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M6 6h2v12H6zm3.5 6 8.5 6V6z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 31
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 301,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 299,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsPlaying((p)=>!p),
                                            className: "w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-sm active:scale-95",
                                            children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-3.5 h-3.5 text-white",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 308,
                                                columnNumber: 31
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-3.5 h-3.5 text-white",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M8 5v14l11-7z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 312,
                                                columnNumber: 31
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 305,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: next,
                                            disabled: clampedIdx >= activeTeamIds.length - 1,
                                            className: "w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-30 flex items-center justify-center transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-3 h-3 text-blue-700",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 31
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 319,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 317,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 298,
                                    columnNumber: 25
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-3 h-3 text-red-400",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                lineNumber: 327,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 326,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold text-red-500 uppercase tracking-wide",
                                            children: t.noMusic
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 329,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 325,
                                    columnNumber: 25
                                }, this))
                            ]
                        }, teamId, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                            lineNumber: 252,
                            columnNumber: 19
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 241,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                lineNumber: 235,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
        lineNumber: 169,
        columnNumber: 5
    }, this);
}
_s(SessionCard, "aBOSerGNSjmOLxwdWPOUv8jV9lY=");
_c = SessionCard;
function CompetitionDayTab({ lang, competition, sections, panels, sessions, sessionOrders, globalTeams, clubs, entries, onStartSession, onFinishSession }) {
    _s1();
    const t = T[lang];
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const [activeSection, setActiveSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(sections[0]?.id ?? '');
    // sessionId → current_team_id (CJP indicator)
    const [cjpCurrentTeamIds, setCjpCurrentTeamIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // team_id|routine_type → music public URL
    const [allMusicPaths, setAllMusicPaths] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Local optimistic state for scoring config (so toggling reflects immediately without prop round-trip)
    const [localConfig, setLocalConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const canControl = competition.status === 'active';
    const activeSessions = sessions.filter((s)=>s.status === 'active');
    const activeSessionKey = activeSessions.map((s)=>s.id).join(',');
    // ── fetch music + subscribe to CJP indicator ──────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompetitionDayTab.useEffect": ()=>{
            if (!activeSessions.length) return;
            const ids = activeSessions.map({
                "CompetitionDayTab.useEffect.ids": (s)=>s.id
            }["CompetitionDayTab.useEffect.ids"]);
            const teamIds = [
                ...new Set(sessionOrders.filter({
                    "CompetitionDayTab.useEffect": (o)=>ids.includes(o.session_id)
                }["CompetitionDayTab.useEffect"]).map({
                    "CompetitionDayTab.useEffect": (o)=>o.team_id
                }["CompetitionDayTab.useEffect"]))
            ];
            // fetch initial CJP current_team_id
            supabase.from('sessions').select('id, current_team_id').in('id', ids).then({
                "CompetitionDayTab.useEffect": ({ data })=>{
                    if (!data) return;
                    const map = {};
                    data.forEach({
                        "CompetitionDayTab.useEffect": (s)=>{
                            map[s.id] = s.current_team_id ?? null;
                        }
                    }["CompetitionDayTab.useEffect"]);
                    setCjpCurrentTeamIds(map);
                }
            }["CompetitionDayTab.useEffect"]);
            // fetch music URLs
            if (teamIds.length) {
                supabase.from('routine_music').select('team_id, routine_type, music_path').eq('competition_id', competition.id).in('team_id', teamIds).then({
                    "CompetitionDayTab.useEffect": ({ data })=>setAllMusicPaths(data ?? [])
                }["CompetitionDayTab.useEffect"]);
            }
            // subscribe to session updates (CJP indicator)
            const channels = activeSessions.map({
                "CompetitionDayTab.useEffect.channels": (session)=>supabase.channel(`day-cjp-${session.id}`).on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'sessions',
                        filter: `id=eq.${session.id}`
                    }, {
                        "CompetitionDayTab.useEffect.channels": (payload)=>{
                            const row = payload.new;
                            setCjpCurrentTeamIds({
                                "CompetitionDayTab.useEffect.channels": (prev)=>({
                                        ...prev,
                                        [row.id]: row.current_team_id ?? null
                                    })
                            }["CompetitionDayTab.useEffect.channels"]);
                        }
                    }["CompetitionDayTab.useEffect.channels"]).subscribe()
            }["CompetitionDayTab.useEffect.channels"]);
            return ({
                "CompetitionDayTab.useEffect": ()=>{
                    channels.forEach({
                        "CompetitionDayTab.useEffect": (ch)=>supabase.removeChannel(ch)
                    }["CompetitionDayTab.useEffect"]);
                }
            })["CompetitionDayTab.useEffect"];
        }
    }["CompetitionDayTab.useEffect"], [
        activeSessionKey
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    if (competition.status !== 'active' && competition.status !== 'finished') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center py-24 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-7 h-7 text-slate-400",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                            lineNumber: 425,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 424,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 423,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-base font-semibold text-slate-600",
                    children: t.notActive
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 428,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-400 mt-1 max-w-xs",
                    children: t.notActiveSub
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 429,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
            lineNumber: 422,
            columnNumber: 7
        }, this);
    }
    const sectionSessions = sessions.filter((s)=>s.section_id === activeSection);
    const multiPanel = panels.length > 1;
    function getMusicPaths(session) {
        return Object.fromEntries(allMusicPaths.filter((m)=>m.routine_type === session.routine_type).map((m)=>[
                m.team_id,
                m.music_path
            ]));
    }
    async function handleConfigChange(sessionId, patch) {
        // Optimistic local update so the UI responds immediately
        setLocalConfig((prev)=>({
                ...prev,
                [sessionId]: {
                    ...prev[sessionId] ?? {},
                    ...patch
                }
            }));
        await supabase.from('sessions').update(patch).eq('id', sessionId);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            sections.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex border-b border-slate-200 mb-6 -mx-4 px-4 overflow-x-auto",
                children: sections.map((sec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveSection(sec.id),
                        className: [
                            'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
                            activeSection === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                        ].join(' '),
                        children: sec.label ?? `${t.section} ${sec.section_number}`
                    }, sec.id, false, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 457,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                lineNumber: 455,
                columnNumber: 9
            }, this),
            !multiPanel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: sectionSessions.filter((s)=>s.panel_id === panels[0].id).sort((a, b)=>a.order_index - b.order_index).map((session)=>{
                    const s = {
                        ...session,
                        ...localConfig[session.id] ?? {}
                    };
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionCard, {
                        lang: lang,
                        session: s,
                        sessionOrders: sessionOrders,
                        globalTeams: globalTeams,
                        clubs: clubs,
                        entries: entries,
                        canControl: canControl,
                        showStart: true,
                        cjpCurrentTeamId: cjpCurrentTeamIds[session.id] ?? null,
                        musicPaths: getMusicPaths(session),
                        onStart: ()=>onStartSession(session.id),
                        onFinish: ()=>onFinishSession(session.id),
                        onConfigChange: (patch)=>handleConfigChange(session.id, patch)
                    }, session.id, false, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                        lineNumber: 473,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                lineNumber: 468,
                columnNumber: 9
            }, this) : (()=>{
                const orderIndices = [
                    ...new Set(sectionSessions.map((s)=>s.order_index))
                ].sort((a, b)=>a - b);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: orderIndices.map((idx)=>{
                        const rowSessions = panels.map((p)=>sectionSessions.find((s)=>s.panel_id === p.id && s.order_index === idx)).filter(Boolean);
                        const allWaiting = rowSessions.every((s)=>s.status === 'waiting');
                        const allActive = rowSessions.every((s)=>s.status === 'active');
                        const allFinished = rowSessions.every((s)=>s.status === 'finished');
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border border-slate-200 rounded-2xl overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold text-slate-400 uppercase tracking-wide",
                                            children: [
                                                "#",
                                                idx
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 500,
                                            columnNumber: 23
                                        }, this),
                                        canControl && !allFinished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                allWaiting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        if (confirm(t.confirmStart)) rowSessions.forEach((s)=>onStartSession(s.id));
                                                    },
                                                    className: "flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all",
                                                    children: [
                                                        "▶ ",
                                                        t.start
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 504,
                                                    columnNumber: 29
                                                }, this),
                                                allActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        if (confirm(t.confirmFinish)) rowSessions.forEach((s)=>onFinishSession(s.id));
                                                    },
                                                    className: "flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all",
                                                    children: [
                                                        "✓ ",
                                                        t.finish
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 502,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 499,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `grid gap-0 ${panels.length > 1 ? 'grid-cols-2 divide-x divide-slate-100' : ''}`,
                                    children: rowSessions.map((session)=>{
                                        const s = {
                                            ...session,
                                            ...localConfig[session.id] ?? {}
                                        };
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionCard, {
                                            lang: lang,
                                            session: s,
                                            sessionOrders: sessionOrders,
                                            globalTeams: globalTeams,
                                            clubs: clubs,
                                            entries: entries,
                                            canControl: false,
                                            showStart: false,
                                            cjpCurrentTeamId: cjpCurrentTeamIds[session.id] ?? null,
                                            musicPaths: getMusicPaths(session),
                                            onStart: ()=>{},
                                            onFinish: ()=>{},
                                            onConfigChange: (patch)=>handleConfigChange(session.id, patch)
                                        }, session.id, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                            lineNumber: 522,
                                            columnNumber: 25
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                                    lineNumber: 520,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                            lineNumber: 498,
                            columnNumber: 19
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
                    lineNumber: 488,
                    columnNumber: 13
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx",
        lineNumber: 452,
        columnNumber: 5
    }, this);
}
_s1(CompetitionDayTab, "2Dcd5X+zNks04MirLizFVCAHeS4=");
_c1 = CompetitionDayTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "SessionCard");
__turbopack_context__.k.register(_c1, "CompetitionDayTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/LicenciasTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LicenciasTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        title: 'Licencias',
        noEntries: 'No registered teams.',
        noLicencia: 'No licencia',
        viewLicencia: 'View licencia',
        viewPhoto: 'View photo',
        downloadAll: 'Download all',
        droppedOut: 'Dropped out',
        noGymnasts: 'No gymnasts linked',
        coaches: 'Coaches',
        gymnasts: 'Gymnasts'
    },
    es: {
        title: 'Licencias',
        noEntries: 'No hay equipos inscritos.',
        noLicencia: 'Sin licencia',
        viewLicencia: 'Ver licencia',
        viewPhoto: 'Ver foto',
        downloadAll: 'Descargar todo',
        droppedOut: 'Retirado',
        noGymnasts: 'Sin gimnastas vinculados',
        coaches: 'Entrenadores',
        gymnasts: 'Gimnastas'
    }
};
function LicenciasTab({ lang, globalTeams, clubs, entries, competitionGymnasts, competitionCoaches, globalCoaches, ageGroupRules }) {
    const t = T[lang];
    const clubMap = Object.fromEntries(clubs.map((c)=>[
            c.id,
            c
        ]));
    const teamMap = Object.fromEntries(globalTeams.map((tm)=>[
            tm.id,
            tm
        ]));
    const gymnastMap = Object.fromEntries(competitionGymnasts.map((g)=>[
            g.id,
            g
        ]));
    // registered coach ids (for this competition)
    const registeredCoachIds = new Set(competitionCoaches.map((cc)=>cc.id));
    // coaches that are registered for this competition (full objects)
    const registeredCoaches = globalCoaches.filter((c)=>registeredCoachIds.has(c.id));
    // ── group entries by club ──────────────────────────────────────────────────
    const clubIds = Array.from(new Set([
        ...entries.map((e)=>teamMap[e.team_id]?.club_id).filter(Boolean),
        ...registeredCoaches.map((c)=>c.club_id)
    ]));
    if (clubIds.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-slate-400 py-8 text-center",
            children: t.noEntries
        }, void 0, false, {
            fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
            lineNumber: 73,
            columnNumber: 12
        }, this);
    }
    function handleBulkDownload(gymnasts) {
        const withLicencia = gymnasts.filter((g)=>g.licencia_url);
        withLicencia.forEach((g, i)=>{
            setTimeout(()=>{
                const a = document.createElement('a');
                a.href = g.licencia_url;
                a.download = `${g.first_name}_${g.last_name_1}_licencia.pdf`;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, i * 300);
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: clubIds.map((cid)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClubBlock, {
                lang: lang,
                club: clubMap[cid],
                clubCoaches: registeredCoaches.filter((c)=>c.club_id === cid),
                clubEntries: entries.filter((e)=>teamMap[e.team_id]?.club_id === cid),
                teamMap: teamMap,
                gymnastMap: gymnastMap,
                ageGroupRules: ageGroupRules,
                onBulkDownload: handleBulkDownload
            }, cid, false, {
                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c = LicenciasTab;
// ─── per-club block ────────────────────────────────────────────────────────────
function ClubBlock({ lang, club, clubCoaches, clubEntries, teamMap, gymnastMap, ageGroupRules, onBulkDownload }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Sort entries by age group (sort_order desc) → category type → pair type
    const sortableEntries = clubEntries.map((e)=>({
            ...e,
            age_group: teamMap[e.team_id]?.age_group ?? '',
            category: teamMap[e.team_id]?.category ?? ''
        }));
    const sortedEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortByAgeGroupAndCategory"])(sortableEntries, ageGroupRules);
    const activeEntries = sortedEntries.filter((e)=>!e.dropped_out);
    const droppedEntries = sortedEntries.filter((e)=>e.dropped_out);
    // all gymnasts in active teams for bulk download
    const allActiveGymnasts = activeEntries.flatMap((e)=>{
        const team = teamMap[e.team_id];
        return (team?.gymnast_ids ?? []).map((gid)=>gymnastMap[gid]).filter(Boolean);
    });
    const hasAnyLicencia = allActiveGymnasts.some((g)=>g.licencia_url);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-slate-200 bg-white overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((o)=>!o),
                className: "w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 min-w-0",
                        children: [
                            club?.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: club.avatar_url,
                                alt: club.club_name,
                                className: "w-7 h-7 rounded-lg object-cover shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0",
                                children: club?.club_name?.charAt(0) ?? '?'
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-slate-800 truncate",
                                children: club?.club_name ?? '—'
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 159,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-slate-400 shrink-0",
                                children: [
                                    clubCoaches.length > 0 && `${clubCoaches.length} ${T[lang].coaches.toLowerCase()}`,
                                    clubCoaches.length > 0 && activeEntries.length > 0 && ' · ',
                                    activeEntries.length > 0 && `${activeEntries.length} ${T[lang].gymnasts.toLowerCase()}`
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                role: "button",
                                tabIndex: 0,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onBulkDownload(allActiveGymnasts);
                                },
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter') {
                                        e.stopPropagation();
                                        onBulkDownload(allActiveGymnasts);
                                    }
                                },
                                className: [
                                    'text-xs px-2.5 py-1 rounded-lg border transition-all',
                                    hasAnyLicencia ? 'border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer' : 'border-slate-100 text-slate-300 cursor-default pointer-events-none'
                                ].join(' '),
                                children: T[lang].downloadAll
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 167,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: [
                                    'w-4 h-4 text-slate-300 transition-transform',
                                    open ? 'rotate-180' : ''
                                ].join(' '),
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-slate-100 divide-y divide-slate-50",
                children: [
                    clubCoaches.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-50",
                                children: T[lang].coaches
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 193,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "divide-y divide-slate-50",
                                children: clubCoaches.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "px-4 py-3 flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-9 h-9 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400",
                                                children: c.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: c.photo_url,
                                                    alt: c.full_name,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                    lineNumber: 201,
                                                    columnNumber: 27
                                                }, this) : c.full_name.charAt(0).toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 199,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-800 font-medium truncate",
                                                        children: c.full_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 205,
                                                        columnNumber: 23
                                                    }, this),
                                                    c.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-400",
                                                        children: c.licence
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 206,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 204,
                                                columnNumber: 21
                                            }, this),
                                            c.photo_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: c.photo_url,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shrink-0",
                                                children: T[lang].viewPhoto
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 209,
                                                columnNumber: 23
                                            }, this),
                                            c.licencia_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: c.licencia_url,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shrink-0",
                                                children: T[lang].viewLicencia
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 215,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 shrink-0",
                                                children: T[lang].noLicencia
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 220,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, c.id, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                        lineNumber: 198,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 196,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                        lineNumber: 192,
                        columnNumber: 13
                    }, this),
                    (activeEntries.length > 0 || droppedEntries.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-50",
                                children: T[lang].gymnasts
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 233,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "divide-y divide-slate-50",
                                children: [
                                    ...activeEntries,
                                    ...droppedEntries
                                ].map((entry)=>{
                                    const team = teamMap[entry.team_id];
                                    if (!team) return null;
                                    const dropped = entry.dropped_out;
                                    const gymnasts = (team.gymnast_ids ?? []).map((gid)=>gymnastMap[gid]).filter(Boolean);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: dropped ? 'opacity-50' : '',
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-4 py-2 bg-slate-50/50 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-slate-600 truncate flex-1",
                                                        children: team.gymnast_display
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 246,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryLabel"])(team.category, lang)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 247,
                                                        columnNumber: 25
                                                    }, this),
                                                    dropped && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium",
                                                        children: T[lang].droppedOut
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 245,
                                                columnNumber: 23
                                            }, this),
                                            gymnasts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "px-4 py-3 text-xs text-slate-400",
                                                children: T[lang].noGymnasts
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 253,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "divide-y divide-slate-50",
                                                children: gymnasts.map((g)=>{
                                                    const name = [
                                                        g.first_name,
                                                        g.last_name_1,
                                                        g.last_name_2
                                                    ].filter(Boolean).join(' ');
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "px-4 py-3 flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-9 h-9 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400",
                                                                children: g.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: g.photo_url,
                                                                    alt: name,
                                                                    className: "w-full h-full object-cover"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                    lineNumber: 262,
                                                                    columnNumber: 39
                                                                }, this) : g.first_name.charAt(0)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                lineNumber: 260,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm text-slate-800 font-medium truncate",
                                                                        children: name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                        lineNumber: 266,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-slate-400",
                                                                        children: g.date_of_birth
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                        lineNumber: 267,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                lineNumber: 265,
                                                                columnNumber: 33
                                                            }, this),
                                                            g.photo_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: g.photo_url,
                                                                target: "_blank",
                                                                rel: "noopener noreferrer",
                                                                className: "text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shrink-0",
                                                                children: T[lang].viewPhoto
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                lineNumber: 270,
                                                                columnNumber: 35
                                                            }, this),
                                                            g.licencia_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: g.licencia_url,
                                                                target: "_blank",
                                                                rel: "noopener noreferrer",
                                                                className: "text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shrink-0",
                                                                children: T[lang].viewLicencia
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                lineNumber: 276,
                                                                columnNumber: 35
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 shrink-0",
                                                                children: T[lang].noLicencia
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                                lineNumber: 281,
                                                                columnNumber: 35
                                                            }, this)
                                                        ]
                                                    }, g.id, true, {
                                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 31
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                                lineNumber: 255,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, entry.id, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                        lineNumber: 243,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                                lineNumber: 236,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                        lineNumber: 232,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/LicenciasTab.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
_s(ClubBlock, "dVkDIfRb5RN4FjtonjBYYwpg89o=");
_c1 = ClubBlock;
var _c, _c1;
__turbopack_context__.k.register(_c, "LicenciasTab");
__turbopack_context__.k.register(_c1, "ClubBlock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/admin/competition-detail/CompetitionDetail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompetitionDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$StructureTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/StructureTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$JudgesTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/JudgesTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$RegistrationsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/RegistrationsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$StartingOrderTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/StartingOrderTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$CompetitionDayTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/CompetitionDayTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$LicenciasTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/LicenciasTab.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        back: 'Competitions',
        tabs: {
            structure: 'Structure',
            judges: 'Judges',
            startingOrder: 'Starting order',
            registrations: 'Registrations',
            overview: 'Overview',
            day: 'Competition day',
            licencias: 'Licencias'
        },
        soon: 'Coming soon',
        soonSub: 'This section is not built yet.',
        // overview — display
        name: 'Name',
        location: 'Location',
        dates: 'Dates',
        registrationDeadline: 'Registration deadline',
        tsMusicDeadline: 'TS & Music deadline',
        admin: 'Competition admin',
        ageGroups: 'Age groups',
        poster: 'Poster / logo',
        panels: 'Judging panels',
        panelN: (n)=>`${n} panel${n !== 1 ? 's' : ''}`,
        warningPanelChange: 'Changing to 1 panel will reassign all sessions to Panel 1.',
        none: '—',
        noAdmin: '— assign later —',
        // overview — edit
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        startDate: 'Start date',
        endDate: 'End date',
        // status
        status: {
            draft: 'Draft',
            registration_open: 'Registration open',
            registration_closed: 'Registration closed',
            active: 'Live',
            finished: 'Finished'
        },
        // status advance actions
        action: {
            draft: 'Open registration',
            registration_open: 'Close registration',
            registration_closed: 'Start competition',
            active: 'Finish competition'
        },
        confirmAction: {
            registration_closed: 'This will start the competition and enable scoring. Continue?',
            active: 'This will mark the competition as finished. Continue?'
        },
        posterUpload: 'Upload image',
        posterReplace: 'Replace',
        posterUploading: 'Uploading…',
        djReviewOpen: 'DJ Review open',
        djReviewClosed: 'DJ Review closed',
        openDJReview: 'Open DJ review',
        closeDJReview: 'Close DJ review',
        confirmCloseDJReview: 'Close the DJ review period? DJs will no longer be able to access the review.'
    },
    es: {
        back: 'Competiciones',
        tabs: {
            structure: 'Estructura',
            judges: 'Jueces',
            startingOrder: 'Orden de salida',
            registrations: 'Inscripciones',
            overview: 'Resumen',
            day: 'Día de competición',
            licencias: 'Licencias'
        },
        soon: 'Próximamente',
        soonSub: 'Esta jornada aún no está construida.',
        name: 'Nombre',
        location: 'Sede',
        dates: 'Fechas',
        registrationDeadline: 'Fecha límite de inscripción',
        tsMusicDeadline: 'Fecha límite de TS y música',
        admin: 'Admin de competición',
        ageGroups: 'Grupos de edad',
        poster: 'Póster / logo',
        panels: 'Paneles de jueces',
        panelN: (n)=>`${n} panel${n !== 1 ? 'es' : ''}`,
        warningPanelChange: 'Cambiar a 1 panel reasignará todas las sesiones al Panel 1.',
        none: '—',
        noAdmin: '— asignar después —',
        edit: 'Editar',
        save: 'Guardar',
        cancel: 'Cancelar',
        startDate: 'Fecha inicio',
        endDate: 'Fecha fin',
        // status
        status: {
            draft: 'Borrador',
            registration_open: 'Inscripción abierta',
            registration_closed: 'Inscripción cerrada',
            active: 'En vivo',
            finished: 'Finalizada'
        },
        action: {
            draft: 'Abrir inscripción',
            registration_open: 'Cerrar inscripción',
            registration_closed: 'Iniciar competición',
            active: 'Finalizar competición'
        },
        confirmAction: {
            registration_closed: '¿Iniciar la competición y habilitar la puntuación?',
            active: '¿Marcar la competición como finalizada?'
        },
        posterUpload: 'Subir imagen',
        posterReplace: 'Reemplazar',
        posterUploading: 'Subiendo…',
        djReviewOpen: 'Revisión DJ abierta',
        djReviewClosed: 'Revisión DJ cerrada',
        openDJReview: 'Abrir revisión DJ',
        closeDJReview: 'Cerrar revisión DJ',
        confirmCloseDJReview: '¿Cerrar el período de revisión DJ? Los jueces DJ ya no podrán acceder.'
    }
};
const STATUS_BADGE = {
    draft: 'bg-slate-100 text-slate-500',
    registration_open: 'bg-green-100 text-green-700',
    registration_closed: 'bg-amber-100 text-amber-700',
    active: 'bg-blue-600 text-white',
    finished: 'bg-slate-100 text-slate-400'
};
const ACTION_STYLE = {
    draft: 'border-green-200 text-green-700 hover:bg-green-50',
    registration_open: 'border-amber-200 text-amber-700 hover:bg-amber-50',
    registration_closed: 'border-blue-200 text-blue-700 hover:bg-blue-50',
    active: 'border-red-200 text-red-600 hover:bg-red-50'
};
function formatDateRange(start, end) {
    const fmt = (d)=>new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return fmt(start);
    if (end) return fmt(end);
    return '';
}
// ─── placeholder tab ──────────────────────────────────────────────────────────
function PlaceholderTab({ lang }) {
    const t = T[lang];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center py-24 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-7 h-7 text-slate-400",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 1.5,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m0 0l3.029-2.497c.14-.468.382-.89.766-1.208"
                    }, void 0, false, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-base font-semibold text-slate-600",
                children: t.soon
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 mt-1",
                children: t.soonSub
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
_c = PlaceholderTab;
function OverviewTab({ competition, lang, availableAdmins, ageGroupRules, panels, sessions, onUpdate, onSetPanelCount, onUploadPoster }) {
    _s();
    const t = T[lang];
    const agLabels = Object.fromEntries(ageGroupRules.map((r)=>[
            r.id,
            `${r.age_group} (${r.ruleset})`
        ]));
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const posterInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        ts_music_deadline: '',
        poster_url: '',
        adminId: '',
        age_groups: new Set()
    });
    // Sync form poster_url when parent updates competition.poster_url (e.g. after upload)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OverviewTab.useEffect": ()=>{
            if (editing) setForm({
                "OverviewTab.useEffect": (f)=>({
                        ...f,
                        poster_url: competition.poster_url ?? ''
                    })
            }["OverviewTab.useEffect"]);
        }
    }["OverviewTab.useEffect"], [
        competition.poster_url
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    function startEditing() {
        setForm({
            name: competition.name,
            location: competition.location ?? '',
            start_date: competition.start_date ?? '',
            end_date: competition.end_date ?? '',
            registration_deadline: competition.registration_deadline ?? '',
            ts_music_deadline: competition.ts_music_deadline ?? '',
            poster_url: competition.poster_url ?? '',
            adminId: competition.admin?.id ?? '',
            age_groups: new Set(competition.age_groups)
        });
        setEditing(true);
    }
    function handleSave(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        onUpdate({
            name: form.name.trim(),
            location: form.location.trim() || null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            registration_deadline: form.registration_deadline || null,
            ts_music_deadline: form.ts_music_deadline || null,
            poster_url: form.poster_url.trim() || null,
            admin: availableAdmins.find((u)=>u.id === form.adminId) ?? null,
            age_groups: [
                ...form.age_groups
            ]
        });
        setEditing(false);
    }
    async function handlePosterFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await onUploadPoster(file);
        } finally{
            setUploading(false);
            if (posterInputRef.current) posterInputRef.current.value = '';
        }
    }
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    if (editing) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSave,
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: [
                                t.name,
                                " *"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 266,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            required: true,
                            value: form.name,
                            onChange: (e)=>setForm((f)=>({
                                        ...f,
                                        name: e.target.value
                                    })),
                            className: inputCls
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 265,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: t.location
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 271,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: form.location,
                            onChange: (e)=>setForm((f)=>({
                                        ...f,
                                        location: e.target.value
                                    })),
                            className: inputCls
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 270,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-500 mb-1.5",
                                    children: t.startDate
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    value: form.start_date,
                                    onChange: (e)=>setForm((f)=>({
                                                ...f,
                                                start_date: e.target.value
                                            })),
                                    className: inputCls
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 278,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 276,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-500 mb-1.5",
                                    children: t.endDate
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 281,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    value: form.end_date,
                                    min: form.start_date || undefined,
                                    onChange: (e)=>setForm((f)=>({
                                                ...f,
                                                end_date: e.target.value
                                            })),
                                    className: inputCls
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 282,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 280,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 275,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: t.registrationDeadline
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 287,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "date",
                            value: form.registration_deadline,
                            max: form.start_date || undefined,
                            onChange: (e)=>setForm((f)=>({
                                        ...f,
                                        registration_deadline: e.target.value
                                    })),
                            className: inputCls
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 288,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 286,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: t.tsMusicDeadline
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 292,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "date",
                            value: form.ts_music_deadline,
                            max: form.start_date || undefined,
                            onChange: (e)=>setForm((f)=>({
                                        ...f,
                                        ts_music_deadline: e.target.value
                                    })),
                            className: inputCls
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 293,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 291,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-2",
                            children: t.ageGroups
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 297,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-2",
                            children: ageGroupRules.map((rule)=>{
                                const active = form.age_groups.has(rule.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setForm((f)=>{
                                            const next = new Set(f.age_groups);
                                            active ? next.delete(rule.id) : next.add(rule.id);
                                            return {
                                                ...f,
                                                age_groups: next
                                            };
                                        }),
                                    className: [
                                        'px-3 py-1.5 rounded-xl border text-sm font-medium transition-all',
                                        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    ].join(' '),
                                    children: [
                                        rule.age_group,
                                        " (",
                                        rule.ruleset,
                                        ")"
                                    ]
                                }, rule.id, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 302,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 298,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 296,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: t.admin
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 318,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: form.adminId,
                            onChange: (e)=>setForm((f)=>({
                                        ...f,
                                        adminId: e.target.value
                                    })),
                            className: "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: t.noAdmin
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 321,
                                    columnNumber: 13
                                }, this),
                                availableAdmins.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: u.id,
                                        children: [
                                            u.full_name,
                                            " — ",
                                            u.email
                                        ]
                                    }, u.id, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 322,
                                        columnNumber: 41
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 319,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 317,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1.5",
                            children: t.poster
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 327,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                form.poster_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: form.poster_url,
                                    alt: "poster",
                                    className: "w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 330,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "url",
                                            value: form.poster_url,
                                            onChange: (e)=>setForm((f)=>({
                                                        ...f,
                                                        poster_url: e.target.value
                                                    })),
                                            className: inputCls,
                                            placeholder: "https://…"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                            lineNumber: 333,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: uploading,
                                            onClick: ()=>posterInputRef.current?.click(),
                                            className: "px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all",
                                            children: uploading ? t.posterUploading : form.poster_url ? t.posterReplace : t.posterUpload
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                            lineNumber: 334,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 332,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 328,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            ref: posterInputRef,
                            type: "file",
                            accept: "image/*",
                            className: "hidden",
                            onChange: handlePosterFile
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 340,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 326,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setEditing(false),
                            className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                            children: t.cancel
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 344,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: "px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all",
                            children: t.save
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 348,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 343,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
            lineNumber: 263,
            columnNumber: 7
        }, this);
    }
    const dateStr = formatDateRange(competition.start_date, competition.end_date);
    const fmt = (d)=>new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    const panelCount = panels.length;
    function handlePanelCountChange(count) {
        if (count === panelCount) return;
        if (count === 1 && sessions.length > 0) {
            if (!confirm(t.warningPanelChange)) return;
        }
        onSetPanelCount(count);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end mb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: startEditing,
                    className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-3.5 h-3.5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 375,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 374,
                            columnNumber: 11
                        }, this),
                        t.edit
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                    lineNumber: 372,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 371,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                className: "divide-y divide-slate-100",
                children: [
                    [
                        [
                            t.name,
                            competition.name
                        ],
                        [
                            t.location,
                            competition.location || t.none
                        ],
                        [
                            t.dates,
                            dateStr || t.none
                        ],
                        [
                            t.registrationDeadline,
                            competition.registration_deadline ? fmt(competition.registration_deadline) : t.none
                        ],
                        [
                            t.tsMusicDeadline,
                            competition.ts_music_deadline ? fmt(competition.ts_music_deadline) : t.none
                        ],
                        [
                            t.admin,
                            competition.admin?.full_name || t.none
                        ],
                        [
                            t.ageGroups,
                            competition.age_groups.map((ag)=>agLabels[ag] ?? ag).join(', ') || t.none
                        ]
                    ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-3 flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                    className: "w-48 shrink-0 text-sm text-slate-400",
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 391,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                    className: "text-sm text-slate-700",
                                    children: value
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 392,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, label, true, {
                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-3 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "w-48 shrink-0 text-sm text-slate-400",
                                children: t.poster
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 397,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "flex items-center gap-3",
                                children: [
                                    competition.poster_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: competition.poster_url,
                                        alt: "poster",
                                        className: "w-16 h-16 rounded-xl object-cover border border-slate-200"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 400,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-slate-300",
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 401,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: uploading,
                                        onClick: ()=>posterInputRef.current?.click(),
                                        className: "text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all",
                                        children: uploading ? t.posterUploading : competition.poster_url ? t.posterReplace : t.posterUpload
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 403,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 398,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 396,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-3 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "w-48 shrink-0 text-sm text-slate-400",
                                children: t.panels
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "flex gap-2",
                                children: [
                                    1,
                                    2
                                ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handlePanelCountChange(n),
                                        className: [
                                            'px-3 py-1 rounded-lg border text-sm font-semibold transition-all',
                                            panelCount === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                        ].join(' '),
                                        children: t.panelN(n)
                                    }, n, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 414,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 412,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 410,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 380,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
        lineNumber: 370,
        columnNumber: 5
    }, this);
}
_s(OverviewTab, "1eUidWWcqudUERk6lR6egd1Cm4Y=");
_c1 = OverviewTab;
function CompetitionDetail({ lang, competition, panels, sections, sessions, onBack, onAdvanceStatus, onSetPanelCount, onAddSection, onUpdateSectionLabel, onUpdateSectionTimes, onDeleteSection, onAddSession, onDeleteSession, globalJudges, judgePool, nominations, assignments, panelLocks, onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot, onTogglePanelLock, onCreateJudge, globalTeams, clubs, entries, onToggleDropout, sessionOrders, lockedSessions, onReorder, onToggleLock, onReorderTimeline, availableAdmins, ageGroupRules, onUpdateCompetition, onUploadPoster, onSetDJReviewDeadline, onStartSession, onFinishSession, competitionGymnasts, competitionCoaches, globalCoaches }) {
    _s1();
    const t = T[lang];
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('structure');
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const djReviewIsOpen = competition.ts_music_deadline !== null && today > competition.ts_music_deadline;
    const showDJReviewToggle = ![
        'draft',
        'finished'
    ].includes(competition.status);
    const TABS = [
        {
            key: 'structure',
            label: t.tabs.structure
        },
        {
            key: 'judges',
            label: t.tabs.judges
        },
        {
            key: 'startingOrder',
            label: t.tabs.startingOrder
        },
        {
            key: 'registrations',
            label: t.tabs.registrations
        },
        {
            key: 'licencias',
            label: t.tabs.licencias
        },
        {
            key: 'day',
            label: t.tabs.day,
            live: competition.status === 'active'
        },
        {
            key: 'overview',
            label: t.tabs.overview
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-4xl mx-auto px-4 py-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onBack,
                        className: "flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-3 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M15.75 19.5L8.25 12l7.5-7.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                    lineNumber: 528,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 527,
                                columnNumber: 11
                            }, this),
                            t.back
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 525,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-start justify-between gap-3 mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-bold text-slate-800 leading-snug",
                                children: competition.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 533,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-2",
                                children: [
                                    [
                                        'registration_closed',
                                        'active',
                                        'finished'
                                    ].includes(competition.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `/starting-order/${competition.id}`,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        title: "Starting order (public)",
                                        className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                lineNumber: 541,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                            lineNumber: 540,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 537,
                                        columnNumber: 15
                                    }, this),
                                    (competition.status === 'active' || competition.status === 'finished') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `/results/${competition.id}`,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        title: "Results (public)",
                                        className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0 0A2.25 2.25 0 019.75 12h4.5A2.25 2.25 0 0116.5 14.25m-9 0V12a4.5 4.5 0 119 0v2.25"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                lineNumber: 550,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                            lineNumber: 549,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 546,
                                        columnNumber: 15
                                    }, this),
                                    showDJReviewToggle && (djReviewIsOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                        lineNumber: 559,
                                                        columnNumber: 21
                                                    }, this),
                                                    t.djReviewOpen
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                lineNumber: 558,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    if (!confirm(t.confirmCloseDJReview)) return;
                                                    onSetDJReviewDeadline('2099-12-31');
                                                },
                                                className: "px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 transition-all",
                                                children: t.closeDJReview
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                lineNumber: 562,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 557,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>onSetDJReviewDeadline(yesterday),
                                        className: "px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all",
                                        children: t.openDJReview
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 573,
                                        columnNumber: 17
                                    }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: [
                                            'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5',
                                            STATUS_BADGE[competition.status]
                                        ].join(' '),
                                        children: [
                                            competition.status === 'active' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                                lineNumber: 584,
                                                columnNumber: 17
                                            }, this),
                                            t.status[competition.status]
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 582,
                                        columnNumber: 13
                                    }, this),
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NEXT_STATUS"][competition.status] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            const confirmMsg = t.confirmAction[competition.status];
                                            if (confirmMsg && !confirm(confirmMsg)) return;
                                            onAdvanceStatus();
                                        },
                                        className: [
                                            'px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
                                            ACTION_STYLE[competition.status] ?? ''
                                        ].join(' '),
                                        children: t.action[competition.status]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                        lineNumber: 590,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 534,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 532,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 524,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex border-b border-slate-200 mb-6 overflow-x-auto",
                children: TABS.map(({ key, label, live })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(key),
                        className: [
                            'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5',
                            activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                        ].join(' '),
                        children: [
                            live && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                                lineNumber: 618,
                                columnNumber: 22
                            }, this),
                            label
                        ]
                    }, key, true, {
                        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                        lineNumber: 608,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 606,
                columnNumber: 7
            }, this),
            activeTab === 'structure' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$StructureTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                competitionId: competition.id,
                ageGroups: competition.age_groups,
                agLabels: Object.fromEntries(ageGroupRules.map((r)=>[
                        r.id,
                        `${r.age_group} (${r.ruleset})`
                    ])),
                ageGroupRules: ageGroupRules,
                panels: panels,
                sections: sections,
                sessions: sessions,
                onAddSection: onAddSection,
                onUpdateSectionLabel: onUpdateSectionLabel,
                onUpdateSectionTimes: onUpdateSectionTimes,
                onDeleteSection: onDeleteSection,
                onAddSession: onAddSession,
                onDeleteSession: onDeleteSession
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 626,
                columnNumber: 9
            }, this),
            activeTab === 'overview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OverviewTab, {
                competition: competition,
                lang: lang,
                availableAdmins: availableAdmins,
                ageGroupRules: ageGroupRules,
                panels: panels,
                sessions: sessions,
                onUpdate: onUpdateCompetition,
                onUploadPoster: onUploadPoster,
                onSetPanelCount: onSetPanelCount
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 644,
                columnNumber: 9
            }, this),
            activeTab === 'judges' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$JudgesTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                globalJudges: globalJudges,
                judgePool: judgePool,
                nominations: nominations,
                clubs: clubs,
                assignments: assignments,
                sections: sections,
                panels: panels,
                panelLocks: panelLocks,
                onAddToPool: onAddToPool,
                onRemoveFromPool: onRemoveFromPool,
                onAssignJudge: onAssignJudge,
                onAddSlot: onAddSlot,
                onRemoveSlot: onRemoveSlot,
                onTogglePanelLock: onTogglePanelLock,
                onCreateJudge: onCreateJudge
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 657,
                columnNumber: 9
            }, this),
            activeTab === 'startingOrder' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$StartingOrderTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                globalTeams: globalTeams,
                clubs: clubs,
                entries: entries,
                sections: sections,
                panels: panels,
                sessions: sessions,
                sessionOrders: sessionOrders,
                lockedSessions: lockedSessions,
                agLabels: Object.fromEntries(ageGroupRules.map((r)=>[
                        r.id,
                        `${r.age_group}`
                    ])),
                ageGroupRules: ageGroupRules,
                onReorder: onReorder,
                onToggleLock: onToggleLock,
                onReorderTimeline: onReorderTimeline
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 677,
                columnNumber: 9
            }, this),
            activeTab === 'registrations' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$RegistrationsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                globalTeams: globalTeams,
                clubs: clubs,
                gymnasts: competitionGymnasts,
                entries: entries,
                agLabels: Object.fromEntries(ageGroupRules.map((r)=>[
                        r.id,
                        `${r.age_group}`
                    ])),
                onToggleDropout: onToggleDropout,
                competitionId: competition.id,
                ageGroupRules: ageGroupRules,
                competitionAgeGroups: competition.age_groups,
                competitionYear: competition.start_date ? new Date(competition.start_date + 'T00:00:00').getFullYear() : new Date().getFullYear()
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 695,
                columnNumber: 9
            }, this),
            activeTab === 'licencias' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$LicenciasTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                globalTeams: globalTeams,
                clubs: clubs,
                entries: entries,
                competitionGymnasts: competitionGymnasts,
                competitionCoaches: competitionCoaches,
                globalCoaches: globalCoaches,
                ageGroupRules: ageGroupRules
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 710,
                columnNumber: 9
            }, this),
            activeTab === 'day' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$CompetitionDayTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                competition: competition,
                sections: sections,
                panels: panels,
                sessions: sessions,
                sessionOrders: sessionOrders,
                globalTeams: globalTeams,
                clubs: clubs,
                entries: entries,
                onStartSession: onStartSession,
                onFinishSession: onFinishSession
            }, void 0, false, {
                fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
                lineNumber: 722,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/admin/competition-detail/CompetitionDetail.tsx",
        lineNumber: 522,
        columnNumber: 5
    }, this);
}
_s1(CompetitionDetail, "iG/tvBN0v935Woc7j4dQgNVJe+A=");
_c2 = CompetitionDetail;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PlaceholderTab");
__turbopack_context__.k.register(_c1, "OverviewTab");
__turbopack_context__.k.register(_c2, "CompetitionDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/shared/AuthBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ─── constants ────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
    super_admin: 'bg-violet-100  text-violet-700',
    admin: 'bg-blue-100    text-blue-700',
    judge: 'bg-amber-100   text-amber-700',
    club: 'bg-emerald-100 text-emerald-700'
};
const ROLE_LABEL = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    judge: 'Judge',
    club: 'Club'
};
const AVATAR_BG = {
    super_admin: 'bg-violet-500',
    admin: 'bg-blue-500',
    judge: 'bg-amber-500',
    club: 'bg-emerald-500'
};
function initials(name) {
    return name.split(' ').map((w)=>w[0]).slice(0, 2).join('').toUpperCase() || '?';
}
function Avatar({ name, role, url, size }) {
    if (url) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: url,
            alt: name,
            width: size,
            height: size,
            className: "w-full h-full object-cover"
        }, void 0, false, {
            fileName: "[project]/src/components/shared/AuthBar.tsx",
            lineNumber: 38,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            'w-full h-full flex items-center justify-center text-white text-xs font-bold',
            AVATAR_BG[role]
        ].join(' '),
        children: initials(name)
    }, void 0, false, {
        fileName: "[project]/src/components/shared/AuthBar.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_c = Avatar;
function AuthBar({ lang, onLangChange } = {}) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { activeProfile, allProfiles, switchProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthBar.useEffect": ()=>{
            function handleClick(e) {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClick);
            return ({
                "AuthBar.useEffect": ()=>document.removeEventListener('mousedown', handleClick)
            })["AuthBar.useEffect"];
        }
    }["AuthBar.useEffect"], []);
    if (!activeProfile) return null;
    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/login');
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border-b border-slate-100 px-4 py-1.5 flex items-center justify-between gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: [
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                            ROLE_BADGE[activeProfile.role]
                        ].join(' '),
                        children: ROLE_LABEL[activeProfile.role]
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-slate-600 font-medium",
                        children: activeProfile.name
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/shared/AuthBar.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    lang && onLangChange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5",
                        children: [
                            'en',
                            'es'
                        ].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onLangChange(l),
                                className: [
                                    'px-2.5 py-0.5 rounded-md text-xs font-medium transition-all',
                                    lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                ].join(' '),
                                children: l.toUpperCase()
                            }, l, false, {
                                fileName: "[project]/src/components/shared/AuthBar.tsx",
                                lineNumber: 92,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        ref: dropdownRef,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen((o)=>!o),
                                className: "w-7 h-7 rounded-full overflow-hidden transition-opacity hover:opacity-80 shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                    name: activeProfile.name,
                                    role: activeProfile.role,
                                    url: activeProfile.avatar_url,
                                    size: 28
                                }, void 0, false, {
                                    fileName: "[project]/src/components/shared/AuthBar.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/shared/AuthBar.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50",
                                children: [
                                    allProfiles.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setOpen(false);
                                                if (p.id !== activeProfile.id) switchProfile(p.id);
                                            },
                                            className: "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-7 h-7 rounded-full overflow-hidden shrink-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                                        name: p.name,
                                                        role: p.role,
                                                        url: p.avatar_url,
                                                        size: 28
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                    lineNumber: 120,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-slate-700 font-medium truncate",
                                                            children: p.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                            lineNumber: 124,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: [
                                                                'text-xs font-medium',
                                                                ROLE_BADGE[p.role].replace('bg-', 'text-').split(' ')[1]
                                                            ].join(' '),
                                                            children: ROLE_LABEL[p.role]
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                            lineNumber: 125,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 19
                                                }, this),
                                                p.id === activeProfile.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-3.5 h-3.5 text-blue-500 shrink-0",
                                                    fill: "none",
                                                    viewBox: "0 0 24 24",
                                                    stroke: "currentColor",
                                                    strokeWidth: 2.5,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M5 13l4 4L19 7"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/src/components/shared/AuthBar.tsx",
                                            lineNumber: 115,
                                            columnNumber: 17
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-slate-100 mt-1 pt-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setOpen(false);
                                                handleSignOut();
                                            },
                                            className: "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-4 h-4 shrink-0",
                                                    fill: "none",
                                                    viewBox: "0 0 24 24",
                                                    stroke: "currentColor",
                                                    strokeWidth: 2,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                        lineNumber: 144,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/shared/AuthBar.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 19
                                                }, this),
                                                "Sign out"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/shared/AuthBar.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/shared/AuthBar.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/shared/AuthBar.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/shared/AuthBar.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/shared/AuthBar.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(AuthBar, "JUtPALKDkL1EkeWLDt29iml6Zt4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"]
    ];
});
_c1 = AuthBar;
var _c, _c1;
__turbopack_context__.k.register(_c, "Avatar");
__turbopack_context__.k.register(_c1, "AuthBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/admin/competitions/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$CompetitionDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/competition-detail/CompetitionDetail.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$AuthBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/AuthBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function Page() {
    _s();
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('es');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [competition, setCompetition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [panels, setPanels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sections, setSections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [globalJudges, setGlobalJudges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [judgePool, setJudgePool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [nominations, setNominations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [globalTeams, setGlobalTeams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [clubs, setClubs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sessionOrders, setSessionOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [lockedSessions, setLockedSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [panelLocks, setPanelLocks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [availableAdmins, setAvailableAdmins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ageGroupRules, setAgeGroupRules] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [competitionGymnasts, setCompetitionGymnasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [globalCoaches, setGlobalCoaches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [competitionCoaches, setCompetitionCoaches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // ── initial load ─────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            async function load() {
                try {
                    const [compRes, panelsRes, sectionsRes, sessionsRes, judgesRes, nominationsRes, entriesRes, rulesRes, adminsRes] = await Promise.all([
                        supabase.from('competitions').select('id,name,status,location,start_date,end_date,registration_deadline,ts_music_deadline,age_groups,poster_url,admin_id,created_at').eq('id', id).single(),
                        supabase.from('panels').select('id,competition_id,panel_number').eq('competition_id', id).order('panel_number'),
                        supabase.from('sections').select('id,competition_id,section_number,label,starting_time,waiting_time_seconds,warmup_duration_minutes,timeline_order').eq('competition_id', id).order('section_number'),
                        supabase.from('sessions').select('id,competition_id,panel_id,section_id,name,age_group,category,routine_type,status,order_index,order_locked,dj_method,ej_method').eq('competition_id', id).order('order_index'),
                        supabase.from('judges').select('id,full_name,phone,licence,avatar_url'),
                        supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('competition_id', id),
                        supabase.from('competition_entries').select('id,competition_id,team_id,dorsal,dropped_out').eq('competition_id', id),
                        supabase.from('age_group_rules').select('id, age_group, ruleset, min_age, max_age, routine_count, sort_order').order('sort_order'),
                        supabase.from('profiles').select('id,email').eq('role', 'admin')
                    ]);
                    if (!compRes.data) {
                        setLoading(false);
                        return;
                    }
                    const entryTeamIds = (entriesRes.data ?? []).map({
                        "Page.useEffect.load.entryTeamIds": (e)=>e.team_id
                    }["Page.useEffect.load.entryTeamIds"]);
                    const rawSessions = sessionsRes.data ?? [];
                    const locked = rawSessions.filter({
                        "Page.useEffect.load.locked": (s)=>s.order_locked
                    }["Page.useEffect.load.locked"]).map({
                        "Page.useEffect.load.locked": (s)=>s.id
                    }["Page.useEffect.load.locked"]);
                    const adminProfiles = adminsRes.data ?? [];
                    const rawJudges = judgesRes.data ?? [];
                    const judgeIds = rawJudges.map({
                        "Page.useEffect.load.judgeIds": (j)=>j.id
                    }["Page.useEffect.load.judgeIds"]);
                    const rawSectionIds = (sectionsRes.data ?? []).map({
                        "Page.useEffect.load.rawSectionIds": (s)=>s.id
                    }["Page.useEffect.load.rawSectionIds"]);
                    const rawPanelIds = (panelsRes.data ?? []).map({
                        "Page.useEffect.load.rawPanelIds": (p)=>p.id
                    }["Page.useEffect.load.rawPanelIds"]);
                    const { data: { session: authSession } } = await supabase.auth.getSession();
                    const authToken = authSession?.access_token;
                    const [teamsResult, teamGymnastsResult, ordersResult, adminEmailsResult, judgeProfilesResult, panelLocksResult, assignmentsResult] = await Promise.all([
                        entryTeamIds.length > 0 ? supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url').in('id', entryTeamIds) : Promise.resolve({
                            data: []
                        }),
                        entryTeamIds.length > 0 ? supabase.from('team_gymnasts').select('team_id,gymnast_id').in('team_id', entryTeamIds) : Promise.resolve({
                            data: []
                        }),
                        locked.length > 0 ? supabase.from('session_orders').select('session_id,team_id,position').in('session_id', locked) : Promise.resolve({
                            data: []
                        }),
                        adminProfiles.length > 0 ? fetch('/api/admin/users', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...authToken ? {
                                    Authorization: `Bearer ${authToken}`
                                } : {}
                            },
                            body: JSON.stringify({
                                ids: adminProfiles.map({
                                    "Page.useEffect.load": (p)=>p.id
                                }["Page.useEffect.load"])
                            })
                        }) : Promise.resolve(null),
                        judgeIds.length > 0 ? supabase.from('profiles').select('id,email').in('id', judgeIds) : Promise.resolve({
                            data: []
                        }),
                        rawSectionIds.length > 0 && rawPanelIds.length > 0 ? supabase.from('section_panel_locks').select('section_id,panel_id,locked').in('section_id', rawSectionIds).in('panel_id', rawPanelIds) : Promise.resolve({
                            data: []
                        }),
                        rawSectionIds.length > 0 ? supabase.from('section_panel_judges').select('id,section_id,panel_id,judge_id,role,role_number').in('section_id', rawSectionIds) : Promise.resolve({
                            data: []
                        })
                    ]);
                    const rawTeamsData = teamsResult.data ?? [];
                    const teamGymnastsMap = new Map();
                    for (const row of teamGymnastsResult.data ?? []){
                        const r = row;
                        if (!teamGymnastsMap.has(r.team_id)) teamGymnastsMap.set(r.team_id, []);
                        teamGymnastsMap.get(r.team_id).push(r.gymnast_id);
                    }
                    const teamsData = rawTeamsData.map({
                        "Page.useEffect.load.teamsData": (t)=>({
                                ...t,
                                gymnast_ids: teamGymnastsMap.get(t.id) ?? []
                            })
                    }["Page.useEffect.load.teamsData"]);
                    const ordersData = ordersResult.data;
                    const judgeEmailMap = Object.fromEntries((judgeProfilesResult.data ?? []).map({
                        "Page.useEffect.load.judgeEmailMap": (p)=>[
                                p.id,
                                p.email ?? null
                            ]
                    }["Page.useEffect.load.judgeEmailMap"]));
                    const panelLocksData = panelLocksResult.data;
                    const assignmentsRes = assignmentsResult;
                    let adminsWithEmail = [];
                    if (adminEmailsResult) {
                        if (adminEmailsResult.ok) {
                            adminsWithEmail = await adminEmailsResult.json();
                        } else {
                            adminsWithEmail = adminProfiles.map({
                                "Page.useEffect.load": (p)=>({
                                        id: p.id,
                                        full_name: '',
                                        email: p.email ?? ''
                                    })
                            }["Page.useEffect.load"]);
                        }
                    }
                    // ── wave 3: clubs + gymnasts depend on teams (wave 2) ─────────────────────
                    const clubIds = [
                        ...new Set(teamsData.map({
                            "Page.useEffect.load": (t)=>t.club_id
                        }["Page.useEffect.load"]))
                    ];
                    const allGymnastIds = [
                        ...new Set(teamsData.flatMap({
                            "Page.useEffect.load": (t)=>t.gymnast_ids ?? []
                        }["Page.useEffect.load"]))
                    ];
                    const [clubsResult, gymnastsResult, compCoachesResult] = await Promise.all([
                        clubIds.length > 0 ? supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').in('id', clubIds) : Promise.resolve({
                            data: []
                        }),
                        allGymnastIds.length > 0 ? supabase.from('gymnasts').select('id,club_id,first_name,last_name_1,last_name_2,date_of_birth,photo_url,licencia_url').in('id', allGymnastIds) : Promise.resolve({
                            data: []
                        }),
                        supabase.from('competition_coaches').select('coach_id').eq('competition_id', id)
                    ]);
                    const clubsData = clubsResult.data;
                    const gymnastsData = gymnastsResult.data;
                    const registeredCoachIds = (compCoachesResult.data ?? []).map({
                        "Page.useEffect.load.registeredCoachIds": (r)=>r.coach_id
                    }["Page.useEffect.load.registeredCoachIds"]);
                    // load the coach rows for those ids
                    const coachesResult = registeredCoachIds.length > 0 ? await supabase.from('coaches').select('id,club_id,full_name,licence,photo_url,licencia_url').in('id', registeredCoachIds) : {
                        data: []
                    };
                    const coachesData = coachesResult.data ?? [];
                    const adminMap = Object.fromEntries(adminsWithEmail.map({
                        "Page.useEffect.load.adminMap": (a)=>[
                                a.id,
                                a
                            ]
                    }["Page.useEffect.load.adminMap"]));
                    const { admin_id, ...compRest } = compRes.data;
                    const rawNoms = nominationsRes.data ?? [];
                    setCompetition({
                        ...compRest,
                        admin: admin_id ? adminMap[admin_id] ?? null : null
                    });
                    setPanels(panelsRes.data ?? []);
                    setSections(sectionsRes.data ?? []);
                    setSessions(rawSessions.map({
                        "Page.useEffect.load": ({ order_locked: _, ...s })=>s
                    }["Page.useEffect.load"]));
                    setGlobalJudges(rawJudges.map({
                        "Page.useEffect.load": (j)=>({
                                ...j,
                                email: judgeEmailMap[j.id] ?? null
                            })
                    }["Page.useEffect.load"]));
                    setNominations(rawNoms);
                    setJudgePool(rawNoms.map({
                        "Page.useEffect.load": (n)=>n.judge_id
                    }["Page.useEffect.load"]));
                    setAssignments(assignmentsRes.data ?? []);
                    setGlobalTeams(teamsData);
                    setClubs(clubsData ?? []);
                    setCompetitionGymnasts(gymnastsData ?? []);
                    setGlobalCoaches(coachesData);
                    setCompetitionCoaches(coachesData);
                    setEntries(entriesRes.data ?? []);
                    setLockedSessions(locked);
                    setPanelLocks(panelLocksData ?? []);
                    setSessionOrders(ordersData ?? []);
                    setAvailableAdmins(adminsWithEmail);
                    setAgeGroupRules(rulesRes.data ?? []);
                } finally{
                    setLoading(false);
                }
            }
            load();
        }
    }["Page.useEffect"], [
        id
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    // ── status ───────────────────────────────────────────────────────────────────
    async function handleAdvanceStatus() {
        if (!competition) return;
        const next = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NEXT_STATUS"][competition.status];
        if (!next) return;
        await supabase.from('competitions').update({
            status: next
        }).eq('id', id);
        setCompetition((prev)=>prev ? {
                ...prev,
                status: next
            } : prev);
    }
    // ── panel count ──────────────────────────────────────────────────────────────
    async function handleSetPanelCount(count) {
        // Ensure panel 1 always exists
        let p1 = panels.find((p)=>p.panel_number === 1);
        if (!p1) {
            const { data } = await supabase.from('panels').insert({
                competition_id: id,
                panel_number: 1
            }).select().single();
            if (!data) return;
            p1 = data;
        }
        if (count === 1) {
            const p2 = panels.find((p)=>p.panel_number === 2);
            if (p2) {
                await supabase.from('panels').delete().eq('id', p2.id);
                await supabase.from('sessions').update({
                    panel_id: p1.id
                }).eq('competition_id', id).eq('panel_id', p2.id);
                setSessions((prev)=>prev.map((s)=>s.panel_id === p2.id ? {
                            ...s,
                            panel_id: p1.id
                        } : s));
            }
            setPanels([
                p1
            ]);
        } else {
            let p2 = panels.find((p)=>p.panel_number === 2);
            if (!p2) {
                const { data } = await supabase.from('panels').insert({
                    competition_id: id,
                    panel_number: 2
                }).select().single();
                if (!data) return;
                p2 = data;
                // seed default spj slots for Panel 2 × every existing section
                const slots = sections.flatMap((sec)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultSlots"])(sec.id, p2.id).map((slot)=>({
                            section_id: slot.section_id,
                            panel_id: slot.panel_id,
                            judge_id: slot.judge_id,
                            role: slot.role,
                            role_number: slot.role_number
                        })));
                if (slots.length > 0) {
                    const { data: newSlots } = await supabase.from('section_panel_judges').insert(slots).select();
                    if (newSlots) setAssignments((prev)=>[
                            ...prev,
                            ...newSlots
                        ]);
                }
            }
            setPanels([
                p1,
                p2
            ]);
        }
    }
    // ── sections ─────────────────────────────────────────────────────────────────
    async function handleAddSection() {
        // Ensure Panel 1 exists (may not exist if Overview was never visited)
        let activePanels = panels;
        if (activePanels.length === 0) {
            const { data } = await supabase.from('panels').insert({
                competition_id: id,
                panel_number: 1
            }).select().single();
            if (!data) return;
            const p1 = data;
            setPanels([
                p1
            ]);
            activePanels = [
                p1
            ];
        }
        const nextNum = sections.length > 0 ? Math.max(...sections.map((s)=>s.section_number)) + 1 : 1;
        const { data: newSection } = await supabase.from('sections').insert({
            competition_id: id,
            section_number: nextNum,
            label: null
        }).select().single();
        if (!newSection) return;
        setSections((prev)=>[
                ...prev,
                newSection
            ]);
        // insert default spj slots for new section × all panels
        const slots = activePanels.flatMap((pan)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultSlots"])(newSection.id, pan.id).map((slot)=>({
                    section_id: slot.section_id,
                    panel_id: slot.panel_id,
                    judge_id: slot.judge_id,
                    role: slot.role,
                    role_number: slot.role_number
                })));
        if (slots.length > 0) {
            const { data: newSlots } = await supabase.from('section_panel_judges').insert(slots).select();
            if (newSlots) setAssignments((prev)=>[
                    ...prev,
                    ...newSlots
                ]);
        }
    }
    async function handleUpdateSectionLabel(sectionId, label) {
        await supabase.from('sections').update({
            label: label || null
        }).eq('id', sectionId);
        setSections((prev)=>prev.map((s)=>s.id === sectionId ? {
                    ...s,
                    label: label || null
                } : s));
    }
    async function handleUpdateSectionTimes(sectionId, times) {
        await supabase.from('sections').update(times).eq('id', sectionId);
        setSections((prev)=>prev.map((s)=>s.id === sectionId ? {
                    ...s,
                    ...times
                } : s));
    }
    async function handleDeleteSection(sectionId) {
        await supabase.from('sections').delete().eq('id', sectionId);
        setSections((prev)=>prev.filter((s)=>s.id !== sectionId));
        setSessions((prev)=>prev.filter((s)=>s.section_id !== sectionId));
        setAssignments((prev)=>prev.filter((a)=>a.section_id !== sectionId));
    }
    // ── sessions ─────────────────────────────────────────────────────────────────
    async function handleAddSession(s) {
        const { data: newSession } = await supabase.from('sessions').insert(s).select().single();
        if (newSession) setSessions((prev)=>[
                ...prev,
                newSession
            ]);
    }
    async function handleDeleteSession(sessionId) {
        await supabase.from('sessions').delete().eq('id', sessionId);
        setSessions((prev)=>prev.filter((s)=>s.id !== sessionId));
    }
    // ── judges ───────────────────────────────────────────────────────────────────
    async function handleAddToPool(judgeId) {
        // Note: requires club_id to be nullable in DB (run: ALTER TABLE competition_judge_nominations ALTER COLUMN club_id DROP NOT NULL)
        const { data: nom } = await supabase.from('competition_judge_nominations').insert({
            competition_id: id,
            judge_id: judgeId,
            club_id: null
        }).select().single();
        if (nom) setNominations((prev)=>[
                ...prev,
                nom
            ]);
        setJudgePool((prev)=>[
                ...prev,
                judgeId
            ]);
    }
    async function handleRemoveFromPool(judgeId) {
        await supabase.from('competition_judge_nominations').delete().eq('competition_id', id).eq('judge_id', judgeId);
        setNominations((prev)=>prev.filter((n)=>n.judge_id !== judgeId));
        setJudgePool((prev)=>prev.filter((jid)=>jid !== judgeId));
        setAssignments((prev)=>prev.map((a)=>a.judge_id === judgeId ? {
                    ...a,
                    judge_id: null
                } : a));
    }
    async function handleCreateJudge(data) {
        const { full_name, email, phone, licence } = data;
        if (!email) return;
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const body = {
            role: 'judge',
            email,
            full_name
        };
        if (phone) body.phone = phone;
        if (licence) body.licence = licence;
        const res = await fetch('/api/admin/invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'Failed to send invite');
        }
    // Judge will appear in the pool once they accept the invite and their profile is created
    }
    async function handleAssignJudge(slotId, judgeId) {
        await supabase.from('section_panel_judges').update({
            judge_id: judgeId
        }).eq('id', slotId);
        setAssignments((prev)=>prev.map((a)=>a.id === slotId ? {
                    ...a,
                    judge_id: judgeId
                } : a));
    }
    async function handleAddSlot(sectionId, panelId, role) {
        const existing = assignments.filter((a)=>a.section_id === sectionId && a.panel_id === panelId && a.role === role);
        if (existing.length >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"][role].max) return;
        const { data: newSlot } = await supabase.from('section_panel_judges').insert({
            section_id: sectionId,
            panel_id: panelId,
            judge_id: null,
            role,
            role_number: existing.length + 1
        }).select().single();
        if (newSlot) setAssignments((prev)=>[
                ...prev,
                newSlot
            ]);
    }
    async function handleRemoveSlot(sectionId, panelId, role) {
        const slots = assignments.filter((a)=>a.section_id === sectionId && a.panel_id === panelId && a.role === role).sort((a, b)=>b.role_number - a.role_number);
        if (slots.length <= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_CONFIG"][role].min) return;
        const toRemove = slots[0];
        await supabase.from('section_panel_judges').delete().eq('id', toRemove.id);
        setAssignments((prev)=>prev.filter((a)=>a.id !== toRemove.id));
    }
    async function handleTogglePanelLock(sectionId, panelId) {
        const current = panelLocks.find((l)=>l.section_id === sectionId && l.panel_id === panelId);
        const nextLocked = !(current?.locked ?? false);
        await supabase.from('section_panel_locks').upsert({
            section_id: sectionId,
            panel_id: panelId,
            locked: nextLocked,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'section_id,panel_id'
        });
        setPanelLocks((prev)=>{
            const without = prev.filter((l)=>!(l.section_id === sectionId && l.panel_id === panelId));
            return [
                ...without,
                {
                    section_id: sectionId,
                    panel_id: panelId,
                    locked: nextLocked
                }
            ];
        });
    }
    // ── registrations ─────────────────────────────────────────────────────────────
    async function handleToggleDropout(entryId) {
        const entry = entries.find((e)=>e.id === entryId);
        if (!entry) return;
        const next = !entry.dropped_out;
        await supabase.from('competition_entries').update({
            dropped_out: next
        }).eq('id', entryId);
        setEntries((prev)=>prev.map((e)=>e.id === entryId ? {
                    ...e,
                    dropped_out: next
                } : e));
    }
    // ── starting order ────────────────────────────────────────────────────────────
    async function handleToggleLock(sessionId) {
        const isLocked = lockedSessions.includes(sessionId);
        // When locking: auto-create session_orders if none exist yet
        if (!isLocked) {
            const existingOrders = sessionOrders.filter((o)=>o.session_id === sessionId);
            if (existingOrders.length === 0) {
                const session = sessions.find((s)=>s.id === sessionId);
                if (session) {
                    const sessionTeamIds = entries.filter((e)=>!e.dropped_out).map((e)=>e.team_id).filter((tid)=>{
                        const team = globalTeams.find((t)=>t.id === tid);
                        return team?.age_group === session.age_group && team?.category === session.category;
                    });
                    if (sessionTeamIds.length > 0) {
                        const newOrders = sessionTeamIds.map((teamId, idx)=>({
                                session_id: sessionId,
                                team_id: teamId,
                                position: idx + 1
                            }));
                        await supabase.from('session_orders').upsert(newOrders, {
                            onConflict: 'session_id,team_id'
                        });
                        setSessionOrders((prev)=>[
                                ...prev.filter((o)=>o.session_id !== sessionId),
                                ...newOrders
                            ]);
                    }
                }
            }
        }
        await supabase.from('sessions').update({
            order_locked: !isLocked
        }).eq('id', sessionId);
        setLockedSessions((prev)=>isLocked ? prev.filter((sid)=>sid !== sessionId) : [
                ...prev,
                sessionId
            ]);
    }
    async function handleReorder(sessionId, teamIds) {
        const newOrders = teamIds.map((teamId, idx)=>({
                session_id: sessionId,
                team_id: teamId,
                position: idx + 1
            }));
        await supabase.from('session_orders').upsert(newOrders, {
            onConflict: 'session_id,team_id'
        });
        setSessionOrders((prev)=>[
                ...prev.filter((o)=>o.session_id !== sessionId),
                ...newOrders
            ]);
    }
    async function handleReorderTimeline(sectionId, order) {
        await supabase.from('sections').update({
            timeline_order: order
        }).eq('id', sectionId);
        setSections((prev)=>prev.map((s)=>s.id === sectionId ? {
                    ...s,
                    timeline_order: order
                } : s));
    }
    // ── competition overview ──────────────────────────────────────────────────────
    async function handleUpdateCompetition(updates) {
        await supabase.from('competitions').update({
            name: updates.name,
            location: updates.location,
            start_date: updates.start_date,
            end_date: updates.end_date,
            registration_deadline: updates.registration_deadline,
            ts_music_deadline: updates.ts_music_deadline,
            age_groups: updates.age_groups,
            poster_url: updates.poster_url,
            admin_id: updates.admin?.id ?? null
        }).eq('id', id);
        setCompetition((prev)=>prev ? {
                ...prev,
                ...updates
            } : prev);
    }
    // ── poster upload ─────────────────────────────────────────────────────────────
    async function handleUploadPoster(file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${id}/poster.${ext}`;
        await supabase.storage.from('competition-posters').upload(path, file, {
            upsert: true
        });
        const { data } = supabase.storage.from('competition-posters').getPublicUrl(path);
        const url = data.publicUrl + `?t=${Date.now()}`;
        await supabase.from('competitions').update({
            poster_url: url
        }).eq('id', id);
        setCompetition((prev)=>prev ? {
                ...prev,
                poster_url: url
            } : prev);
    }
    // ── dj review deadline ────────────────────────────────────────────────────────
    async function handleSetDJReviewDeadline(date) {
        await supabase.from('competitions').update({
            ts_music_deadline: date
        }).eq('id', id);
        setCompetition((prev)=>prev ? {
                ...prev,
                ts_music_deadline: date
            } : prev);
    }
    // ── competition day ───────────────────────────────────────────────────────────
    async function handleStartSession(sessionId) {
        await supabase.from('sessions').update({
            status: 'active'
        }).eq('id', sessionId);
        setSessions((prev)=>prev.map((s)=>s.id === sessionId ? {
                    ...s,
                    status: 'active'
                } : s));
    }
    async function handleFinishSession(sessionId) {
        await supabase.from('sessions').update({
            status: 'finished'
        }).eq('id', sessionId);
        setSessions((prev)=>prev.map((s)=>s.id === sessionId ? {
                    ...s,
                    status: 'finished'
                } : s));
    }
    // ── render ────────────────────────────────────────────────────────────────────
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$AuthBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                onLangChange: (l)=>setLang(l)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 486,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-16 bg-slate-100 rounded animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                        lineNumber: 489,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-px bg-slate-200"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                        lineNumber: 490,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 w-48 bg-slate-100 rounded animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                        lineNumber: 491,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 488,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border-b border-slate-200 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-5xl mx-auto flex gap-1 py-1",
                    children: [
                        80,
                        64,
                        72,
                        88,
                        56,
                        76,
                        60
                    ].map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `h-8 bg-slate-100 rounded-lg animate-pulse`,
                            style: {
                                width: w
                            }
                        }, i, false, {
                            fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                            lineNumber: 497,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                    lineNumber: 495,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 494,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-5xl mx-auto px-4 py-6 space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-2xl border border-slate-100 p-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-40 bg-slate-100 rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                lineNumber: 504,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-4",
                                children: [
                                    1,
                                    2,
                                    3,
                                    4
                                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-3 w-20 bg-slate-100 rounded animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                                lineNumber: 508,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-9 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                                lineNumber: 509,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                        lineNumber: 507,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                lineNumber: 505,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                        lineNumber: 503,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-2xl border border-slate-100 p-6 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-32 bg-slate-100 rounded animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                lineNumber: 515,
                                columnNumber: 11
                            }, this),
                            [
                                1,
                                2,
                                3
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 py-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                            lineNumber: 518,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 space-y-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-3.5 w-36 bg-slate-100 rounded animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                                    lineNumber: 520,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-3 w-24 bg-slate-100 rounded animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                            lineNumber: 519,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                                    lineNumber: 517,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                        lineNumber: 514,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 502,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
        lineNumber: 485,
        columnNumber: 5
    }, this);
    if (!competition) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-slate-400",
            children: "Competition not found."
        }, void 0, false, {
            fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
            lineNumber: 532,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
        lineNumber: 531,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$AuthBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                onLangChange: (l)=>setLang(l)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 538,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$competition$2d$detail$2f$CompetitionDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                competition: competition,
                panels: panels,
                sections: sections,
                sessions: sessions,
                onBack: ()=>router.push('/admin'),
                onAdvanceStatus: handleAdvanceStatus,
                onSetPanelCount: handleSetPanelCount,
                onAddSection: handleAddSection,
                onUpdateSectionLabel: handleUpdateSectionLabel,
                onUpdateSectionTimes: handleUpdateSectionTimes,
                onDeleteSection: handleDeleteSection,
                onAddSession: handleAddSession,
                onDeleteSession: handleDeleteSession,
                globalJudges: globalJudges,
                judgePool: judgePool,
                nominations: nominations,
                assignments: assignments,
                panelLocks: panelLocks,
                onAddToPool: handleAddToPool,
                onRemoveFromPool: handleRemoveFromPool,
                onAssignJudge: handleAssignJudge,
                onAddSlot: handleAddSlot,
                onRemoveSlot: handleRemoveSlot,
                onTogglePanelLock: handleTogglePanelLock,
                onCreateJudge: handleCreateJudge,
                globalTeams: globalTeams,
                clubs: clubs,
                entries: entries,
                onToggleDropout: handleToggleDropout,
                sessionOrders: sessionOrders,
                lockedSessions: lockedSessions,
                onReorder: handleReorder,
                onToggleLock: handleToggleLock,
                onReorderTimeline: handleReorderTimeline,
                availableAdmins: availableAdmins,
                ageGroupRules: ageGroupRules,
                onUpdateCompetition: handleUpdateCompetition,
                onUploadPoster: handleUploadPoster,
                onSetDJReviewDeadline: handleSetDJReviewDeadline,
                onStartSession: handleStartSession,
                onFinishSession: handleFinishSession,
                competitionGymnasts: competitionGymnasts,
                globalCoaches: globalCoaches,
                competitionCoaches: competitionCoaches
            }, void 0, false, {
                fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
                lineNumber: 540,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/competitions/[id]/page.tsx",
        lineNumber: 537,
        columnNumber: 5
    }, this);
}
_s(Page, "D0ABI6FKqwhOWHskkXQ+zDK8ySk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_6db2f73a._.js.map