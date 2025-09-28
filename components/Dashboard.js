import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { activeBills, members, appSettings, initiatePatungan, markAsPaid, openSettleModal, openCancelModal, currentGalonPayer, previousGalonPayer, nextGalonPayer, showGalonModal, showCustomPatunganModal } from '../store/index.js';
import { formatRupiah, createFormattedInput } from '../utils/formatters.js';
import { getBillTypeDescription } from '../utils/uiHelpers.js';

const template = /*html*/`
<section class="space-y-8">
    <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-cyan-500">
        <h2 class="text-xl font-bold mb-5 text-slate-800">Status Galon</h2>
        <div class="flex justify-around items-end text-center mb-6">
            <div class="flex-1"><p class="text-xs text-slate-400 mb-1">Kemarin</p><p class="text-lg font-semibold text-slate-600 p-2 bg-slate-100 rounded-lg">{{ previousGalonPayer }}</p></div>
            <div class="flex-1 mx-2"><p class="text-sm text-cyan-700 mb-1 font-semibold">Sekarang</p><p class="text-3xl font-extrabold text-cyan-600 p-3 bg-cyan-50 rounded-xl shadow-inner">{{ currentGalonPayer }}</p></div>
            <div class="flex-1"><p class="text-xs text-slate-400 mb-1">Berikutnya</p><p class="text-lg font-semibold text-slate-600 p-2 bg-slate-100 rounded-lg">{{ nextGalonPayer }}</p></div>
        </div>
        <button @click="showGalonModal = true" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.23 8.5 8 7.22 8 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.22-.23 2.5-.9 3.23-.73.5-1.1 1.2-1.1 1.95S14.27 13 15 13.7c.5.5.7 1.12.7 1.75 0 2.22-1.8 4.02-4 4.02-1.48 0-2.8-.78-3.5-2.02"/><path d="M10.27 21.9a1 1 0 0 0 1.41 0l2.32-2.32"/></svg>
            Beli Galon Sekarang
        </button>
    </div>
    
    <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800">Aksi Patungan</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flip-card h-32" :class="{'flipped': cardStates.wifi}">
                <div class="flip-card-inner">
                    <div @click="cardStates.wifi = true" class="flip-card-front p-4 bg-indigo-500 text-white shadow-lg cursor-pointer flex flex-col justify-between">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
                        <span class="font-bold text-lg">Patungan Wifi</span>
                    </div>
                    <div class="flip-card-back p-4 bg-white border-2 border-indigo-200 shadow-lg">
                        <p class="font-bold text-sm text-indigo-700 mb-2">Iuran Wifi ({{formatRupiah(appSettings.wifiPrice)}})</p>
                        <form @submit.prevent="handleInitiatePatungan('wifi')" class="flex flex-col h-full">
                            <input v-model="patunganForms.wifi.title" type="text" placeholder="Ex: Wifi Okt 2025" required class="w-full text-xs p-2 border rounded mb-2">
                            <button type="submit" class="w-full mt-auto text-xs bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600">Mulai</button>
                        </form>
                        <button @click.stop="cardStates.wifi = false" class="absolute top-1 right-1 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></button>
                    </div>
                </div>
            </div>
            <div class="flip-card h-32" :class="{'flipped': cardStates.listrik}">
                <div class="flip-card-inner">
                    <div @click="cardStates.listrik = true" class="flip-card-front p-4 bg-amber-500 text-white shadow-lg cursor-pointer flex flex-col justify-between">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        <span class="font-bold text-lg">Patungan Listrik</span>
                    </div>
                    <div class="flip-card-back p-4 bg-white border-2 border-amber-200 shadow-lg">
                        <p class="font-bold text-sm text-amber-700 mb-2">Iuran Token Listrik</p>
                        <form @submit.prevent="handleInitiatePatungan('listrik')" class="flex flex-col h-full">
                            <input v-model="patunganForms.listrik.title" type="text" placeholder="Ex: Token 100k" required class="w-full text-xs p-2 border rounded mb-1">
                            <input v-model="formattedListrikTarget" type="text" inputmode="numeric" placeholder="Target Beli (Rp)" required class="w-full text-xs p-2 border rounded mb-2">
                            <button type="submit" class="w-full mt-auto text-xs bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600">Mulai</button>
                        </form>
                        <button @click.stop="cardStates.listrik = false" class="absolute top-1 right-1 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></button>
                    </div>
                </div>
            </div>
            <div @click="openCustomPatungan" class="p-4 h-32 bg-slate-600 text-white rounded-2xl shadow-lg flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span class="font-bold text-lg">Patungan Kustom</span>
            </div>
        </div>
    </div>

    <div>
        <h2 class="text-xl font-bold mb-4 text-slate-800">Patungan Aktif</h2>
        <div v-if="activeBills.length > 0" class="space-y-4">
            <div v-for="bill in activeBills" :key="bill.id" class="bg-white p-4 rounded-2xl shadow-lg relative">
                 <button @click="openCancelModal(bill)" class="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-slate-800">{{ bill.title }}</p>
                        <p class="text-xs text-slate-500">{{ getBillTypeDescription(bill.type) }}</p>
                    </div>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Mengumpulkan</span>
                </div>
                <div class="mt-4">
                    <div class="flex justify-between text-sm mb-1"><span class="font-semibold text-slate-600">Terkumpul</span><span>{{ formatRupiah(bill.totalCollected) }} / {{ formatRupiah(bill.targetTotal) }}</span></div>
                    <div class="w-full bg-slate-200 rounded-full h-2.5"><div class="bg-emerald-500 h-2.5 rounded-full" :style="{ width: (bill.totalCollected / bill.targetTotal * 100) + '%' }"></div></div>
                </div>
                <div class="mt-4">
                    <p class="text-sm font-semibold mb-2 text-slate-600">Partisipan ({{ bill.participants.filter(p => p.paid).length }}/{{ bill.participants.length }})</p>
                    <div class="grid grid-cols-2 gap-2">
                        <label v-for="p in bill.participants" :key="p.name" class="flex items-center p-2 border rounded-lg cursor-pointer transition-colors" :class="p.paid ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-slate-50'"><input type="checkbox" :checked="p.paid" @change="markAsPaid(bill.id, p.name)" class="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"><span class="ml-2 text-sm text-slate-700">{{ p.name }}</span></label>
                    </div>
                </div>
                <div v-if="bill.totalCollected >= bill.targetTotal" class="mt-4">
                    <button @click="openSettleModal(bill)" class="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition shadow-lg">Bayar & Selesaikan</button>
                </div>
            </div>
        </div>
        <p v-else class="text-center text-slate-500 py-6 bg-slate-50 rounded-2xl">Tidak ada patungan yang sedang aktif.</p>
    </div>
    
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="isCustomPatunganModalVisible" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h3 class="text-lg font-bold text-slate-700 mb-4">Buat Patungan Kustom</h3>
                <form @submit.prevent="handleInitiateCustomPatungan" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                        <input type="text" v-model="customPatunganForm.title" required placeholder="Contoh: Beli Gas Elpiji" class="w-full p-3 border border-slate-300 rounded-lg">
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Total Biaya</label>
                        <input type="text" inputmode="numeric" v-model="formattedCustomTarget" required placeholder="Contoh: 23.000" class="w-full p-3 border border-slate-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Pilih Partisipan</label>
                        <div class="grid grid-cols-2 gap-2">
                             <label v-for="member in members" :key="member" class="flex items-center p-2 border rounded-lg cursor-pointer" :class="customPatunganForm.selectedMembers.includes(member) ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-slate-50'"><input type="checkbox" :value="member" v-model="customPatunganForm.selectedMembers" class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"><span class="ml-2 text-sm text-slate-700">{{ member }}</span></label>
                        </div>
                    </div>
                    <div v-if="customPatunganForm.targetAmount && customPatunganForm.selectedMembers.length > 0">
                        <p class="text-sm text-center text-slate-600 bg-slate-100 p-2 rounded-lg">
                           Iuran per orang: <span class="font-bold">{{ formatRupiah(customPatunganForm.targetAmount / customPatunganForm.selectedMembers.length) }}</span>
                        </p>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" @click="isCustomPatunganModalVisible = false" class="py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">Batal</button>
                        <button type="submit" class="py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-semibold">Mulai Patungan</button>
                    </div>
                </form>
            </div>
        </div>
      </transition>
    </teleport>
</section>
`;

