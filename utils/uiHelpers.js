export const getBillTypeDescription = (type) => ({'wifi': 'Iuran Wifi', 'listrik': 'Iuran Listrik', 'custom': 'Patungan Kustom'}[type] || 'Patungan');

export const getHistoryItemClass = (type) => {
    const classMap = { income: 'bg-emerald-50 border-emerald-400', bill_surplus: 'bg-emerald-50 border-emerald-400', expense: 'bg-red-50 border-red-400', galon_expense: 'bg-red-50 border-red-400', patungan_expense: 'bg-red-50 border-red-400', bill_galon: 'bg-cyan-50 border-cyan-400', bill_wifi: 'bg-indigo-50 border-indigo-400', bill_listrik: 'bg-amber-50 border-amber-400', bill_custom: 'bg-slate-50 border-slate-400' };
    return `${classMap[type] || 'bg-gray-50 border-gray-400'} border-l-4`;
};

export const getHistoryItemIcon = (type) => {
     const iconSVG = { 
        income: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>', 
        expense: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17V7h10"/><path d="M7 7 17 17"/></svg>', 
        bill_surplus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>', 
        galon_expense: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.23 8.5 8 7.22 8 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.22-.23 2.5-.9 3.23-.73.5-1.1 1.2-1.1 1.95S14.27 13 15 13.7c.5.5.7 1.12.7 1.75 0 2.22-1.8 4.02-4 4.02-1.48 0-2.8-.78-3.5-2.02"/><path d="M10.27 21.9a1 1 0 0 0 1.41 0l2.32-2.32"/></svg>', 
        patungan_expense: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17V7h10"/><path d="M7 7 17 17"/></svg>',
        bill_galon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.23 8.5 8 7.22 8 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.22-.23 2.5-.9 3.23-.73.5-1.1 1.2-1.1 1.95S14.27 13 15 13.7c.5.5.7 1.12.7 1.75 0 2.22-1.8 4.02-4 4.02-1.48 0-2.8-.78-3.5-2.02"/><path d="M10.27 21.9a1 1 0 0 0 1.41 0l2.32-2.32"/></svg>', 
        bill_wifi: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>', 
        bill_listrik: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', 
        bill_custom: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    };
    return iconSVG[type] || '';
};

export const getAmountColor = (type, amount) => {
    if ((type === 'bill_galon' || type.startsWith('bill_')) && amount === 0) return 'text-slate-500'; // Tunai
    return amount >= 0 ? 'text-emerald-600' : 'text-red-600';
};