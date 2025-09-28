import { ref, computed, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

// --- DEFAULTS ---
const defaultSettings = {
    galonDefault: 7000,
    extraFee: 5000,
    wifiPrice: 300000,
};

// --- STATE MANAGEMENT (semua diekspor agar bisa diimpor di komponen lain) ---
export const members = ref(['Bima', 'Angga', 'Jimmy', 'Faiz']);
export const appSettings = ref(JSON.parse(localStorage.getItem('kasKontrakanV2_settings')) || { ...defaultSettings });
export const transactions = ref(JSON.parse(localStorage.getItem('kasKontrakanV2_trans')) || []);
export const sharedBills = ref(JSON.parse(localStorage.getItem('kasKontrakanV2_bills')) || []);
export const galonPayerIndex = ref(parseInt(localStorage.getItem('kasKontrakanV2_galonIdx')) || 0);

// --- MODAL STATES ---
export const showSettleModal = ref(false);
export const billToSettle = ref(null);
export const showGalonModal = ref(false);
export const showCustomPatunganModal = ref(false);
export const showCancelModal = ref(false);
export const billToCancel = ref(null);
export const showResetModal = ref(false);

// --- COMPUTED PROPERTIES ---
export const totalBalance = computed(() => {
    return transactions.value.reduce((sum, t) => {
        const amount = t.amount || 0;
        if (['income', 'bill_surplus'].includes(t.type)) return sum + amount;
        if (['expense', 'galon_expense', 'patungan_expense'].includes(t.type)) return sum - amount;
        return sum;
    }, 0);
});

export const activeBills = computed(() => sharedBills.value.filter(b => b.status === 'collecting'));

export const currentGalonPayer = computed(() => members.value[galonPayerIndex.value]);
export const previousGalonPayer = computed(() => members.value[(galonPayerIndex.value - 1 + members.value.length) % members.value.length]);
export const nextGalonPayer = computed(() => members.value[(galonPayerIndex.value + 1) % members.value.length]);

// --- WATCHERS (untuk menyimpan ke localStorage) ---
watch(transactions, (val) => localStorage.setItem('kasKontrakanV2_trans', JSON.stringify(val)), { deep: true });
watch(sharedBills, (val) => localStorage.setItem('kasKontrakanV2_bills', JSON.stringify(val)), { deep: true });
watch(galonPayerIndex, (val) => localStorage.setItem('kasKontrakanV2_galonIdx', val.toString()));
watch(appSettings, (val) => localStorage.setItem('kasKontrakanV2_settings', JSON.stringify(val)), { deep: true });


// --- METHODS / ACTIONS (Fungsi yang memodifikasi state) ---
export const addSimpleTransaction = (transactionData) => {
    transactions.value.push({
        id: Date.now(),
        date: new Date().toISOString(),
        ...transactionData
    });
};

export const initiatePatungan = (type, form, participantsData) => {
    sharedBills.value.push({
        id: Date.now(),
        type,
        title: form.title,
        status: 'collecting',
        targetAmountPerPerson: participantsData[0].amount,
        targetTotal: participantsData.reduce((sum, p) => sum + p.amount, 0),
        totalCollected: 0,
        participants: participantsData,
        paymentDetails: null,
        settlement: null,
    });
};

export const markAsPaid = (billId, memberName) => {
    const bill = sharedBills.value.find(b => b.id === billId);
    const participant = bill.participants.find(p => p.name === memberName);
    participant.paid = !participant.paid;
    bill.totalCollected = bill.participants.reduce((sum, p) => p.paid ? sum + p.amount : sum, 0);
};

export const confirmCancelPatungan = () => {
    if (!billToCancel.value) return;
    sharedBills.value = sharedBills.value.filter(b => b.id !== billToCancel.value.id);
    showCancelModal.value = false;
    billToCancel.value = null;
};

export const confirmResetData = () => {
    localStorage.removeItem('kasKontrakanV2_trans');
    localStorage.removeItem('kasKontrakanV2_bills');
    localStorage.removeItem('kasKontrakanV2_galonIdx');
    localStorage.removeItem('kasKontrakanV2_settings');
    location.reload();
};

export const confirmBuyGalon = (galonPrice, paymentMethod) => {
    const payer = currentGalonPayer.value;
    const now = new Date();

    if (paymentMethod === 'kontrakan_fund') {
        transactions.value.push({
            id: now.getTime(),
            date: now.toISOString(),
            type: 'galon_expense',
            description: `Beli Galon (oleh ${payer})`,
            amount: galonPrice
        });
    }
    
    sharedBills.value.push({
        id: now.getTime() + 1, type: 'galon', title: `Beli Galon - ${new Date(now).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`, status: 'settled',
        targetTotal: galonPrice, totalCollected: galonPrice,
        participants: [{ name: payer, paid: true, amount: galonPrice }],
        paymentDetails: { paidBy: payer, actualAmount: galonPrice, date: now.toISOString(), method: paymentMethod },
        settlement: { surplus: 0 }
    });

    galonPayerIndex.value = (galonPayerIndex.value + 1) % members.value.length;
    showGalonModal.value = false;
};


export const settleBill = (settleFormData) => {
    if (!billToSettle.value) return;
    const bill = sharedBills.value.find(b => b.id === billToSettle.value.id);
    bill.status = 'settled';
    bill.paymentDetails = { ...settleFormData, date: new Date().toISOString() };
    
    const surplus = bill.totalCollected - bill.paymentDetails.actualAmount;
    
    if (bill.paymentDetails.paymentMethod === 'kontrakan_fund') {
         transactions.value.push({
            id: Date.now(),
            type: 'patungan_expense',
            description: `Bayar patungan "${bill.title}"`,
            amount: bill.paymentDetails.actualAmount,
            date: new Date().toISOString(),
        });
    }

    if (surplus !== 0) {
        transactions.value.push({
            id: Date.now() + 1,
            type: 'bill_surplus',
            description: `Sisa/Kurang Kas dari "${bill.title}"`,
            amount: surplus,
            date: new Date().toISOString(),
        });
    }
    bill.settlement = { surplus };
    
    showSettleModal.value = false;
    billToSettle.value = null;
};

// --- Modal Triggers ---
export const openSettleModal = (bill) => {
    billToSettle.value = bill;
    showSettleModal.value = true;
};
export const openCancelModal = (bill) => {
    billToCancel.value = bill;
    showCancelModal.value = true;
};