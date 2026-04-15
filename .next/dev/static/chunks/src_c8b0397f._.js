(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/components/club/GymnastsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PhotoAvatar",
    ()=>PhotoAvatar,
    "default",
    ()=>GymnastsTab,
    "gymnastFullName",
    ()=>gymnastFullName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
'use client';
;
;
const T = {
    en: {
        addGymnast: 'Add gymnast',
        search: 'Search by name or surname…',
        importGymnasts: 'Import from Excel RFEG',
        importTitle: 'Import gymnasts',
        importFound: (n)=>`${n} gymnast${n !== 1 ? 's' : ''} found in file`,
        importDuplicateNote: (n)=>`${n} already exist and will be skipped`,
        importDuplicate: 'Already exists',
        importConfirm: 'Add gymnasts',
        importConfirming: 'Saving…',
        importCancel: 'Cancel',
        importEmpty: 'No valid gymnasts found in the file.',
        importDone: (n)=>`${n} gymnast${n !== 1 ? 's' : ''} added.`,
        licenciaNacional: 'Nat. Licence',
        firstName: 'First name',
        lastName1: 'First surname',
        lastName2: 'Second surname',
        dob: 'Date of birth',
        save: 'Save',
        cancel: 'Cancel',
        empty: 'No gymnasts yet. Add your first gymnast to get started.',
        yrs: 'yrs',
        confirmDelete: 'Remove this gymnast from the roster?',
        gymnasts: (n)=>`${n} gymnast${n !== 1 ? 's' : ''}`,
        licencia: 'Licence',
        uploadLicencia: 'Upload licence',
        replaceLicencia: 'Replace',
        removeLicencia: 'Remove licence'
    },
    es: {
        addGymnast: 'Añadir gimnasta',
        search: 'Buscar por nombre o apellido…',
        importGymnasts: 'Importar desde Excel de licencias RFEG',
        importTitle: 'Importar gimnastas',
        importFound: (n)=>`${n} gimnasta${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''} en el archivo`,
        importDuplicateNote: (n)=>`${n} ya existen y se omitirán`,
        importDuplicate: 'Ya existe',
        importConfirm: 'Añadir gimnastas',
        importConfirming: 'Guardando…',
        importCancel: 'Cancelar',
        importEmpty: 'No se encontraron gimnastas válidos en el archivo.',
        importDone: (n)=>`${n} gimnasta${n !== 1 ? 's' : ''} añadido${n !== 1 ? 's' : ''}.`,
        licenciaNacional: 'Lic. Nacional',
        firstName: 'Nombre',
        lastName1: 'Primer apellido',
        lastName2: 'Segundo apellido',
        dob: 'Fecha de nacimiento',
        save: 'Guardar',
        cancel: 'Cancelar',
        empty: 'Aún no hay gimnastas. Añade el primero para empezar.',
        yrs: 'años',
        confirmDelete: '¿Eliminar este gimnasta del registro?',
        gymnasts: (n)=>`${n} gimnasta${n !== 1 ? 's' : ''}`,
        licencia: 'Licencia',
        uploadLicencia: 'Subir licencia',
        replaceLicencia: 'Reemplazar',
        removeLicencia: 'Eliminar licencia'
    }
};
function normalizeStr(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
// Column indices (0-based): F=5 Licencia, G=6 Lic.Nac., I=8 Nombre, J=9 Ap1, K=10 Ap2, O=14 DOB
function parseGymnastFile(buffer, existing) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: 'array',
        cellDates: false
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(ws, {
        header: 1,
        defval: ''
    });
    const existingKeys = new Set(existing.map((g)=>`${normalizeStr(g.first_name)}|${normalizeStr(g.last_name_1)}`));
    const result = [];
    for(let i = 1; i < rows.length; i++){
        const row = rows[i];
        const firstName = String(row[8] ?? '').trim();
        const lastName1 = String(row[9] ?? '').trim();
        if (!firstName && !lastName1) continue;
        const lastName2 = String(row[10] ?? '').trim();
        const dob = String(row[14] ?? '').trim();
        const licencia = String(row[5] ?? '').trim();
        const licNac = String(row[6] ?? '').trim();
        const key = `${normalizeStr(firstName)}|${normalizeStr(lastName1)}`;
        result.push({
            _id: crypto.randomUUID(),
            first_name: firstName,
            last_name_1: lastName1,
            last_name_2: lastName2,
            date_of_birth: dob,
            licencia,
            licencia_nacional: licNac,
            isDuplicate: existingKeys.has(key),
            removed: false
        });
    }
    return result;
}
function GymnastImportModal({ lang, rows, onConfirm, onClose }) {
    _s();
    const t = T[lang];
    const inputCls = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
    const [list, setList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(rows);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function update(id, patch) {
        setList((prev)=>prev.map((r)=>r._id === id ? {
                    ...r,
                    ...patch
                } : r));
    }
    const activeCount = list.filter((r)=>!r.removed && !r.isDuplicate).length;
    const dupCount = list.filter((r)=>r.isDuplicate).length;
    async function handleConfirm() {
        setSaving(true);
        const toAdd = list.filter((r)=>!r.removed && !r.isDuplicate).map((r)=>({
                first_name: r.first_name.trim(),
                last_name_1: r.last_name_1.trim(),
                last_name_2: r.last_name_2.trim() || null,
                date_of_birth: r.date_of_birth,
                photo_url: null,
                licencia_url: null
            }));
        await onConfirm(toAdd);
        setSaving(false);
        onClose();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-5 py-4 border-b border-slate-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-bold text-slate-800",
                                    children: t.importTitle
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-400 mt-0.5",
                                    children: [
                                        t.importFound(list.length),
                                        dupCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-amber-500",
                                            children: [
                                                " · ",
                                                t.importDuplicateNote(dupCount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 169,
                                            columnNumber: 32
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-slate-400 hover:text-slate-600 transition-colors",
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
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 174,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "divide-y divide-slate-100 max-h-[60vh] overflow-y-auto",
                    children: list.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-400 text-center py-10",
                        children: t.importEmpty
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 182,
                        columnNumber: 13
                    }, this) : list.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: [
                                'px-5 py-3 flex items-center gap-3',
                                row.removed ? 'opacity-40' : ''
                            ].join(' '),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "shrink-0 w-28 space-y-0.5",
                                    children: [
                                        row.licencia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400 truncate",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium",
                                                    children: [
                                                        t.licencia,
                                                        ":"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 66
                                                }, this),
                                                " ",
                                                row.licencia
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 188,
                                            columnNumber: 19
                                        }, this),
                                        row.licencia_nacional && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400 truncate",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium",
                                                    children: [
                                                        t.licenciaNacional,
                                                        ":"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 66
                                                }, this),
                                                " ",
                                                row.licencia_nacional
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 191,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 186,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: row.first_name,
                                            disabled: row.removed || row.isDuplicate,
                                            onChange: (e)=>update(row._id, {
                                                    first_name: e.target.value
                                                }),
                                            placeholder: T[lang].firstName,
                                            className: inputCls
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 197,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: row.last_name_1,
                                            disabled: row.removed || row.isDuplicate,
                                            onChange: (e)=>update(row._id, {
                                                    last_name_1: e.target.value
                                                }),
                                            placeholder: T[lang].lastName1,
                                            className: inputCls
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 200,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: row.last_name_2,
                                            disabled: row.removed || row.isDuplicate,
                                            onChange: (e)=>update(row._id, {
                                                    last_name_2: e.target.value
                                                }),
                                            placeholder: T[lang].lastName2,
                                            className: inputCls
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: row.date_of_birth,
                                            disabled: row.removed || row.isDuplicate,
                                            onChange: (e)=>update(row._id, {
                                                    date_of_birth: e.target.value
                                                }),
                                            className: inputCls
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "shrink-0 flex items-center gap-2",
                                    children: [
                                        row.isDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full",
                                            children: t.importDuplicate
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 214,
                                            columnNumber: 19
                                        }, this),
                                        !row.isDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>update(row._id, {
                                                    removed: !row.removed
                                                }),
                                            className: [
                                                'p-1 rounded-lg transition-all',
                                                row.removed ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                            ].join(' '),
                                            children: row.removed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                lineNumber: 224,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M6 18L18 6M6 6l12 12"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                    lineNumber: 229,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                lineNumber: 228,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 219,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 212,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, row._id, true, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 184,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-5 py-4 border-t border-slate-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                            children: t.importCancel
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirm,
                            disabled: saving || activeCount === 0,
                            className: "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
                            children: [
                                saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                    lineNumber: 246,
                                    columnNumber: 24
                                }, this),
                                saving ? t.importConfirming : `${t.importConfirm} (${activeCount})`
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 240,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/club/GymnastsTab.tsx",
            lineNumber: 162,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/club/GymnastsTab.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_s(GymnastImportModal, "YnTi9SnLXhh55cpKZOWA2TjxeaI=");