function setup() {
    const cardStates = ref({ wifi: false, listrik: false });
    const patunganForms = ref({ 
        wifi: { title: '' }, 
        listrik: { title: '', targetAmount: null }
    });
    const customPatunganForm = ref({
        title: '',
        targetAmount: null,
        selectedMembers: []
    });
    const isCustomPatunganModalVisible = ref(false);

    const formattedListrikTarget = createFormattedInput(computed(() => patunganForms.value.listrik), 'targetAmount');
    const formattedCustomTarget = createFormattedInput(customPatunganForm, 'targetAmount');

    const handleInitiatePatungan = (type) => {
        const form = patunganForms.value[type];
        if (!form.title) return;

        let participants;
        const extraFee = appSettings.value.extraFee || 5000;

        if (type === 'wifi') {
            const targetAmount = appSettings.value.wifiPrice || 300000;
            const amountPerPerson = Math.ceil(targetAmount / members.value.length) + extraFee;
            participants = members.value.map(name => ({ name, paid: false, amount: amountPerPerson }));
        } else if (type === 'listrik') {
            if (!form.targetAmount || form.targetAmount <= 0) return;
            const targetAmount = form.targetAmount;
            const amountPerPerson = Math.ceil(targetAmount / members.value.length) + extraFee;
            participants = members.value.map(name => ({ name, paid: false, amount: amountPerPerson }));
        }

        initiatePatungan(type, form, participants);
        form.title = '';
        if(form.targetAmount) form.targetAmount = null;
        cardStates.value[type] = false;
    };
    
    const openCustomPatungan = () => {
        customPatunganForm.value = { title: '', targetAmount: null, selectedMembers: [...members.value] };
        isCustomPatunganModalVisible.value = true;
    };

    const handleInitiateCustomPatungan = () => {
        const form = customPatunganForm.value;
        if (!form.title || !form.targetAmount || form.selectedMembers.length === 0) return;
        
        const amountPerPerson = Math.ceil(form.targetAmount / form.selectedMembers.length);
        const participants = form.selectedMembers.map(name => ({ name, paid: false, amount: amountPerPerson }));
        
        initiatePatungan('custom', form, participants);
        isCustomPatunganModalVisible.value = false;
    };

    return {
        activeBills, members, appSettings, markAsPaid, openSettleModal, openCancelModal,
        currentGalonPayer, previousGalonPayer, nextGalonPayer, showGalonModal,
        formatRupiah, getBillTypeDescription,
        cardStates, patunganForms, formattedListrikTarget, handleInitiatePatungan,
        isCustomPatunganModalVisible, customPatunganForm, formattedCustomTarget, openCustomPatungan, handleInitiateCustomPatungan,
    };
}

export default { template, setup };