import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { 
    totalBalance, members, settleBill, billToSettle, showSettleModal, 
    showGalonModal, confirmBuyGalon, showCustomPatunganModal, showCancelModal, 
    billToCancel, confirmCancelPatungan, showResetModal, confirmResetData, appSettings
} from '../store/index.js';
import { formatRupiah, createFormattedInput } from '../utils/formatters.js';

import Dashboard from './Dashboard.js';
import InputForm from './InputForm.js';
import HistoryList from './HistoryList.js';
import Settings from './Settings.js';

const template = /*html*/`
<div class="max-w-xl mx-auto p-4 lg:px-0">
    
    <header class="text-center mb-8">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-800">Kas Pisang 🍌</h1>
        <p class="text-slate-500 mt-2">Kelola Keuangan Kontrakan, Bersama & Teratur.</p>
    </header>

    <div class="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-emerald-500">
        <p class="text-sm font-medium text-slate-500">Total Saldo Kas</p>
        <p class="text-4xl sm:text-5xl font-extrabold" :class="totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'">
            {{ formatRupiah(totalBalance) }}
        </p>
    </div>

    <div class="flex mb-8 bg-white p-1.5 rounded-full shadow-md overflow-x-auto whitespace-nowrap">
        <button v-for="(tab, index) in tabs" :key="tab.name" @click="setActiveTab(tab.name, index)" :class="{'bg-indigo-600 text-white shadow-lg': activeTab === tab.name, 'text-slate-700 hover:bg-indigo-50': activeTab !== tab.name}" class="flex-1 py-3 px-2 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-2" v-html="tab.label"></button>
    </div>

    <transition :name="transitionName" mode="out-in">
        <div :key="activeTab" class="tab-content">
            <component :is="activeComponent" @change-tab="navigateToTab"></component>
        </div>
    </transition>
    
    <transition name="modal-fade">
        <div v-if="showSettleModal || showGalonModal || showCustomPatunganModal || showCancelModal || showResetModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div v-if="showSettleModal && billToSettle" class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h3 class="text-lg font-bold text-indigo-600 mb-4">Selesaikan: {{ billToSettle.title }}</h3>
                <form @submit.prevent="handleSettleBill" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Dibayar Oleh</label>
                        <select v-model="settleForm.paidBy" required class="w-full p-3 border border-slate-300 rounded-lg"><option v-for="member in members" :key="member" :value="member">{{ member }}</option></select>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Total Biaya Aktual</label>
                        <input type="text" inputmode="numeric" v-model="formattedSettleAmount" required class="w-full p-3 border border-slate-300 rounded-lg">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-slate-700 mb-2">Metode Pembayaran</label>
                        <div class="flex space-x-2">
                            <label class="flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors" :class="settleForm.paymentMethod === 'member_cash' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-slate-50'">
                                <input type="radio" value="member_cash" v-model="settleForm.paymentMethod" class="sr-only">
                                <span class="font-semibold text-slate-800 text-sm">Tunai Anggota</span>
                                <p class="text-xs text-slate-500">Kas hanya terima sisa</p>
                            </label>
                             <label class="flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors" :class="settleForm.paymentMethod === 'kontrakan_fund' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-slate-50'">
                                <input type="radio" value="kontrakan_fund" v-model="settleForm.paymentMethod" class="sr-only">
                                <span class="font-semibold text-slate-800 text-sm">Uang Kas</span>
                                <p class="text-xs text-slate-500">Kas berkurang</p>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Bukti Bayar (Opsional)</label>
                        <input type="file" @change="handleProofUpload" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                        <p v-if="settleForm.proofImageUrl" class="text-xs text-emerald-600 mt-2">✓ Gambar siap diunggah.</p>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" @click="showSettleModal = false" class="py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">Batal</button>
                        <button type="submit" class="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">Konfirmasi</button>
                    </div>
                </form>
            </div>
            <div v-if="showGalonModal" class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                 <h3 class="text-lg font-bold text-cyan-600 mb-4">Konfirmasi Beli Galon</h3>
                 <form @submit.prevent="handleBuyGalon" class="space-y-4">
                     <div>
                         <label class="block text-sm font-medium text-slate-700 mb-1">Harga Galon (Rp)</label>
                         <input type="text" inputmode="numeric" v-model="formattedGalonPrice" required class="w-full p-3 border border-slate-300 rounded-lg">
                     </div>
                     <div>
                         <div class="flex space-x-2">
                             <label class="flex-1 p-3 border-2 rounded-lg cursor-pointer" :class="galonForm.paymentMethod === 'member_cash' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-slate-50'"><input type="radio" value="member_cash" v-model="galonForm.paymentMethod" class="sr-only"><span class="font-semibold text-slate-800">Tunai Anggota</span><p class="text-xs text-slate-500">Kas tidak berkurang</p></label>
                             <label class="flex-1 p-3 border-2 rounded-lg cursor-pointer" :class="galonForm.paymentMethod === 'kontrakan_fund' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-slate-50'"><input type="radio" value="kontrakan_fund" v-model="galonForm.paymentMethod" class="sr-only"><span class="font-semibold text-slate-800">Uang Kas</span><p class="text-xs text-slate-500">Kas berkurang</p></label>
                         </div>
                     </div>
                     <div class="flex justify-end space-x-3 pt-4">
                         <button type="button" @click="showGalonModal = false" class="py-2 px-4 bg-slate-200 rounded-lg">Batal</button>
                         <button type="submit" class="py-2 px-4 bg-cyan-600 text-white rounded-lg">Konfirmasi</button>
                     </div>
                 </form>
            </div>
            <div v-if="showCancelModal && billToCancel" class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h3 class="text-lg font-bold text-red-600 mb-4">Batalkan Patungan?</h3>
                <p class="text-slate-700 mb-6">Anda yakin ingin membatalkan patungan <span class="font-bold">"{{billToCancel.title}}"</span>? Aksi ini tidak dapat diurungkan.</p>
                <div class="flex justify-end space-x-3">
                    <button @click="showCancelModal = false" class="py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">Tidak</button>
                    <button @click="confirmCancelPatungan" class="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">Ya, Batalkan</button>
                </div>
            </div>
             <div v-if="showResetModal" class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h3 class="text-lg font-bold text-red-600 mb-4">Reset Semua Data?</h3>
                <p class="text-slate-700 mb-6">Semua data transaksi, patungan, dan pengaturan akan dihapus permanen. Lanjutkan?</p>
                <div class="flex justify-end space-x-3">
                    <button @click="showResetModal = false" class="py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">Tidak</button>
                    <button @click="confirmResetData" class="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">Ya, Reset Sekarang</button>
                </div>
            </div>
        </div>
    </transition>
</div>
`;