_c = GymnastImportModal;
function computeAge(dob) {
    const today = new Date();
    const birth = new Date(dob + 'T00:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;
    return age;
}
function gymnastFullName(g) {
    return [
        g.first_name,
        g.last_name_1,
        g.last_name_2
    ].filter(Boolean).join(' ');
}
// ─── photo avatar ─────────────────────────────────────────────────────────────
function PhotoAvatar({ photoUrl, initials, size = 'md', onUpload }) {
    _s1();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative shrink-0 ${dim}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${dim} rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-500 overflow-hidden`,
                children: photoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: photoUrl,
                    alt: "",
                    className: "w-full h-full object-cover"
                }, void 0, false, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 283,
                    columnNumber: 13
                }, this) : initials
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 281,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>ref.current?.click(),
                className: "absolute inset-0 rounded-full bg-black/0 hover:bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-3 h-3 text-white drop-shadow",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 2.5,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 291,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 292,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 290,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e)=>{
                    const f = e.target.files?.[0];
                    if (f) {
                        onUpload(f);
                        e.target.value = '';
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 295,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/GymnastsTab.tsx",
        lineNumber: 280,
        columnNumber: 5
    }, this);
}
_s1(PhotoAvatar, "QMBuJFIdzLIeqBcFwhMf246mjOM=");
_c1 = PhotoAvatar;
;
function LicenciaChip({ url, onUpload, onRemove, labels }) {
    _s2();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-1 shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>url ? window.open(url, '_blank') : ref.current?.click(),
                className: [
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all',
                    url ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500'
                ].join(' '),
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
                            d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 328,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this),
                    url ? labels.view : labels.upload
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 317,
                columnNumber: 7
            }, this),
            url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>ref.current?.click(),
                        title: labels.replace,
                        className: "p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-3.5 h-3.5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 337,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 336,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onRemove,
                        title: labels.remove,
                        className: "p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",
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
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 343,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 342,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                type: "file",
                accept: ".pdf,application/pdf",
                className: "hidden",
                onChange: (e)=>{
                    const f = e.target.files?.[0];
                    if (f) {
                        onUpload(f);
                        e.target.value = '';
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 348,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/GymnastsTab.tsx",
        lineNumber: 316,
        columnNumber: 5
    }, this);
}
_s2(LicenciaChip, "QMBuJFIdzLIeqBcFwhMf246mjOM=");
_c2 = LicenciaChip;
const EMPTY_FORM = {
    first_name: '',
    last_name_1: '',
    last_name_2: '',
    date_of_birth: ''
};
function GymnastForm({ lang, initial, onSave, onCancel }) {
    _s3();
    const t = T[lang];
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial);
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name_1.trim() || !form.date_of_birth) return;
        onSave({
            first_name: form.first_name.trim(),
            last_name_1: form.last_name_1.trim(),
            last_name_2: form.last_name_2.trim(),
            date_of_birth: form.date_of_birth
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: [
                                    t.firstName,
                                    " *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                required: true,
                                value: form.first_name,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            first_name: e.target.value
                                        })),
                                className: inputCls,
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 380,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 378,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: [
                                    t.lastName1,
                                    " *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 383,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                required: true,
                                value: form.last_name_1,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            last_name_1: e.target.value
                                        })),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 384,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 382,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: t.lastName2
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 387,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: form.last_name_2,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            last_name_2: e.target.value
                                        })),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 388,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 386,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 377,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500 mb-1",
                        children: [
                            t.dob,
                            " *"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        required: true,
                        value: form.date_of_birth,
                        onChange: (e)=>setForm((f)=>({
                                    ...f,
                                    date_of_birth: e.target.value
                                })),
                        className: inputCls
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 393,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 391,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 396,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all",
                        children: t.save
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 400,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 395,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/GymnastsTab.tsx",
        lineNumber: 376,
        columnNumber: 5
    }, this);
}
_s3(GymnastForm, "L4Fb6TJsGR3l7Qk08iW2QeDchOQ=");
_c3 = GymnastForm;
function GymnastsTab({ lang, gymnasts, onAdd, onAddBulk, onUpdate, onDelete, onUploadPhoto, onUploadLicencia, onRemoveLicencia }) {
    _s4();
    const t = T[lang];
    const licenciaLabels = {
        view: t.licencia,
        upload: t.uploadLicencia,
        replace: t.replaceLicencia,
        remove: t.removeLicencia
    };
    const [showAdd, setShowAdd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [importRows, setImportRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const importFileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{
            const buf = ev.target?.result;
            if (buf instanceof ArrayBuffer) {
                const rows = parseGymnastFile(buf, gymnasts);
                setImportRows(rows);
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    }
    const sorted = [
        ...gymnasts
    ].sort((a, b)=>(a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''));
    const q = normalizeStr(search);
    const filtered = q ? sorted.filter((g)=>normalizeStr(gymnastFullName(g)).includes(q)) : sorted;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-500",
                        children: t.gymnasts(gymnasts.length)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 456,
                        columnNumber: 9
                    }, this),
                    !showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>importFileRef.current?.click(),
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
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 462,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 461,
                                        columnNumber: 15
                                    }, this),
                                    t.importGymnasts
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 459,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: importFileRef,
                                type: "file",
                                accept: ".xlsx,.xls,.ods,.csv",
                                className: "hidden",
                                onChange: handleImportFile
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 466,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAdd(true),
                                className: "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 470,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 469,
                                        columnNumber: 15
                                    }, this),
                                    t.addGymnast
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 467,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 458,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 455,
                columnNumber: 7
            }, this),
            importRows !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GymnastImportModal, {
                lang: lang,
                rows: importRows,
                onConfirm: onAddBulk,
                onClose: ()=>setImportRows(null)
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 479,
                columnNumber: 9
            }, this),
            gymnasts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                            lineNumber: 490,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 489,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value),
                        placeholder: t.search,
                        className: "w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 492,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 488,
                columnNumber: 9
            }, this),
            showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GymnastForm, {
                    lang: lang,
                    initial: EMPTY_FORM,
                    onCancel: ()=>setShowAdd(false),
                    onSave: (f)=>{
                        onAdd({
                            ...f,
                            photo_url: null
                        });
                        setShowAdd(false);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/club/GymnastsTab.tsx",
                    lineNumber: 504,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 503,
                columnNumber: 9
            }, this),
            filtered.length === 0 && !showAdd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-16",
                children: t.empty
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 511,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: filtered.map((g)=>editingId === g.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GymnastForm, {
                        lang: lang,
                        initial: {
                            first_name: g.first_name,
                            last_name_1: g.last_name_1,
                            last_name_2: g.last_name_2 ?? '',
                            date_of_birth: g.date_of_birth
                        },
                        onCancel: ()=>setEditingId(null),
                        onSave: (f)=>{
                            onUpdate(g.id, {
                                ...f,
                                photo_url: g.photo_url
                            });
                            setEditingId(null);
                        }
                    }, g.id, false, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 516,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PhotoAvatar, {
                                photoUrl: g.photo_url,
                                initials: `${g.first_name[0]}${g.last_name_1[0]}`,
                                onUpload: (file)=>onUploadPhoto(g.id, file)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 522,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-slate-800",
                                        children: gymnastFullName(g)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 528,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400",
                                        children: [
                                            new Date(g.date_of_birth + 'T00:00:00').toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }),
                                            ' · ',
                                            computeAge(g.date_of_birth),
                                            " ",
                                            t.yrs
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 529,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 527,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LicenciaChip, {
                                url: g.licencia_url,
                                onUpload: (file)=>onUploadLicencia(g.id, file),
                                onRemove: ()=>onRemoveLicencia(g.id),
                                labels: licenciaLabels
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 535,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setEditingId(g.id),
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
                                                d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                lineNumber: 545,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 544,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 542,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (confirm(t.confirmDelete)) onDelete(g.id);
                                        },
                                        className: "p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                                lineNumber: 551,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                            lineNumber: 550,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                        lineNumber: 548,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                                lineNumber: 541,
                                columnNumber: 17
                            }, this)
                        ]
                    }, g.id, true, {
                        fileName: "[project]/src/components/club/GymnastsTab.tsx",
                        lineNumber: 521,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/club/GymnastsTab.tsx",
                lineNumber: 513,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/GymnastsTab.tsx",
        lineNumber: 454,
        columnNumber: 5
    }, this);
}
_s4(GymnastsTab, "1I5aNTaSVHrSgdPfTNLq96Xl+a8=");
_c4 = GymnastsTab;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "GymnastImportModal");
__turbopack_context__.k.register(_c1, "PhotoAvatar");
__turbopack_context__.k.register(_c2, "LicenciaChip");
__turbopack_context__.k.register(_c3, "GymnastForm");
__turbopack_context__.k.register(_c4, "GymnastsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/club/CoachesTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CoachesTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/GymnastsTab.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        add: 'Add coach',
        search: 'Search by name…',
        fullName: 'Full name',
        licence: 'Licence no.',
        save: 'Save',
        cancel: 'Cancel',
        empty: 'No coaches yet. Add the first one to get started.',
        coaches: (n)=>`${n} coach${n !== 1 ? 'es' : ''}`,
        confirmDelete: 'Remove this coach?',
        licencia: 'Licence',
        uploadLicencia: 'Upload licence',
        replaceLicencia: 'Replace'
    },
    es: {
        add: 'Añadir entrenador',
        search: 'Buscar por nombre…',
        fullName: 'Nombre completo',
        licence: 'Nº de licencia',
        save: 'Guardar',
        cancel: 'Cancelar',
        empty: 'Aún no hay entrenadores. Añade el primero para empezar.',
        coaches: (n)=>`${n} entrenador${n !== 1 ? 'es' : ''}`,
        confirmDelete: '¿Eliminar este entrenador?',
        licencia: 'Licencia',
        uploadLicencia: 'Subir licencia',
        replaceLicencia: 'Reemplazar'
    }
};
function normalizeStr(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
// ─── licencia chip ────────────────────────────────────────────────────────────
function LicenciaChip({ url, onUpload, labels }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-1 shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>url ? window.open(url, '_blank') : ref.current?.click(),
                className: [
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all',
                    url ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500'
                ].join(' '),
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
                            d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CoachesTab.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    url ? labels.view : labels.upload
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>ref.current?.click(),
                title: labels.replace,
                className: "p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-3.5 h-3.5",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/club/CoachesTab.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: ref,
                type: "file",
                accept: ".pdf,application/pdf",
                className: "hidden",
                onChange: (e)=>{
                    const f = e.target.files?.[0];
                    if (f) {
                        onUpload(f);
                        e.target.value = '';
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CoachesTab.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_s(LicenciaChip, "QMBuJFIdzLIeqBcFwhMf246mjOM=");
_c = LicenciaChip;
const EMPTY_FORM = {
    full_name: '',
    licence: ''
};
function CoachForm({ lang, initial, onSave, onCancel }) {
    _s1();
    const t = T[lang];
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial);
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.full_name.trim()) return;
        onSave({
            full_name: form.full_name.trim(),
            licence: form.licence.trim()
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: [
                                    t.fullName,
                                    " *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                required: true,
                                value: form.full_name,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            full_name: e.target.value
                                        })),
                                className: inputCls,
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: t.licence
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: form.licence,
                                onChange: (e)=>setForm((f)=>({
                                            ...f,
                                            licence: e.target.value
                                        })),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all",
                        children: t.save
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CoachesTab.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_s1(CoachForm, "L4Fb6TJsGR3l7Qk08iW2QeDchOQ=");
_c1 = CoachForm;
function CoachesTab({ lang, coaches, onAdd, onUpdate, onDelete, onUploadPhoto, onUploadLicencia }) {
    _s2();
    const t = T[lang];
    const licenciaLabels = {
        view: t.licencia,
        upload: t.uploadLicencia,
        replace: t.replaceLicencia
    };
    const [showAdd, setShowAdd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const sorted = [
        ...coaches
    ].sort((a, b)=>a.full_name.localeCompare(b.full_name));
    const q = normalizeStr(search);
    const filtered = q ? sorted.filter((c)=>normalizeStr(c.full_name).includes(q)) : sorted;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-500",
                        children: t.coaches(coaches.length)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    !showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowAdd(true),
                        className: "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
                                    fileName: "[project]/src/components/club/CoachesTab.tsx",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, this),
                            t.add
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            coaches.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CoachesTab.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value),
                        placeholder: t.search,
                        className: "w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 177,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 172,
                columnNumber: 9
            }, this),
            showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CoachForm, {
                    lang: lang,
                    initial: EMPTY_FORM,
                    onCancel: ()=>setShowAdd(false),
                    onSave: (f)=>{
                        onAdd({
                            full_name: f.full_name,
                            licence: f.licence || null,
                            photo_url: null
                        });
                        setShowAdd(false);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/club/CoachesTab.tsx",
                    lineNumber: 185,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 184,
                columnNumber: 9
            }, this),
            filtered.length === 0 && !showAdd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-16",
                children: t.empty
            }, void 0, false, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 192,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: filtered.map((c)=>editingId === c.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CoachForm, {
                        lang: lang,
                        initial: {
                            full_name: c.full_name,
                            licence: c.licence ?? ''
                        },
                        onCancel: ()=>setEditingId(null),
                        onSave: (f)=>{
                            onUpdate(c.id, {
                                full_name: f.full_name,
                                licence: f.licence || null,
                                photo_url: c.photo_url
                            });
                            setEditingId(null);
                        }
                    }, c.id, false, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 197,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PhotoAvatar"], {
                                photoUrl: c.photo_url,
                                initials: c.full_name.charAt(0).toUpperCase(),
                                onUpload: (file)=>onUploadPhoto(c.id, file)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 203,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-slate-800 truncate",
                                        children: c.full_name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                                        lineNumber: 209,
                                        columnNumber: 19
                                    }, this),
                                    c.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400",
                                        children: c.licence
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                                        lineNumber: 210,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 208,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LicenciaChip, {
                                url: c.licencia_url,
                                onUpload: (file)=>onUploadLicencia(c.id, file),
                                labels: licenciaLabels
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 212,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setEditingId(c.id),
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
                                                d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                                lineNumber: 221,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CoachesTab.tsx",
                                            lineNumber: 220,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                                        lineNumber: 218,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            if (confirm(t.confirmDelete)) onDelete(c.id);
                                        },
                                        className: "p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                                lineNumber: 227,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CoachesTab.tsx",
                                            lineNumber: 226,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                                        lineNumber: 224,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CoachesTab.tsx",
                                lineNumber: 217,
                                columnNumber: 17
                            }, this)
                        ]
                    }, c.id, true, {
                        fileName: "[project]/src/components/club/CoachesTab.tsx",
                        lineNumber: 202,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/club/CoachesTab.tsx",
                lineNumber: 194,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CoachesTab.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
_s2(CoachesTab, "HTaMU10LfhFpvQaleVdhn1AnXI0=");
_c2 = CoachesTab;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "LicenciaChip");
__turbopack_context__.k.register(_c1, "CoachForm");
__turbopack_context__.k.register(_c2, "CoachesTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/components/club/TeamsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamsTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/GymnastsTab.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const T = {
    en: {
        addTeam: 'Add team',
        category: 'Category',
        ageGroup: 'Age group',
        gymnast: (n)=>`Gymnast ${n}`,
        save: 'Save',
        cancel: 'Cancel',
        empty: 'No teams yet.',
        noGymnasts: 'Add at least 2 gymnasts to your roster before creating a team.',
        confirmDelete: 'Remove this team?',
        selectCategory: 'Select category',
        selectAgeGroup: 'Select age group',
        selectGymnast: '— select gymnast —'
    },
    es: {
        addTeam: 'Añadir equipo',
        category: 'Categoría',
        ageGroup: 'Grupo de edad',
        gymnast: (n)=>`Gimnasta ${n}`,
        save: 'Guardar',
        cancel: 'Cancelar',
        empty: 'Aún no hay equipos.',
        noGymnasts: 'Añade al menos 2 gimnastas antes de crear un equipo.',
        confirmDelete: '¿Eliminar este equipo?',
        selectCategory: 'Seleccionar categoría',
        selectAgeGroup: 'Seleccionar grupo de edad',
        selectGymnast: '— seleccionar gimnasta —'
    }
};
// Uses birth year only (not exact date) so birthday month doesn't affect eligibility
function birthYear(g) {
    return parseInt(g.date_of_birth.slice(0, 4), 10);
}
function gymAgeThisYear(g) {
    return new Date().getFullYear() - birthYear(g);
}
function ageRangeStr(rule) {
    return rule.max_age != null ? `${rule.min_age}–${rule.max_age}` : `${rule.min_age}+`;
}
// Build gymnast_display from selected gymnasts: "Fernández García / Ruiz López"
function buildDisplay(gymnasts, ids) {
    return ids.map((id)=>gymnasts.find((g)=>g.id === id)).filter(Boolean).map((g)=>[
            g.first_name,
            g.last_name_1
        ].filter(Boolean).join(' ')).join(' / ');
}
const EMPTY_FORM = {
    category: '',
    age_group: '',
    gymnast_ids: []
};
function TeamForm({ lang, gymnasts, ageGroupRules, agLabels, usedInOtherTeams, initial, onSave, onCancel }) {
    _s();
    const t = T[lang];
    function getCategoriesForAgeGroup(ageGroupId) {
        if (!ageGroupId) return [] // hide category until age group is chosen
        ;
        const rule = ageGroupRules.find((r)=>r.id === ageGroupId);
        if (!rule) return [];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoriesForRuleset"])(rule.age_group);
    }
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TeamForm.useState": ()=>{
            const cats = getCategoriesForAgeGroup(initial.age_group);
            const cat = initial.category && cats.includes(initial.category) ? initial.category : '';
            return {
                ...initial,
                category: cat
            };
        }
    }["TeamForm.useState"]);
    const availableCategories = getCategoriesForAgeGroup(form.age_group);
    const slotCount = form.category ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_SIZE"][form.category] ?? 2 : 2;
    // ensure gymnast_ids array has exactly slotCount entries (pad with '' or trim)
    const slots = Array.from({
        length: slotCount
    }, (_, i)=>form.gymnast_ids[i] ?? '');
    function setSlot(idx, value) {
        setForm((f)=>{
            const next = Array.from({
                length: slotCount
            }, (_, i)=>f.gymnast_ids[i] ?? '');
            next[idx] = value;
            return {
                ...f,
                gymnast_ids: next
            };
        });
    }
    // when age group changes, recompute available categories and reset category + slots
    function setAgeGroup(ageGroupId) {
        setForm((f)=>({
                ...f,
                age_group: ageGroupId,
                category: '',
                gymnast_ids: []
            }));
    }
    // when category changes, reset slots
    function setCategory(cat) {
        setForm((f)=>({
                ...f,
                category: cat,
                gymnast_ids: []
            }));
    }
    // Age validation: get the selected rule's min/max age
    const selectedRule = ageGroupRules.find((r)=>r.id === form.age_group);
    function isAgeEligible(g) {
        if (!selectedRule) return true;
        // Year-based only: birth year determines eligibility, birthday month is irrelevant
        const age = new Date().getFullYear() - birthYear(g);
        if (age < selectedRule.min_age) return false;
        if (selectedRule.max_age !== null && age > selectedRule.max_age) return false;
        return true;
    }
    const isComplete = form.category && form.age_group && slots.every((s)=>s !== '');
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const sortedGymnasts = [
        ...gymnasts
    ].sort((a, b)=>(a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''));
    function handleSubmit(e) {
        e.preventDefault();
        if (!isComplete) return;
        onSave({
            ...form,
            gymnast_ids: slots,
            gymnast_display: buildDisplay(gymnasts, slots)
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500 mb-1",
                        children: [
                            t.ageGroup,
                            " *"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        required: true,
                        value: form.age_group,
                        onChange: (e)=>setAgeGroup(e.target.value),
                        className: inputCls,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t.selectAgeGroup
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            ageGroupRules.map((rule)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: rule.id,
                                    children: [
                                        agLabels[rule.id] ?? rule.age_group,
                                        " (",
                                        ageRangeStr(rule),
                                        ")"
                                    ]
                                }, rule.id, true, {
                                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            form.age_group && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-xs font-medium text-slate-500 mb-1",
                        children: [
                            t.category,
                            " *"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 157,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        required: true,
                        value: form.category,
                        onChange: (e)=>setCategory(e.target.value),
                        className: inputCls,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t.selectCategory
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                lineNumber: 159,
                                columnNumber: 13
                            }, this),
                            availableCategories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: c,
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.[c] ?? c
                                }, c, false, {
                                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                                    lineNumber: 161,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this),
            form.age_group && form.category && slots.map((selectedId, idx)=>{
                // show all gymnasts not used elsewhere / not in another slot; disable ineligible by age
                const candidates = sortedGymnasts.filter((g)=>!usedInOtherTeams.has(g.id) && !slots.some((s, j)=>j !== idx && s === g.id));
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-xs font-medium text-slate-500 mb-1",
                            children: [
                                t.gymnast(idx + 1),
                                " *"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/TeamsTab.tsx",
                            lineNumber: 176,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            required: true,
                            value: selectedId,
                            onChange: (e)=>setSlot(idx, e.target.value),
                            className: inputCls,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: t.selectGymnast
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this),
                                candidates.map((g)=>{
                                    const eligible = isAgeEligible(g);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: g.id,
                                        disabled: !eligible,
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["gymnastFullName"])(g),
                                            " (",
                                            gymAgeThisYear(g),
                                            ")",
                                            !eligible ? ' ✕' : ''
                                        ]
                                    }, g.id, true, {
                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                        lineNumber: 182,
                                        columnNumber: 19
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/TeamsTab.tsx",
                            lineNumber: 177,
                            columnNumber: 13
                        }, this)
                    ]
                }, idx, true, {
                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                    lineNumber: 175,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end gap-2 pt-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: !isComplete,
                        className: "px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
                        children: t.save
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/TeamsTab.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_s(TeamForm, "+r8njOu8FANebnxSERYYrM9ibZM=");
_c = TeamForm;
function TeamsTab({ lang, gymnasts, teams, ageGroupRules, agLabels, onAdd, onUpdate, onDelete, onUploadPhoto }) {
    _s1();
    const t = T[lang];
    const [showAdd, setShowAdd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    if (gymnasts.length < 2 && teams.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-slate-400 text-center py-16",
            children: t.noGymnasts
        }, void 0, false, {
            fileName: "[project]/src/components/club/TeamsTab.tsx",
            lineNumber: 225,
            columnNumber: 12
        }, this);
    }
    // gymnasts used in any existing team
    const allUsed = new Set(teams.flatMap((t)=>t.gymnast_ids ?? []));
    // gymnasts used in teams other than the one being edited
    function usedExcluding(teamId) {
        return new Set(teams.filter((t)=>t.id !== teamId).flatMap((t)=>t.gymnast_ids ?? []));
    }
    const grouped = teams.reduce((acc, team)=>{
        ;
        (acc[team.category] ??= []).push(team);
        return acc;
    }, {});
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-500",
                        children: [
                            teams.length,
                            " team",
                            teams.length !== 1 ? 's' : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this),
                    !showAdd && !editingId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowAdd(true),
                        className: "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
                                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                                    lineNumber: 248,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                lineNumber: 247,
                                columnNumber: 13
                            }, this),
                            t.addTeam
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamForm, {
                    lang: lang,
                    gymnasts: gymnasts,
                    ageGroupRules: ageGroupRules,
                    agLabels: agLabels,
                    usedInOtherTeams: allUsed,
                    initial: EMPTY_FORM,
                    onCancel: ()=>setShowAdd(false),
                    onSave: (f)=>{
                        onAdd(f);
                        setShowAdd(false);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/club/TeamsTab.tsx",
                    lineNumber: 257,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 256,
                columnNumber: 9
            }, this),
            teams.length === 0 && !showAdd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-16",
                children: t.empty
            }, void 0, false, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 265,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: Object.entries(grouped).map(([category, catTeams])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.[category] ?? category
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                lineNumber: 270,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: catTeams.map((team)=>editingId === team.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamForm, {
                                        lang: lang,
                                        gymnasts: gymnasts,
                                        ageGroupRules: ageGroupRules,
                                        agLabels: agLabels,
                                        usedInOtherTeams: usedExcluding(team.id),
                                        initial: {
                                            category: team.category,
                                            age_group: team.age_group,
                                            gymnast_ids: team.gymnast_ids ?? []
                                        },
                                        onCancel: ()=>setEditingId(null),
                                        onSave: (f)=>{
                                            onUpdate(team.id, f);
                                            setEditingId(null);
                                        }
                                    }, team.id, false, {
                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                        lineNumber: 276,
                                        columnNumber: 21
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PhotoAvatar"], {
                                                photoUrl: team.photo_url,
                                                initials: team.gymnast_display.charAt(0),
                                                size: "md",
                                                onUpload: (file)=>onUploadPhoto(team.id, file)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                lineNumber: 284,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-slate-800",
                                                        children: team.gymnast_display
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                        lineNumber: 291,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-400",
                                                        children: [
                                                            agLabels[team.age_group] ?? team.age_group,
                                                            " · ",
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORY_LABELS"][lang]?.[team.category] ?? team.category
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                lineNumber: 290,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1 shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setEditingId(team.id),
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
                                                                d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                                lineNumber: 300,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                            lineNumber: 299,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (confirm(t.confirmDelete)) onDelete(team.id);
                                                        },
                                                        className: "p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-4 h-4",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            strokeWidth: 2,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                                lineNumber: 306,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                                lineNumber: 296,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, team.id, true, {
                                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                                        lineNumber: 283,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/TeamsTab.tsx",
                                lineNumber: 273,
                                columnNumber: 15
                            }, this)
                        ]
                    }, category, true, {
                        fileName: "[project]/src/components/club/TeamsTab.tsx",
                        lineNumber: 269,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/club/TeamsTab.tsx",
                lineNumber: 267,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/TeamsTab.tsx",
        lineNumber: 241,
        columnNumber: 5
    }, this);
}
_s1(TeamsTab, "Ii5hxqdB5Q+/8YSZlih+9sVXiiE=");
_c1 = TeamsTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "TeamForm");
__turbopack_context__.k.register(_c1, "TeamsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/club/CompetitionsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompetitionsTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
'use client';
;
// ─── translations ─────────────────────────────────────────────────────────────
const T = {
    en: {
        empty: 'No competitions available yet.',
        back: 'Competitions',
        register: 'Register',
        registered: 'Registered',
        dropout: 'Dropout',
        toggleDropout: 'Declare dropout',
        undoDropout: 'Undo dropout',
        dorsal: 'Dorsal',
        registrationClosed: 'Registration closed',
        noEligibleTeams: 'None of your teams match the age groups of this competition.',
        noTeams: 'Create teams first to be able to register.',
        teamsTitle: 'Your teams',
        deadline: 'Entry deadline',
        tsMusicDeadline: 'TS & Music deadline',
        filesLocked: 'File upload closed',
        music: 'Music',
        ts: 'TS',
        noFile: 'No file',
        replace: 'Replace',
        upload: 'Upload',
        coachesTitle: 'Coaches',
        registerCoach: 'Register',
        unregisterCoach: 'Remove',
        noCoaches: 'No coaches registered for this competition.',
        noCoachesInClub: 'Add coaches in the Coaches tab first.',
        judgesTitle: 'Judges',
        nominate: 'Nominate',
        nominated: 'Nominated',
        removeNomination: 'Remove',
        noJudges: 'No judges nominated yet.',
        judgesWarning: 'At least 1 judge must be nominated for this competition.',
        addFromPool: '+ Add from pool',
        inviteNew: '+ Invite new judge',
        noPoolJudges: 'No other judges available in the pool.',
        searchJudges: 'Search judges…',
        // invite form
        inviteJudge: 'Invite new judge',
        name: 'Full name',
        email: 'Email',
        phone: 'Phone',
        licence: 'Licence no.',
        send: 'Send invitation',
        cancel: 'Cancel',
        inviteSent: 'Invitation sent to',
        inviteInfo: 'The judge will receive an email to set up their account.',
        status: {
            draft: 'Draft',
            registration_open: 'Open',
            registration_closed: 'Closed',
            active: 'Live',
            finished: 'Finished'
        },
        teamCount: (n)=>n === 0 ? 'Not registered' : `${n} team${n !== 1 ? 's' : ''} registered`,
        licenciaWarning: 'Missing licencia',
        licenciaWarningFull: 'One or more gymnasts in this team have no licencia uploaded.'
    },
    es: {
        empty: 'Aún no hay competiciones disponibles.',
        back: 'Competiciones',
        register: 'Inscribir',
        registered: 'Inscrito',
        dropout: 'Baja',
        toggleDropout: 'Declarar baja',
        undoDropout: 'Deshacer baja',
        dorsal: 'Dorsal',
        registrationClosed: 'Inscripción cerrada',
        noEligibleTeams: 'Ningún equipo coincide con los grupos de edad de esta competición.',
        noTeams: 'Crea equipos primero para poder inscribirte.',
        teamsTitle: 'Tus equipos',
        deadline: 'Inscripción hasta',
        tsMusicDeadline: 'Plazo de TS y música',
        filesLocked: 'Entrega de archivos cerrada',
        music: 'Música',
        ts: 'TS',
        noFile: 'Sin archivo',
        replace: 'Reemplazar',
        upload: 'Subir',
        coachesTitle: 'Entrenadores',
        registerCoach: 'Inscribir',
        unregisterCoach: 'Quitar',
        noCoaches: 'Ningún entrenador inscrito en esta competición.',
        noCoachesInClub: 'Añade entrenadores en la pestaña Entrenadores primero.',
        judgesTitle: 'Jueces',
        nominate: 'Nominar',
        nominated: 'Nominado',
        removeNomination: 'Quitar',
        noJudges: 'Aún no hay jueces nominados.',
        judgesWarning: 'Debes nominar al menos 1 juez para esta competición.',
        addFromPool: '+ Añadir del pool',
        inviteNew: '+ Invitar nuevo juez',
        noPoolJudges: 'No hay otros jueces disponibles en el pool.',
        searchJudges: 'Buscar jueces…',
        // invite form
        inviteJudge: 'Invitar nuevo juez',
        name: 'Nombre completo',
        email: 'Email',
        phone: 'Teléfono',
        licence: 'Nº licencia',
        send: 'Enviar invitación',
        cancel: 'Cancelar',
        inviteSent: 'Invitación enviada a',
        inviteInfo: 'El juez recibirá un email para crear su cuenta.',
        status: {
            draft: 'Borrador',
            registration_open: 'Abierta',
            registration_closed: 'Cerrada',
            active: 'En vivo',
            finished: 'Finalizada'
        },
        teamCount: (n)=>n === 0 ? 'Sin inscripción' : `${n} equipo${n !== 1 ? 's' : ''} inscrito${n !== 1 ? 's' : ''}`,
        licenciaWarning: 'Licencia pendiente',
        licenciaWarningFull: 'Uno o más gimnastas de este equipo no tienen la licencia subida.'
    }
};
const STATUS_BADGE = {
    draft: 'bg-slate-100 text-slate-500',
    registration_open: 'bg-green-100 text-green-700',
    registration_closed: 'bg-amber-100 text-amber-700',
    active: 'bg-blue-600 text-white',
    finished: 'bg-slate-100 text-slate-400'
};
// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDateRange(start, end) {
    const fmt = (d)=>new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return fmt(start);
    if (end) return fmt(end);
    return '';
}
function formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}
// ─── compact file chip ────────────────────────────────────────────────────────
function FileChip({ label, filename, accept, locked, onUpload, onRemove, onPreview }) {
    _s();
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function handleChange(e) {
        const file = e.target.files?.[0];
        if (file) onUpload(file);
        if (inputRef.current) inputRef.current.value = '';
    }
    const displayName = filename ? decodeURIComponent(filename.split('/').pop() ?? filename) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex items-center gap-1 min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold text-slate-400",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            displayName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1 bg-green-50 border border-green-200 rounded-full pl-2 pr-1 py-0.5 max-w-[140px]",
                children: [
                    onPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onPreview,
                        className: "text-xs text-green-700 truncate hover:underline underline-offset-2 text-left",
                        children: displayName
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 174,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-green-700 truncate",
                        children: displayName
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 178,
                        columnNumber: 13
                    }, this),
                    !locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onRemove,
                        className: "text-green-400 hover:text-red-500 transition-colors ml-0.5 shrink-0 leading-none",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 181,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 172,
                columnNumber: 9
            }, this) : locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-slate-300 border border-dashed border-slate-200 rounded-full px-2 py-0.5",
                children: "—"
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 185,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>inputRef.current?.click(),
                className: "text-xs text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded-full px-2 py-0.5 transition-all",
                children: "+ upload"
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 187,
                columnNumber: 9
            }, this),
            !locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: inputRef,
                type: "file",
                accept: accept,
                className: "hidden",
                onChange: handleChange
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 192,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 169,
        columnNumber: 5
    }, this);
}
_s(FileChip, "iD9XNNsNOlNDckBemnvlLS+aHYk=");
_c = FileChip;
// ─── pdf viewer modal ─────────────────────────────────────────────────────────
function PDFViewerModal({ url, title, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex flex-col bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors",
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
                                    d: "M15 19l-7-7 7-7"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this),
                            "Volver"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-slate-300",
                        children: "|"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-semibold text-slate-700 truncate flex-1",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2",
                        children: "Abrir en nueva pestaña"
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: url,
                className: "flex-1 w-full border-0",
                title: title
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 201,
        columnNumber: 5
    }, this);
}
_c1 = PDFViewerModal;
// ─── music player modal ───────────────────────────────────────────────────────
function MusicPlayerModal({ url, title, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 px-4 py-3 border-b border-slate-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 text-slate-500",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 240,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 238,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-semibold text-slate-700 truncate flex-1",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 243,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-slate-400 hover:text-slate-600 transition-colors shrink-0",
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
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 246,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                        controls: true,
                        autoPlay: true,
                        className: "w-full",
                        src: url,
                        children: "Your browser does not support the audio element."
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 252,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
            lineNumber: 235,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 234,
        columnNumber: 5
    }, this);
}
_c2 = MusicPlayerModal;
// ─── routine row ──────────────────────────────────────────────────────────────
function RoutineRow({ lang, routineType, record, locked, reviewStatus, reviewComment, onSet }) {
    _s1();
    const t = T[lang];
    const [tsPreviewUrl, setTsPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [musicPreviewUrl, setMusicPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-2 border-t border-slate-100 first:border-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-16 shrink-0 text-xs font-semibold text-slate-600",
                                children: routineType
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 281,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FileChip, {
                                label: t.ts,
                                filename: record?.ts_filename,
                                accept: ".pdf,application/pdf",
                                locked: locked && reviewStatus !== 'incorrect',
                                onPreview: record?.ts_filename ? ()=>setTsPreviewUrl(record.ts_filename) : undefined,
                                onUpload: (file)=>onSet('ts', file),
                                onRemove: ()=>onSet('ts', null)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 282,
                                columnNumber: 11
                            }, this),
                            reviewStatus === 'checked' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-emerald-600 flex items-center gap-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3 h-3",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 3,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M5 13l4 4L19 7"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 291,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, this),
                                    lang === 'es' ? 'Revisada' : 'Reviewed'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FileChip, {
                                label: t.music,
                                filename: record?.music_filename,
                                accept: "audio/*,.mp3,.wav,.aac,.m4a",
                                locked: locked,
                                onPreview: record?.music_filename ? ()=>setMusicPreviewUrl(record.music_filename) : undefined,
                                onUpload: (file)=>onSet('music', file),
                                onRemove: ()=>onSet('music', null)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 296,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, this),
                    reviewStatus === 'incorrect' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 ml-16 px-3 py-2 bg-red-50 border border-red-200 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-red-700 mb-0.5",
                                children: lang === 'es' ? 'TS marcada como incorrecta por el juez DJ:' : 'TS marked as incorrect by DJ judge:'
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 305,
                                columnNumber: 13
                            }, this),
                            reviewComment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-600 leading-snug",
                                children: reviewComment
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 309,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-400 mt-1",
                                children: lang === 'es' ? 'Sube una nueva TS para corregirla.' : 'Upload a new TS to correct it.'
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 311,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 304,
                        columnNumber: 11
                    }, this),
                    reviewStatus === 'new_ts' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-blue-500 ml-16 mt-1",
                        children: lang === 'es' ? 'Nueva TS enviada — pendiente de revisión por el juez.' : 'New TS sent — pending DJ review.'
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 317,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            tsPreviewUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PDFViewerModal, {
                url: tsPreviewUrl,
                title: `${routineType} — TS`,
                onClose: ()=>setTsPreviewUrl(null)
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 323,
                columnNumber: 9
            }, this),
            musicPreviewUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MusicPlayerModal, {
                url: musicPreviewUrl,
                title: `${routineType} — Music`,
                onClose: ()=>setMusicPreviewUrl(null)
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 330,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s1(RoutineRow, "MvblgJw+TdBFdEUN2UaYqHuTNM4=");
_c3 = RoutineRow;
const EMPTY_INVITE = {
    full_name: '',
    email: '',
    phone: '',
    licence: ''
};
function InviteJudgeForm({ lang, onSend, onCancel }) {
    _s2();
    const t = T[lang];
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_INVITE);
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sent, setSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    function set(k, v) {
        setForm((f)=>({
                ...f,
                [k]: v
            }));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.full_name.trim() || !form.email.trim()) return;
        setSending(true);
        setError(null);
        try {
            await onSend({
                ...form,
                full_name: form.full_name.trim(),
                email: form.email.trim()
            });
            setSent(form.email.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally{
            setSending(false);
        }
    }
    if (sent) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-semibold text-green-800",
                    children: [
                        t.inviteSent,
                        " ",
                        sent
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 376,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-green-700",
                    children: t.inviteInfo
                }, void 0, false, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 377,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onCancel,
                        className: "px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 379,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 378,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
            lineNumber: 375,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sm:col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: [
                                    t.name,
                                    " *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 392,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                required: true,
                                value: form.full_name,
                                onChange: (e)=>set('full_name', e.target.value),
                                className: inputCls,
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 393,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 391,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sm:col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: [
                                    t.email,
                                    " *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 396,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "email",
                                required: true,
                                value: form.email,
                                onChange: (e)=>set('email', e.target.value),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 397,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: t.phone
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 400,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "tel",
                                value: form.phone,
                                onChange: (e)=>set('phone', e.target.value),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 401,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 399,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-xs font-medium text-slate-500 mb-1",
                                children: t.licence
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 404,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: form.licence,
                                onChange: (e)=>set('licence', e.target.value),
                                className: inputCls
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 405,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 403,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 390,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-red-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 408,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        className: "px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all",
                        children: t.cancel
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 410,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: sending,
                        className: "px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all",
                        children: t.send
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 414,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 409,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 389,
        columnNumber: 5
    }, this);
}
_s2(InviteJudgeForm, "0PsDvOyseNrc3r2fRv/LnUmQRD0=");
_c4 = InviteJudgeForm;
// ─── detail view ─────────────────────────────────────────────────────────────
function getAgeInYear(dob, year) {
    return year - new Date(dob + 'T00:00:00').getFullYear();
}
function validateTeamAges(team, gymnasts, ageGroupRules, competitionYear) {
    const rule = ageGroupRules.find((r)=>r.id === team.age_group);
    if (!rule) return [];
    const errors = [];
    for (const gid of team.gymnast_ids ?? []){
        const g = gymnasts.find((x)=>x.id === gid);
        if (!g?.date_of_birth) continue;
        const age = getAgeInYear(g.date_of_birth, competitionYear);
        if (age < rule.min_age || rule.max_age !== null && age > rule.max_age) {
            const name = [
                g.first_name,
                g.last_name_1
            ].filter(Boolean).join(' ');
            errors.push(`${name} (${age}): debe tener entre ${rule.min_age} y ${rule.max_age ?? '∞'} años`);
        }
    }
    return errors;
}
function routineTypesForTeam(team, ageGroupRules) {
    const rule = ageGroupRules.find((r)=>r.id === team.age_group);
    const count = rule?.routine_count ?? 3;
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
}
function CompetitionDetailView({ lang, competition, teams, gymnasts, coaches, competitionCoaches, entries, music, judges, nominations, agLabels, ageGroupRules, tsReviewStatuses, onBack, onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onInviteJudge, onRegisterCoach, onUnregisterCoach }) {
    _s3();
    const t = T[lang];
    const isOpen = competition.status === 'registration_open';
    const dateStr = formatDateRange(competition.start_date, competition.end_date);
    const today = new Date().toISOString().slice(0, 10);
    const isFileEditLocked = !!competition.ts_music_deadline && today > competition.ts_music_deadline;
    const competitionYear = competition.start_date ? new Date(competition.start_date + 'T00:00:00').getFullYear() : new Date().getFullYear();
    const [ageError, setAgeError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Fix eligible teams filter: match by UUID (ag_group = rule.id) OR by label name (legacy)
    const eligibleTeams = teams.filter((team)=>competition.age_groups.some((agId)=>agId === team.age_group || agLabels[agId] && agLabels[agId] === team.age_group));
    const compNominations = nominations.filter((n)=>n.competition_id === competition.id);
    const nominatedIds = new Set(compNominations.map((n)=>n.judge_id));
    const hasJudgeWarning = compNominations.length === 0 && isOpen;
    const [judgesOpen, setJudgesOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hasJudgeWarning);
    const registeredCoachIds = new Set(competitionCoaches.filter((cc)=>cc.competition_id === competition.id).map((cc)=>cc.coach_id));
    const registeredCoaches = coaches.filter((c)=>registeredCoachIds.has(c.id));
    const unregisteredCoaches = coaches.filter((c)=>!registeredCoachIds.has(c.id));
    const [coachesOpen, setCoachesOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPoolPicker, setShowPoolPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showInviteForm, setShowInviteForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [poolSearch, setPoolSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Judges already nominated for this competition
    const nominatedJudges = judges.filter((j)=>nominatedIds.has(j.id));
    // Judges in pool but not yet nominated for this competition
    const availableForNomination = judges.filter((j)=>!nominatedIds.has(j.id));
    const filteredPool = availableForNomination.filter((j)=>!poolSearch.trim() || j.full_name.toLowerCase().includes(poolSearch.trim().toLowerCase()));
    function entryFor(teamId) {
        return entries.find((e)=>e.competition_id === competition.id && e.team_id === teamId);
    }
    function recordFor(teamId, routineType) {
        return music.find((m)=>m.team_id === teamId && m.competition_id === competition.id && m.routine_type === routineType);
    }
    function reviewFor(teamId, routineType) {
        return tsReviewStatuses.find((s)=>s.team_id === teamId && s.competition_id === competition.id && s.routine_type === routineType);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 transition-colors",
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
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 547,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 546,
                        columnNumber: 9
                    }, this),
                    t.back
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 544,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border border-slate-200 rounded-2xl mb-5 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-3 px-5 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-base font-bold text-slate-800",
                                        children: competition.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 556,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-x-3 gap-y-1 mt-1.5",
                                        children: [
                                            competition.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 text-xs text-slate-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-3 h-3",
                                                        fill: "none",
                                                        viewBox: "0 0 24 24",
                                                        stroke: "currentColor",
                                                        strokeWidth: 2,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                            lineNumber: 560,
                                                            columnNumber: 114
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 19
                                                    }, this),
                                                    competition.location
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 559,
                                                columnNumber: 17
                                            }, this),
                                            dateStr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-slate-400",
                                                children: dateStr
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 564,
                                                columnNumber: 27
                                            }, this),
                                            competition.registration_deadline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-medium text-amber-600",
                                                children: [
                                                    t.deadline,
                                                    ": ",
                                                    formatDate(competition.registration_deadline)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 566,
                                                columnNumber: 17
                                            }, this),
                                            competition.ts_music_deadline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: [
                                                    'text-xs font-medium',
                                                    isFileEditLocked ? 'text-red-500' : 'text-amber-600'
                                                ].join(' '),
                                                children: [
                                                    t.tsMusicDeadline,
                                                    ": ",
                                                    formatDate(competition.ts_music_deadline)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 571,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 557,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1 mt-2",
                                        children: competition.age_groups.map((ag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full",
                                                children: agLabels[ag] ?? ag
                                            }, ag, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 578,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 576,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 555,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: [
                                    'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1',
                                    STATUS_BADGE[competition.status]
                                ].join(' '),
                                children: [
                                    competition.status === 'active' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 583,
                                        columnNumber: 49
                                    }, this),
                                    t.status[competition.status]
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 582,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 554,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setCoachesOpen((o)=>!o),
                        className: "w-full flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 text-left transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold uppercase tracking-widest text-slate-400",
                                        children: t.coachesTitle
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 593,
                                        columnNumber: 13
                                    }, this),
                                    registeredCoaches.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full",
                                        children: registeredCoaches.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 595,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 592,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: [
                                    'w-4 h-4 text-slate-300 transition-transform',
                                    coachesOpen ? 'rotate-180' : ''
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
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 600,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 598,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 590,
                        columnNumber: 9
                    }, this),
                    coachesOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-4 border-t border-slate-100 space-y-2",
                        children: coaches.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400 text-center py-2",
                            children: t.noCoachesInClub
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 607,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                registeredCoaches.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 py-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-7 h-7 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400",
                                                children: c.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: c.photo_url,
                                                    alt: c.full_name,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 613,
                                                    columnNumber: 38
                                                }, this) : c.full_name.charAt(0)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 612,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-800 font-medium truncate",
                                                        children: c.full_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 616,
                                                        columnNumber: 23
                                                    }, this),
                                                    c.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-400",
                                                        children: c.licence
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 617,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 615,
                                                columnNumber: 21
                                            }, this),
                                            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onUnregisterCoach(c.id),
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shrink-0",
                                                children: t.unregisterCoach
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 620,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, c.id, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 611,
                                        columnNumber: 19
                                    }, this)),
                                isOpen && unregisteredCoaches.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 py-1.5 opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-7 h-7 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400",
                                                children: c.photo_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: c.photo_url,
                                                    alt: c.full_name,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 630,
                                                    columnNumber: 38
                                                }, this) : c.full_name.charAt(0)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 629,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-800 font-medium truncate",
                                                        children: c.full_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 633,
                                                        columnNumber: 23
                                                    }, this),
                                                    c.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-400",
                                                        children: c.licence
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 634,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 632,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onRegisterCoach(c.id),
                                                className: "text-xs px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shrink-0",
                                                children: t.registerCoach
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 636,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, c.id, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 628,
                                        columnNumber: 19
                                    }, this)),
                                registeredCoaches.length === 0 && !isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-400 text-center py-2",
                                    children: t.noCoaches
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 643,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 605,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setJudgesOpen((o)=>!o),
                        className: [
                            'w-full flex items-center justify-between px-5 py-2.5 border-t text-left transition-colors',
                            hasJudgeWarning ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                        ].join(' '),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: [
                                            'text-xs font-semibold uppercase tracking-widest',
                                            hasJudgeWarning ? 'text-amber-600' : 'text-slate-400'
                                        ].join(' '),
                                        children: t.judgesTitle
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 658,
                                        columnNumber: 13
                                    }, this),
                                    compNominations.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full",
                                        children: compNominations.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 662,
                                        columnNumber: 15
                                    }, this) : hasJudgeWarning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold text-amber-600",
                                        children: [
                                            "⚠ ",
                                            t.judgesWarning
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 666,
                                        columnNumber: 15
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 657,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: [
                                    'w-4 h-4 transition-transform',
                                    judgesOpen ? 'rotate-180' : '',
                                    hasJudgeWarning ? 'text-amber-400' : 'text-slate-300'
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
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 671,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 669,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 651,
                        columnNumber: 9
                    }, this),
                    judgesOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-4 border-t border-slate-100 space-y-3",
                        children: [
                            nominatedJudges.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-400 text-center py-2",
                                children: t.noJudges
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 679,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: nominatedJudges.map((judge)=>{
                                    const nomination = compNominations.find((n)=>n.judge_id === judge.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 rounded-xl px-3 py-2.5 border bg-green-50 border-green-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-500",
                                                children: judge.full_name.charAt(0)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 686,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-wrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold text-slate-800",
                                                            children: judge.full_name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                            lineNumber: 691,
                                                            columnNumber: 27
                                                        }, this),
                                                        judge.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded",
                                                            children: judge.licence
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                            lineNumber: 693,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 690,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 689,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "shrink-0 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-600 rounded-full",
                                                        children: t.nominated
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 698,
                                                        columnNumber: 25
                                                    }, this),
                                                    isOpen && nomination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onRemoveNomination(nomination.id),
                                                        className: "text-xs text-slate-400 hover:text-red-500 transition-colors",
                                                        children: t.removeNomination
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 700,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 697,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, judge.id, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 685,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 681,
                                columnNumber: 15
                            }, this),
                            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    !showInviteForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setShowPoolPicker((v)=>!v);
                                            setShowInviteForm(false);
                                        },
                                        className: "text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors",
                                        children: t.addFromPool
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 716,
                                        columnNumber: 19
                                    }, this),
                                    showPoolPicker && !showInviteForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-slate-200 rounded-xl overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-3 py-2 border-b border-slate-100",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: poolSearch,
                                                    onChange: (e)=>setPoolSearch(e.target.value),
                                                    placeholder: t.searchJudges,
                                                    className: "w-full text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 726,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 725,
                                                columnNumber: 21
                                            }, this),
                                            filteredPool.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "px-3 py-3 text-xs text-slate-400 text-center",
                                                children: t.noPoolJudges
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 735,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-48 overflow-y-auto divide-y divide-slate-50",
                                                children: filteredPool.map((judge)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            onNominate(judge.id);
                                                            setShowPoolPicker(false);
                                                            setPoolSearch('');
                                                        },
                                                        className: "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-500",
                                                                children: judge.full_name.charAt(0)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                                lineNumber: 742,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-medium text-slate-700 truncate",
                                                                        children: judge.full_name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                                        lineNumber: 746,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    judge.licence && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-slate-400",
                                                                        children: judge.licence
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                                        lineNumber: 747,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                                lineNumber: 745,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, judge.id, true, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 739,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 737,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 724,
                                        columnNumber: 19
                                    }, this),
                                    !showPoolPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setShowInviteForm((v)=>!v);
                                            setShowPoolPicker(false);
                                        },
                                        className: "text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors",
                                        children: t.inviteNew
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 758,
                                        columnNumber: 19
                                    }, this),
                                    showInviteForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InviteJudgeForm, {
                                        lang: lang,
                                        onSend: async (f)=>{
                                            await onInviteJudge({
                                                full_name: f.full_name,
                                                email: f.email,
                                                phone: f.phone || undefined,
                                                licence: f.licence || undefined
                                            });
                                        },
                                        onCancel: ()=>setShowInviteForm(false)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 766,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 714,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 676,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 553,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3",
                children: t.teamsTitle
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 781,
                columnNumber: 7
            }, this),
            teams.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl",
                children: t.noTeams
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 783,
                columnNumber: 9
            }, this) : eligibleTeams.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl",
                children: t.noEligibleTeams
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 785,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: eligibleTeams.map((team)=>{
                    const entry = entryFor(team.id);
                    const missingLicencia = (team.gymnast_ids ?? []).some((gid)=>{
                        const g = gymnasts.find((x)=>x.id === gid);
                        return !g?.licencia_url;
                    });
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white border border-slate-200 rounded-2xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-3 px-4 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 flex-wrap",
                                                children: [
                                                    entry?.dorsal != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded-full",
                                                        children: [
                                                            "#",
                                                            entry.dorsal
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 801,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-slate-800",
                                                        children: team.gymnast_display
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 803,
                                                        columnNumber: 23
                                                    }, this),
                                                    entry?.dropped_out && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-400 rounded-full",
                                                        children: t.dropout
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 805,
                                                        columnNumber: 25
                                                    }, this),
                                                    missingLicencia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        title: t.licenciaWarningFull,
                                                        className: "text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full",
                                                        children: [
                                                            "⚠ ",
                                                            t.licenciaWarning
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                        lineNumber: 808,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 799,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-400 mt-0.5",
                                                children: [
                                                    team.category,
                                                    " · ",
                                                    agLabels[team.age_group] ?? team.age_group
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 813,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 798,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "shrink-0",
                                        children: entry ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-full",
                                                    children: t.registered
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 818,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>onDropout(entry.id),
                                                    className: [
                                                        'text-xs font-medium px-2.5 py-1 rounded-lg border transition-all',
                                                        entry.dropped_out ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-red-100 text-red-500 hover:bg-red-50'
                                                    ].join(' '),
                                                    children: entry.dropped_out ? t.undoDropout : t.toggleDropout
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 819,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 817,
                                            columnNumber: 23
                                        }, this) : isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                const errs = validateTeamAges(team, gymnasts, ageGroupRules, competitionYear);
                                                if (errs.length > 0) {
                                                    setAgeError({
                                                        teamId: team.id,
                                                        messages: errs
                                                    });
                                                    return;
                                                }
                                                if (!competition.age_groups.some((ag)=>ag === team.age_group)) {
                                                    setAgeError({
                                                        teamId: team.id,
                                                        messages: [
                                                            lang === 'es' ? 'El grupo de edad de este equipo no está incluido en esta competición.' : 'This team\'s age group is not part of this competition.'
                                                        ]
                                                    });
                                                    return;
                                                }
                                                onRegister(team.id);
                                            },
                                            className: "text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all",
                                            children: t.register
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 829,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-slate-300",
                                            children: t.registrationClosed
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 842,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 815,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 797,
                                columnNumber: 17
                            }, this),
                            entry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 pb-4 pt-1",
                                children: [
                                    isFileEditLocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium text-red-500 mb-2 flex items-center gap-1",
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
                                                    d: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 853,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 852,
                                                columnNumber: 25
                                            }, this),
                                            t.filesLocked
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 851,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-slate-50 rounded-xl px-4 py-1",
                                        children: routineTypesForTeam(team, ageGroupRules).map((rt)=>{
                                            const review = reviewFor(team.id, rt);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoutineRow, {
                                                lang: lang,
                                                routineType: rt,
                                                record: recordFor(team.id, rt),
                                                locked: isFileEditLocked,
                                                reviewStatus: review?.status,
                                                reviewComment: review?.final_comment,
                                                onSet: (field, filename)=>onSetFile(team.id, rt, field, filename)
                                            }, rt, false, {
                                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                lineNumber: 862,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 858,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 849,
                                columnNumber: 19
                            }, this)
                        ]
                    }, team.id, true, {
                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                        lineNumber: 795,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 787,
                columnNumber: 9
            }, this),
            ageError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-red-600",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 886,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                        lineNumber: 885,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 884,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-slate-800 mb-2",
                                            children: lang === 'es' ? 'No se puede inscribir este equipo' : 'Cannot register this team'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 890,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-1",
                                            children: ageError.messages.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "text-xs text-red-600",
                                                    children: m
                                                }, i, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 895,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 893,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 889,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 883,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setAgeError(null),
                                className: "px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all",
                                children: lang === 'es' ? 'Entendido' : 'Got it'
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 901,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 900,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 882,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 881,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 542,
        columnNumber: 5
    }, this);
}
_s3(CompetitionDetailView, "0t75TLNGt3SYvjBQUI9LjpxWslg=");
_c5 = CompetitionDetailView;
// ─── list view ────────────────────────────────────────────────────────────────
function CompetitionListView({ lang, competitions, teams, entries, nominations, onSelect }) {
    const t = T[lang];
    const teamIds = new Set(teams.map((tm)=>tm.id));
    const visible = competitions.filter((c)=>c.status === 'registration_open' || entries.some((e)=>e.competition_id === c.id && teamIds.has(e.team_id)));
    if (visible.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-slate-400 text-center py-16",
            children: t.empty
        }, void 0, false, {
            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
            lineNumber: 934,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: visible.map((comp)=>{
            const registeredCount = entries.filter((e)=>e.competition_id === comp.id && teamIds.has(e.team_id)).length;
            const nominatedCount = nominations.filter((n)=>n.competition_id === comp.id).length;
            const needsJudge = comp.status === 'registration_open' && registeredCount > 0 && nominatedCount === 0;
            const dateStr = formatDateRange(comp.start_date, comp.end_date);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onSelect(comp.id),
                className: "w-full text-left bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-1.5 flex-wrap",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: [
                                                'px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1',
                                                STATUS_BADGE[comp.status]
                                            ].join(' '),
                                            children: [
                                                comp.status === 'active' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                                    lineNumber: 953,
                                                    columnNumber: 50
                                                }, this),
                                                t.status[comp.status]
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 952,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: [
                                                'text-xs font-medium',
                                                registeredCount > 0 ? 'text-green-600' : 'text-slate-400'
                                            ].join(' '),
                                            children: t.teamCount(registeredCount)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 956,
                                            columnNumber: 19
                                        }, this),
                                        needsJudge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full",
                                            children: [
                                                "⚠ ",
                                                t.judgesWarning
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 960,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 951,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors",
                                    children: comp.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 965,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-x-3 mt-1",
                                    children: [
                                        comp.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-slate-400",
                                            children: comp.location
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 967,
                                            columnNumber: 37
                                        }, this),
                                        dateStr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-slate-400",
                                            children: dateStr
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                            lineNumber: 968,
                                            columnNumber: 31
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                    lineNumber: 966,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 950,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M8.25 4.5l7.5 7.5-7.5 7.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                                lineNumber: 972,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                            lineNumber: 971,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                    lineNumber: 949,
                    columnNumber: 13
                }, this)
            }, comp.id, false, {
                fileName: "[project]/src/components/club/CompetitionsTab.tsx",
                lineNumber: 947,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 938,
        columnNumber: 5
    }, this);
}
_c6 = CompetitionListView;
function CompetitionsTab({ lang, competitions, teams, gymnasts, coaches, competitionCoaches, entries, music, judges, nominations, agLabels, ageGroupRules, tsReviewStatuses, onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onInviteJudge, onRegisterCoach, onUnregisterCoach }) {
    _s4();
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const selected = competitions.find((c)=>c.id === selectedId) ?? null;
    if (selected) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompetitionDetailView, {
            lang: lang,
            competition: selected,
            teams: teams,
            gymnasts: gymnasts,
            coaches: coaches,
            competitionCoaches: competitionCoaches.filter((cc)=>cc.competition_id === selected.id),
            entries: entries,
            music: music,
            judges: judges,
            nominations: nominations,
            agLabels: agLabels,
            ageGroupRules: ageGroupRules,
            tsReviewStatuses: tsReviewStatuses,
            onBack: ()=>setSelectedId(null),
            onRegister: (teamId)=>onRegister(selected.id, teamId),
            onDropout: onDropout,
            onSetFile: (teamId, routineType, field, file)=>onSetFile(teamId, selected.id, routineType, field, file),
            onNominate: (judgeId)=>onNominate(selected.id, judgeId),
            onRemoveNomination: onRemoveNomination,
            onInviteJudge: onInviteJudge,
            onRegisterCoach: (coachId)=>onRegisterCoach(selected.id, coachId),
            onUnregisterCoach: (coachId)=>onUnregisterCoach(selected.id, coachId)
        }, void 0, false, {
            fileName: "[project]/src/components/club/CompetitionsTab.tsx",
            lineNumber: 1017,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompetitionListView, {
        lang: lang,
        competitions: competitions,
        teams: teams,
        entries: entries,
        nominations: nominations,
        onSelect: setSelectedId
    }, void 0, false, {
        fileName: "[project]/src/components/club/CompetitionsTab.tsx",
        lineNumber: 1045,
        columnNumber: 5
    }, this);
}
_s4(CompetitionsTab, "6tRyBKpA6Tf8zEXxvntvrffDmeA=");
_c7 = CompetitionsTab;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "FileChip");
__turbopack_context__.k.register(_c1, "PDFViewerModal");
__turbopack_context__.k.register(_c2, "MusicPlayerModal");
__turbopack_context__.k.register(_c3, "RoutineRow");
__turbopack_context__.k.register(_c4, "InviteJudgeForm");
__turbopack_context__.k.register(_c5, "CompetitionDetailView");
__turbopack_context__.k.register(_c6, "CompetitionListView");
__turbopack_context__.k.register(_c7, "CompetitionsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/club/ClubProfileTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClubProfileTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/ClickableImg.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const T = {
    en: {
        clubName: 'Club name',
        contactName: 'Contact person',
        phone: 'Phone',
        save: 'Save changes',
        saved: 'Saved',
        cancel: 'Cancel',
        edit: 'Edit profile',
        avatar: 'Change photo',
        uploading: 'Uploading…'
    },
    es: {
        clubName: 'Nombre del club',
        contactName: 'Persona de contacto',
        phone: 'Teléfono',
        save: 'Guardar cambios',
        saved: 'Guardado',
        cancel: 'Cancelar',
        edit: 'Editar perfil',
        avatar: 'Cambiar foto',
        uploading: 'Subiendo…'
    }
};
function ClubProfileTab({ lang, club, onUpdate, onUploadAvatar }) {
    _s();
    const t = T[lang];
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        club_name: club.club_name,
        contact_name: club.contact_name ?? '',
        phone: club.phone ?? ''
    });
    const [saved, setSaved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function startEdit() {
        setForm({
            club_name: club.club_name,
            contact_name: club.contact_name ?? '',
            phone: club.phone ?? ''
        });
        setEditing(true);
        setSaved(false);
    }
    async function handleSave(e) {
        e.preventDefault();
        onUpdate({
            club_name: form.club_name,
            contact_name: form.contact_name || null,
            phone: form.phone || null
        });
        setEditing(false);
        setSaved(true);
        setTimeout(()=>setSaved(false), 3000);
    }
    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await onUploadAvatar(file);
        } finally{
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
    const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-lg",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white border border-slate-200 rounded-2xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-slate-50 border-b border-slate-100 px-5 py-6 flex items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative shrink-0",
                            children: [
                                club.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: club.avatar_url,
                                    alt: club.club_name,
                                    className: "w-16 h-16 rounded-2xl object-cover"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 81,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400",
                                    children: club.club_name.charAt(0)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 84,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>fileInputRef.current?.click(),
                                    disabled: uploading,
                                    className: "absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm",
                                    children: uploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 93,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3 h-3",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2.5,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                                lineNumber: 96,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                                lineNumber: 97,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    ref: fileInputRef,
                                    type: "file",
                                    accept: "image/*",
                                    className: "hidden",
                                    onChange: handleAvatarChange
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-base font-bold text-slate-800",
                                    children: club.club_name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                club.contact_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-400",
                                    children: club.contact_name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 105,
                                    columnNumber: 35
                                }, this),
                                uploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-blue-500 mt-0.5",
                                    children: t.uploading
                                }, void 0, false, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 106,
                                    columnNumber: 27
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-5",
                    children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSave,
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: t.clubName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        required: true,
                                        value: form.club_name,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    club_name: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: t.contactName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: form.contact_name,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    contact_name: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 120,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                lineNumber: 118,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-xs font-medium text-slate-500 mb-1",
                                        children: t.phone
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 124,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "tel",
                                        value: form.phone,
                                        onChange: (e)=>setForm((f)=>({
                                                    ...f,
                                                    phone: e.target.value
                                                })),
                                        className: inputCls
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                lineNumber: 123,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 pt-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setEditing(false),
                                        className: "flex-1 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all",
                                        children: t.cancel
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 129,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "flex-1 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all",
                                        children: t.save
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 133,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                lineNumber: 128,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                        lineNumber: 112,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            [
                                {
                                    label: t.clubName,
                                    value: club.club_name
                                },
                                {
                                    label: t.contactName,
                                    value: club.contact_name
                                },
                                {
                                    label: t.phone,
                                    value: club.phone
                                }
                            ].map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium text-slate-400",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                            lineNumber: 147,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-slate-800 mt-0.5",
                                            children: value ?? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-slate-300",
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                                lineNumber: 148,
                                                columnNumber: 74
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                            lineNumber: 148,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, label, true, {
                                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                    lineNumber: 146,
                                    columnNumber: 17
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: startEdit,
                                        className: "px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all",
                                        children: t.edit
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 152,
                                        columnNumber: 17
                                    }, this),
                                    saved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-green-600 font-medium",
                                        children: t.saved
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                        lineNumber: 156,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                                lineNumber: 151,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                        lineNumber: 140,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/club/ClubProfileTab.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/club/ClubProfileTab.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/club/ClubProfileTab.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(ClubProfileTab, "71FRHayhC5ZTGftsenem12ienBM=");
_c = ClubProfileTab;
var _c;
__turbopack_context__.k.register(_c, "ClubProfileTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/club/ClubPortal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClubPortal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/ClickableImg.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/GymnastsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$CoachesTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/CoachesTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$TeamsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/TeamsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$CompetitionsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/CompetitionsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$ClubProfileTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/ClubProfileTab.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
        tabs: {
            gymnasts: 'Gymnasts',
            coaches: 'Coaches',
            teams: 'Teams',
            competitions: 'Competitions',
            judges: 'Judges',
            profile: 'Profile'
        },
        gymnasts: 'gymnasts',
        coaches: 'coaches',
        teams: 'teams',
        registrations: 'registrations'
    },
    es: {
        tabs: {
            gymnasts: 'Gimnastas',
            coaches: 'Entrenadores',
            teams: 'Equipos',
            competitions: 'Competiciones',
            judges: 'Jueces',
            profile: 'Perfil'
        },
        gymnasts: 'gimnastas',
        coaches: 'entrenadores',
        teams: 'equipos',
        registrations: 'inscripciones'
    }
};
function ClubPortal({ lang, club, gymnasts, coaches, competitionCoaches, teams, judges, nominations, competitions, entries, music, agLabels, ageGroupRules, tsReviewStatuses, onAddGymnast, onAddGymnastsBulk, onUpdateGymnast, onDeleteGymnast, onUploadGymnastPhoto, onUploadLicencia, onRemoveLicencia, onAddCoach, onUpdateCoach, onDeleteCoach, onUploadCoachPhoto, onUploadCoachLicencia, onRegisterCoach, onUnregisterCoach, onAddTeam, onUpdateTeam, onDeleteTeam, onUploadTeamPhoto, onInviteJudge, onUpdateJudge, onDeleteJudge, onUploadJudgePhoto, onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onUpdateClub, onUploadAvatar }) {
    _s();
    const t = T[lang];
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('gymnasts');
    const activeEntries = entries.filter((e)=>!e.dropped_out);
    const uniqueCompIds = new Set(activeEntries.map((e)=>e.competition_id));
    const TABS = [
        {
            key: 'gymnasts',
            label: t.tabs.gymnasts,
            count: gymnasts.length
        },
        {
            key: 'coaches',
            label: t.tabs.coaches,
            count: coaches.length
        },
        {
            key: 'teams',
            label: t.tabs.teams,
            count: teams.length
        },
        {
            key: 'competitions',
            label: t.tabs.competitions,
            count: uniqueCompIds.size
        },
        {
            key: 'profile',
            label: t.tabs.profile
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border-b border-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-3xl mx-auto px-4 py-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-lg font-bold text-slate-500 overflow-hidden",
                                        children: club.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$ClickableImg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: club.avatar_url,
                                            alt: club.club_name,
                                            className: "w-full h-full object-cover"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/club/ClubPortal.tsx",
                                            lineNumber: 125,
                                            columnNumber: 19
                                        }, this) : club.club_name.charAt(0)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-lg font-bold text-slate-800 leading-tight",
                                                children: club.club_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                lineNumber: 129,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-x-3 mt-0.5",
                                                children: [
                                                    club.contact_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: club.contact_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 39
                                                    }, this),
                                                    club.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-slate-400",
                                                        children: club.phone
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                        lineNumber: 132,
                                                        columnNumber: 32
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                lineNumber: 130,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4 mt-4",
                                children: [
                                    {
                                        n: gymnasts.length,
                                        label: t.gymnasts
                                    },
                                    {
                                        n: coaches.length,
                                        label: t.coaches
                                    },
                                    {
                                        n: teams.length,
                                        label: t.teams
                                    },
                                    {
                                        n: uniqueCompIds.size,
                                        label: t.registrations
                                    }
                                ].map(({ n, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xl font-bold text-slate-800",
                                                children: n
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                lineNumber: 146,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-400",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, label, true, {
                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-3xl mx-auto px-4 flex overflow-x-auto",
                        children: TABS.map(({ key, label, count })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab(key),
                                className: [
                                    'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5',
                                    activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                ].join(' '),
                                children: [
                                    label,
                                    count !== undefined && count > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: [
                                            'text-xs px-1.5 py-0.5 rounded-full font-medium',
                                            activeTab === key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                                        ].join(' '),
                                        children: count
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this) : null
                                ]
                            }, key, true, {
                                fileName: "[project]/src/components/club/ClubPortal.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/ClubPortal.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-3xl mx-auto px-4 py-6",
                children: [
                    activeTab === 'gymnasts' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$GymnastsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        lang: lang,
                        gymnasts: gymnasts,
                        onAdd: onAddGymnast,
                        onAddBulk: onAddGymnastsBulk,
                        onUpdate: onUpdateGymnast,
                        onDelete: onDeleteGymnast,
                        onUploadPhoto: onUploadGymnastPhoto,
                        onUploadLicencia: onUploadLicencia,
                        onRemoveLicencia: onRemoveLicencia
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, this),
                    activeTab === 'coaches' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$CoachesTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        lang: lang,
                        coaches: coaches,
                        onAdd: onAddCoach,
                        onUpdate: onUpdateCoach,
                        onDelete: onDeleteCoach,
                        onUploadPhoto: onUploadCoachPhoto,
                        onUploadLicencia: onUploadCoachLicencia
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 182,
                        columnNumber: 11
                    }, this),
                    activeTab === 'teams' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$TeamsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        lang: lang,
                        gymnasts: gymnasts,
                        teams: teams,
                        ageGroupRules: ageGroupRules,
                        agLabels: agLabels,
                        onAdd: onAddTeam,
                        onUpdate: onUpdateTeam,
                        onDelete: onDeleteTeam,
                        onUploadPhoto: onUploadTeamPhoto
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this),
                    activeTab === 'competitions' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$CompetitionsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        lang: lang,
                        competitions: competitions,
                        teams: teams,
                        gymnasts: gymnasts,
                        coaches: coaches,
                        competitionCoaches: competitionCoaches,
                        entries: entries,
                        music: music,
                        judges: judges,
                        nominations: nominations,
                        agLabels: agLabels,
                        ageGroupRules: ageGroupRules,
                        tsReviewStatuses: tsReviewStatuses,
                        onRegister: onRegister,
                        onDropout: onDropout,
                        onSetFile: onSetFile,
                        onNominate: onNominate,
                        onRemoveNomination: onRemoveNomination,
                        onInviteJudge: onInviteJudge,
                        onRegisterCoach: onRegisterCoach,
                        onUnregisterCoach: onUnregisterCoach
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 193,
                        columnNumber: 11
                    }, this),
                    activeTab === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$ClubProfileTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        lang: lang,
                        club: club,
                        onUpdate: onUpdateClub,
                        onUploadAvatar: onUploadAvatar
                    }, void 0, false, {
                        fileName: "[project]/src/components/club/ClubPortal.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/club/ClubPortal.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/club/ClubPortal.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_s(ClubPortal, "4JSHmO+i0e+YyUcGCor0UPyKWJo=");
_c = ClubPortal;
var _c;
__turbopack_context__.k.register(_c, "ClubPortal");
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
"[project]/src/app/club/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$ClubPortal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/club/ClubPortal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$AuthBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/shared/AuthBar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function Page() {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { activeProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('es');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [club, setClub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gymnasts, setGymnasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [coaches, setCoaches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [competitionCoaches, setCompetitionCoaches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [teams, setTeams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [competitions, setCompetitions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [music, setMusicState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [judges, setJudges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [nominations, setNominations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [clubId, setClubId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [agLabels, setAgLabels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [ageGroupRules, setAgeGroupRules] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tsReviewStatuses, setTsReviewStatuses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [uploadError, setUploadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            async function load() {
                if (!activeProfile) return;
                try {
                    const cid = activeProfile.club_id;
                    if (!cid) {
                        setLoading(false);
                        return;
                    }
                    setClubId(cid);
                    // ── parallel: club + gymnasts + coaches + teams + competitions + nominations + rules ─
                    const [clubRes, gymnastsRes, coachesRes, teamsRes, compsRes, nomsRes, rulesRes] = await Promise.all([
                        supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').eq('id', cid).single(),
                        supabase.from('gymnasts').select('id,club_id,first_name,last_name_1,last_name_2,date_of_birth,photo_url,licencia_url').eq('club_id', cid),
                        supabase.from('coaches').select('id,club_id,full_name,licence,photo_url,licencia_url').eq('club_id', cid),
                        supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url').eq('club_id', cid),
                        supabase.from('competitions').select('id,name,status,location,start_date,end_date,registration_deadline,ts_music_deadline,age_groups,poster_url,created_at').neq('status', 'draft').order('start_date', {
                            ascending: false
                        }),
                        supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('club_id', cid),
                        supabase.from('age_group_rules').select('id,age_group,ruleset,min_age,max_age,routine_count').order('sort_order')
                    ]);
                    const rawTeams = teamsRes.data ?? [];
                    const teamIds = rawTeams.map({
                        "Page.useEffect.load.teamIds": (t)=>t.id
                    }["Page.useEffect.load.teamIds"]);
                    // ── parallel: team_gymnasts + entries + music + judges + competition_coaches ─
                    const [tgRes, entriesRes, musicRes, judgesRes, reviewRes, compCoachesRes] = await Promise.all([
                        teamIds.length > 0 ? supabase.from('team_gymnasts').select('team_id,gymnast_id').in('team_id', teamIds) : Promise.resolve({
                            data: []
                        }),
                        teamIds.length > 0 ? supabase.from('competition_entries').select('id,competition_id,team_id,dorsal,dropped_out').in('team_id', teamIds) : Promise.resolve({
                            data: []
                        }),
                        teamIds.length > 0 ? supabase.from('routine_music').select('id,team_id,competition_id,routine_type,music_path,ts_path,uploaded_at').in('team_id', teamIds) : Promise.resolve({
                            data: []
                        }),
                        supabase.from('judges').select('id,full_name,phone,licence,avatar_url'),
                        teamIds.length > 0 ? supabase.from('ts_review_status').select('team_id, competition_id, routine_type, status, final_comment').in('team_id', teamIds) : Promise.resolve({
                            data: []
                        }),
                        supabase.from('competition_coaches').select('id,competition_id,coach_id').in('coach_id', (coachesRes.data ?? []).map({
                            "Page.useEffect.load": (c)=>c.id
                        }["Page.useEffect.load"]))
                    ]);
                    // attach gymnast_ids to each team
                    const tgMap = {};
                    for (const tg of tgRes.data ?? []){
                        if (!tgMap[tg.team_id]) tgMap[tg.team_id] = [];
                        tgMap[tg.team_id].push(tg.gymnast_id);
                    }
                    const teamsWithIds = rawTeams.map({
                        "Page.useEffect.load.teamsWithIds": (t)=>({
                                ...t,
                                gymnast_ids: tgMap[t.id] ?? []
                            })
                    }["Page.useEffect.load.teamsWithIds"]);
                    // map music_path/ts_path → music_filename/ts_filename
                    const mappedMusic = (musicRes.data ?? []).map({
                        "Page.useEffect.load.mappedMusic": ({ music_path, ts_path, ...m })=>({
                                ...m,
                                music_filename: music_path,
                                ts_filename: ts_path
                            })
                    }["Page.useEffect.load.mappedMusic"]);
                    const mappedComps = (compsRes.data ?? []).map({
                        "Page.useEffect.load.mappedComps": (c)=>({
                                ...c,
                                admin: null
                            })
                    }["Page.useEffect.load.mappedComps"]);
                    const agLabelsMap = Object.fromEntries((rulesRes.data ?? []).map({
                        "Page.useEffect.load.agLabelsMap": (r)=>[
                                r.id,
                                `${r.age_group} (${r.ruleset})`
                            ]
                    }["Page.useEffect.load.agLabelsMap"]));
                    setAgeGroupRules(rulesRes.data ?? []);
                    const rawJudges = judgesRes.data ?? [];
                    const fetchedJudgeIds = rawJudges.map({
                        "Page.useEffect.load.fetchedJudgeIds": (j)=>j.id
                    }["Page.useEffect.load.fetchedJudgeIds"]);
                    const { data: judgeProfiles } = fetchedJudgeIds.length > 0 ? await supabase.from('profiles').select('id,email').in('id', fetchedJudgeIds) : {
                        data: []
                    };
                    const judgeEmailMap = Object.fromEntries((judgeProfiles ?? []).map({
                        "Page.useEffect.load.judgeEmailMap": (p)=>[
                                p.id,
                                p.email ?? null
                            ]
                    }["Page.useEffect.load.judgeEmailMap"]));
                    setTsReviewStatuses(reviewRes.data ?? []);
                    setClub(clubRes.data);
                    setGymnasts(gymnastsRes.data ?? []);
                    setCoaches(coachesRes.data ?? []);
                    setCompetitionCoaches(compCoachesRes.data ?? []);
                    setTeams(teamsWithIds);
                    setCompetitions(mappedComps);
                    setEntries(entriesRes.data ?? []);
                    setMusicState(mappedMusic);
                    setJudges(rawJudges.map({
                        "Page.useEffect.load": (j)=>({
                                ...j,
                                email: judgeEmailMap[j.id] ?? null
                            })
                    }["Page.useEffect.load"]));
                    setNominations(nomsRes.data ?? []);
                    setAgLabels(agLabelsMap);
                } finally{
                    setLoading(false);
                }
            }
            load();
        }
    }["Page.useEffect"], [
        activeProfile?.id
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    // ── gymnasts ──────────────────────────────────────────────────────────────────
    async function handleAddGymnast(g) {
        const { data } = await supabase.from('gymnasts').insert({
            ...g,
            club_id: clubId
        }).select().single();
        if (data) setGymnasts((prev)=>[
                ...prev,
                data
            ]);
    }
    async function handleAddGymnastsBulk(list) {
        if (!list.length) return;
        const { data } = await supabase.from('gymnasts').insert(list.map((g)=>({
                ...g,
                club_id: clubId
            }))).select();
        if (data) setGymnasts((prev)=>[
                ...prev,
                ...data
            ]);
    }
    async function handleUpdateGymnast(id, g) {
        await supabase.from('gymnasts').update(g).eq('id', id);
        setGymnasts((prev)=>prev.map((x)=>x.id === id ? {
                    ...x,
                    ...g
                } : x));
    }
    async function handleDeleteGymnast(id) {
        await supabase.from('gymnasts').delete().eq('id', id);
        setGymnasts((prev)=>prev.filter((x)=>x.id !== id));
        setTeams((prev)=>prev.map((t)=>({
                    ...t,
                    gymnast_ids: (t.gymnast_ids ?? []).filter((gid)=>gid !== id)
                })));
    }
    // ── coaches ───────────────────────────────────────────────────────────────────
    async function handleAddCoach(c) {
        const { data } = await supabase.from('coaches').insert({
            ...c,
            club_id: clubId
        }).select().single();
        if (data) setCoaches((prev)=>[
                ...prev,
                data
            ]);
    }
    async function handleUpdateCoach(id, c) {
        await supabase.from('coaches').update(c).eq('id', id);
        setCoaches((prev)=>prev.map((x)=>x.id === id ? {
                    ...x,
                    ...c
                } : x));
    }
    async function handleDeleteCoach(id) {
        await supabase.from('coaches').delete().eq('id', id);
        setCoaches((prev)=>prev.filter((x)=>x.id !== id));
        setCompetitionCoaches((prev)=>prev.filter((cc)=>cc.coach_id !== id));
    }
    async function handleUploadCoachPhoto(id, file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${id}/photo.${ext}`;
        const { error } = await supabase.storage.from('coaches-photos').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('coaches-photos').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('coaches').update({
            photo_url: url
        }).eq('id', id);
        setCoaches((prev)=>prev.map((c)=>c.id === id ? {
                    ...c,
                    photo_url: url
                } : c));
    }
    async function handleUploadCoachLicencia(id, file) {
        const ext = file.name.split('.').pop() ?? 'pdf';
        const path = `${id}/licencia.${ext}`;
        const { error } = await supabase.storage.from('coach-licencias').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('coach-licencias').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('coaches').update({
            licencia_url: url
        }).eq('id', id);
        setCoaches((prev)=>prev.map((c)=>c.id === id ? {
                    ...c,
                    licencia_url: url
                } : c));
    }
    async function handleRegisterCoach(competitionId, coachId) {
        if (competitionCoaches.some((cc)=>cc.competition_id === competitionId && cc.coach_id === coachId)) return;
        const { data } = await supabase.from('competition_coaches').insert({
            competition_id: competitionId,
            coach_id: coachId
        }).select().single();
        if (data) setCompetitionCoaches((prev)=>[
                ...prev,
                data
            ]);
    }
    async function handleUnregisterCoach(competitionId, coachId) {
        const cc = competitionCoaches.find((x)=>x.competition_id === competitionId && x.coach_id === coachId);
        if (!cc) return;
        await supabase.from('competition_coaches').delete().eq('id', cc.id);
        setCompetitionCoaches((prev)=>prev.filter((x)=>x.id !== cc.id));
    }
    // ── teams ─────────────────────────────────────────────────────────────────────
    async function handleAddTeam(t) {
        const { gymnast_ids, ...rest } = t;
        const { data: newTeam } = await supabase.from('teams').insert({
            ...rest,
            club_id: clubId,
            photo_url: null
        }).select().single();
        if (!newTeam) return;
        // insert team_gymnasts rows
        if (gymnast_ids?.length) {
            await supabase.from('team_gymnasts').insert(gymnast_ids.map((gid)=>({
                    team_id: newTeam.id,
                    gymnast_id: gid
                })));
        }
        setTeams((prev)=>[
                ...prev,
                {
                    ...newTeam,
                    gymnast_ids: gymnast_ids ?? []
                }
            ]);
    }
    async function handleUpdateTeam(id, t) {
        const { gymnast_ids, ...rest } = t;
        await supabase.from('teams').update(rest).eq('id', id);
        // replace team_gymnasts
        if (gymnast_ids !== undefined) {
            await supabase.from('team_gymnasts').delete().eq('team_id', id);
            if (gymnast_ids.length > 0) {
                await supabase.from('team_gymnasts').insert(gymnast_ids.map((gid)=>({
                        team_id: id,
                        gymnast_id: gid
                    })));
            }
        }
        setTeams((prev)=>prev.map((x)=>x.id === id ? {
                    ...x,
                    ...t
                } : x));
    }
    async function handleDeleteTeam(id) {
        await supabase.from('teams').delete().eq('id', id);
        setTeams((prev)=>prev.filter((x)=>x.id !== id));
        setEntries((prev)=>prev.filter((e)=>e.team_id !== id));
        setMusicState((prev)=>prev.filter((m)=>m.team_id !== id));
    }
    // ── registrations ─────────────────────────────────────────────────────────────
    async function handleRegister(competitionId, teamId) {
        if (entries.some((e)=>e.competition_id === competitionId && e.team_id === teamId)) return;
        const { data } = await supabase.from('competition_entries').insert({
            competition_id: competitionId,
            team_id: teamId,
            dropped_out: false
        }).select().single();
        if (data) setEntries((prev)=>[
                ...prev,
                data
            ]);
    }
    async function handleDropout(entryId) {
        const entry = entries.find((e)=>e.id === entryId);
        if (!entry) return;
        const newValue = !entry.dropped_out;
        await supabase.from('competition_entries').update({
            dropped_out: newValue
        }).eq('id', entryId);
        setEntries((prev)=>prev.map((e)=>e.id === entryId ? {
                    ...e,
                    dropped_out: newValue
                } : e));
    }
    // ── judges ────────────────────────────────────────────────────────────────────
    async function handleInviteJudge(j) {
        const res = await fetch('/api/club/invite-judge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(j)
        });
        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            throw new Error(err.error ?? 'Failed to send invitation');
        }
    }
    async function handleUpdateJudge(id, j) {
        const { full_name, phone, licence } = j;
        await supabase.from('judges').update({
            full_name,
            phone,
            licence
        }).eq('id', id);
        setJudges((prev)=>prev.map((x)=>x.id === id ? {
                    ...x,
                    ...j
                } : x));
    }
    async function handleDeleteJudge(id) {
        await supabase.from('judges').delete().eq('id', id);
        setJudges((prev)=>prev.filter((x)=>x.id !== id));
        setNominations((prev)=>prev.filter((n)=>n.judge_id !== id));
    }
    // ── nominations ───────────────────────────────────────────────────────────────
    async function handleNominate(competitionId, judgeId) {
        if (nominations.some((n)=>n.competition_id === competitionId && n.judge_id === judgeId)) return;
        const { data } = await supabase.from('competition_judge_nominations').insert({
            competition_id: competitionId,
            judge_id: judgeId,
            club_id: clubId
        }).select().single();
        if (data) setNominations((prev)=>[
                ...prev,
                data
            ]);
    }
    async function handleRemoveNomination(nominationId) {
        await supabase.from('competition_judge_nominations').delete().eq('id', nominationId);
        setNominations((prev)=>prev.filter((n)=>n.id !== nominationId));
    }
    // ── club profile ──────────────────────────────────────────────────────────────
    async function handleUpdateClub(data) {
        await supabase.from('clubs').update(data).eq('id', clubId);
        setClub((prev)=>prev ? {
                ...prev,
                ...data
            } : prev);
    }
    async function handleUploadGymnastPhoto(id, file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${id}/photo.${ext}`;
        const { error } = await supabase.storage.from('gymnasts-photos').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('gymnasts-photos').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('gymnasts').update({
            photo_url: url
        }).eq('id', id);
        setGymnasts((prev)=>prev.map((g)=>g.id === id ? {
                    ...g,
                    photo_url: url
                } : g));
    }
    async function handleRemoveLicencia(id) {
        await supabase.from('gymnasts').update({
            licencia_url: null
        }).eq('id', id);
        setGymnasts((prev)=>prev.map((g)=>g.id === id ? {
                    ...g,
                    licencia_url: null
                } : g));
    }
    async function handleUploadLicencia(id, file) {
        const gymnast = gymnasts.find((g)=>g.id === id);
        if (!gymnast) return;
        const ext = file.name.split('.').pop() ?? 'pdf';
        const normalize = (s)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        const nameParts = [
            gymnast.first_name,
            gymnast.last_name_1,
            gymnast.last_name_2
        ].filter(Boolean).map((s)=>normalize(s));
        const path = `${gymnast.club_id}/${nameParts.join('_')}.${ext}`;
        const { error } = await supabase.storage.from('gymnast-licencias').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('gymnast-licencias').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('gymnasts').update({
            licencia_url: url
        }).eq('id', id);
        setGymnasts((prev)=>prev.map((g)=>g.id === id ? {
                    ...g,
                    licencia_url: url
                } : g));
    }
    async function handleUploadTeamPhoto(id, file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${id}/photo.${ext}`;
        const { error } = await supabase.storage.from('team-photos').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('team-photos').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('teams').update({
            photo_url: url
        }).eq('id', id);
        setTeams((prev)=>prev.map((t)=>t.id === id ? {
                    ...t,
                    photo_url: url
                } : t));
    }
    async function handleUploadAvatar(file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${clubId}/avatar.${ext}`;
        const { error } = await supabase.storage.from('club-logos').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('clubs').update({
            avatar_url: url
        }).eq('id', clubId);
        setClub((prev)=>prev ? {
                ...prev,
                avatar_url: url
            } : prev);
    }
    async function handleUploadJudgePhoto(id, file) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${id}/photo.${ext}`;
        const { error } = await supabase.storage.from('judge-photos').upload(path, file, {
            upsert: true
        });
        if (error) {
            setUploadError(error.message);
            return;
        }
        const { data } = supabase.storage.from('judge-photos').getPublicUrl(path);
        const url = data.publicUrl;
        await supabase.from('judges').update({
            avatar_url: url
        }).eq('id', id);
        setJudges((prev)=>prev.map((j)=>j.id === id ? {
                    ...j,
                    avatar_url: url
                } : j));
    }
    // ── files (music + TS sheet) ──────────────────────────────────────────────────
    async function handleSetFile(teamId, competitionId, routineType, field, file) {
        const pathField = field === 'music' ? 'music_path' : 'ts_path';
        const frontendField = field === 'music' ? 'music_filename' : 'ts_filename';
        let storagePath = null;
        if (file) {
            const ext = file.name.split('.').pop() ?? (field === 'ts' ? 'pdf' : 'mp3');
            const bucket = field === 'music' ? 'musics' : 'TS';
            const entry = entries.find((e)=>e.team_id === teamId && e.competition_id === competitionId);
            const team = teams.find((t)=>t.id === teamId);
            const dorsal = entry?.dorsal ?? 0;
            const ageGroupRule = ageGroupRules.find((r)=>r.id === team?.age_group);
            const ageGroup = (ageGroupRule?.age_group ?? team?.age_group ?? 'unknown').replace(/\s+/g, '-');
            const clubSlug = club?.club_name.replace(/\s+/g, '-') ?? 'club';
            const path = `${competitionId}/${dorsal}-${ageGroup}-${routineType}-${clubSlug}.${ext}`;
            const { error } = await supabase.storage.from(bucket).upload(path, file, {
                upsert: true
            });
            if (error) {
                setUploadError(error.message);
                return;
            }
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
            storagePath = urlData.publicUrl;
        }
        const existing = music.find((m)=>m.team_id === teamId && m.competition_id === competitionId && m.routine_type === routineType);
        if (existing) {
            await supabase.from('routine_music').update({
                [pathField]: storagePath
            }).eq('id', existing.id);
            setMusicState((prev)=>prev.map((m)=>m.id === existing.id ? {
                        ...m,
                        [frontendField]: storagePath
                    } : m));
            // DB trigger handles ts_review_status update; sync local state too
            if (field === 'ts' && storagePath) {
                setTsReviewStatuses((prev)=>prev.map((s)=>s.team_id === teamId && s.competition_id === competitionId && s.routine_type === routineType && [
                            'incorrect',
                            'checked'
                        ].includes(s.status) ? {
                            ...s,
                            status: 'new_ts',
                            final_comment: null
                        } : s));
            }
        } else {
            const { data } = await supabase.from('routine_music').insert({
                team_id: teamId,
                competition_id: competitionId,
                routine_type: routineType,
                music_path: field === 'music' ? storagePath : null,
                ts_path: field === 'ts' ? storagePath : null
            }).select().single();
            if (data) {
                const { music_path, ts_path, ...rest } = data;
                setMusicState((prev)=>[
                        ...prev,
                        {
                            ...rest,
                            music_filename: music_path,
                            ts_filename: ts_path
                        }
                    ]);
            }
        }
    }
    if (loading || !club) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"
        }, void 0, false, {
            fileName: "[project]/src/app/club/page.tsx",
            lineNumber: 419,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/club/page.tsx",
        lineNumber: 418,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$shared$2f$AuthBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                onLangChange: setLang
            }, void 0, false, {
                fileName: "[project]/src/app/club/page.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            uploadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: uploadError
                    }, void 0, false, {
                        fileName: "[project]/src/app/club/page.tsx",
                        lineNumber: 429,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setUploadError(null),
                        className: "text-white/70 hover:text-white",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/app/club/page.tsx",
                        lineNumber: 430,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/club/page.tsx",
                lineNumber: 428,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$club$2f$ClubPortal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                lang: lang,
                club: club,
                tsReviewStatuses: tsReviewStatuses,
                gymnasts: gymnasts,
                coaches: coaches,
                competitionCoaches: competitionCoaches,
                teams: teams,
                competitions: competitions,
                entries: entries,
                music: music,
                judges: judges,
                nominations: nominations,
                agLabels: agLabels,
                ageGroupRules: ageGroupRules,
                onAddGymnast: handleAddGymnast,
                onAddGymnastsBulk: handleAddGymnastsBulk,
                onUpdateGymnast: handleUpdateGymnast,
                onDeleteGymnast: handleDeleteGymnast,
                onUploadGymnastPhoto: handleUploadGymnastPhoto,
                onUploadLicencia: handleUploadLicencia,
                onRemoveLicencia: handleRemoveLicencia,
                onAddCoach: handleAddCoach,
                onUpdateCoach: handleUpdateCoach,
                onDeleteCoach: handleDeleteCoach,
                onUploadCoachPhoto: handleUploadCoachPhoto,
                onUploadCoachLicencia: handleUploadCoachLicencia,
                onRegisterCoach: handleRegisterCoach,
                onUnregisterCoach: handleUnregisterCoach,
                onAddTeam: handleAddTeam,
                onUpdateTeam: handleUpdateTeam,
                onDeleteTeam: handleDeleteTeam,
                onUploadTeamPhoto: handleUploadTeamPhoto,
                onRegister: handleRegister,
                onDropout: handleDropout,
                onSetFile: handleSetFile,
                onInviteJudge: handleInviteJudge,
                onUpdateJudge: handleUpdateJudge,
                onDeleteJudge: handleDeleteJudge,
                onUploadJudgePhoto: handleUploadJudgePhoto,
                onNominate: handleNominate,
                onRemoveNomination: handleRemoveNomination,
                onUpdateClub: handleUpdateClub,
                onUploadAvatar: handleUploadAvatar
            }, void 0, false, {
                fileName: "[project]/src/app/club/page.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/club/page.tsx",
        lineNumber: 424,
        columnNumber: 5
    }, this);
}
_s(Page, "PcXYVd982c0tqPPWfBscLFN1d6c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"]
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

//# sourceMappingURL=src_c8b0397f._.js.map