function setup() {
    // --- UI State & Navigation ---
    const activeTab = ref('dashboard');
    const currentTabIndex = ref(0);
    const previousTabIndex = ref(0);
    const transitionName = ref('slide-left');
    
    const tabs = [
        { name: 'dashboard', component: Dashboard, label: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> Dashboard' },
        { name: 'input', component: InputForm, label: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> Input' },
        { name: 'list', component: HistoryList, label: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg> Riwayat' },
        { name: 'settings', component: Settings, label: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Pengaturan' },
    ];

    const activeComponent = computed(() => {
        const current = tabs.find(tab => tab.name === activeTab.value);
        return current ? current.component : Dashboard;
    });

    const setActiveTab = (tabName, index) => {
        previousTabIndex.value = currentTabIndex.value;
        currentTabIndex.value = index;
        activeTab.value = tabName;
        transitionName.value = (previousTabIndex.value < currentTabIndex.value) ? 'slide-left' : 'slide-right';
    };
    
    const navigateToTab = (tabName) => {
        const tabIndex = tabs.findIndex(t => t.name === tabName);
        if (tabIndex !== -1) {
            setActiveTab(tabName, tabIndex);
        }
    };

    // --- Modal Forms & Handlers ---
    const settleForm = ref({ paidBy: members.value[0], actualAmount: null, proofImageUrl: null, paymentMethod: 'member_cash' });
    const galonForm = ref({ paymentMethod: 'member_cash', price: appSettings.value.galonDefault });

    const formattedSettleAmount = createFormattedInput(settleForm, 'actualAmount');
    const formattedGalonPrice = createFormattedInput(galonForm, 'price');
    
    const handleSettleBill = () => {
        if (!settleForm.value.actualAmount) return;
        settleBill(settleForm.value);
        navigateToTab('list');
    };
    
    const handleBuyGalon = () => {
        if (!galonForm.value.price || galonForm.value.price <= 0) return;
        confirmBuyGalon(galonForm.value.price, galonForm.value.paymentMethod);
        navigateToTab('list');
    };

    const handleProofUpload = (event) => {
        const file = event.target.files[0];
        if (!file) { settleForm.value.proofImageUrl = null; return; }
        const reader = new FileReader();
        reader.onload = (e) => { settleForm.value.proofImageUrl = e.target.result; };
        reader.readAsDataURL(file);
    };
    
    return {
        totalBalance, formatRupiah, activeTab, setActiveTab, transitionName, tabs, activeComponent, navigateToTab,
        // Modals
        showSettleModal, billToSettle, showGalonModal, showCustomPatunganModal, showCancelModal, billToCancel, showResetModal, confirmCancelPatungan, confirmResetData,
        // Modal Forms
        settleForm, formattedSettleAmount, handleSettleBill, galonForm, formattedGalonPrice, handleBuyGalon, members, handleProofUpload
    };
}

export default { template, setup };