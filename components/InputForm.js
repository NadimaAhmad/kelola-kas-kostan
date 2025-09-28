import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { addSimpleTransaction } from '../store/index.js';
import { createFormattedInput } from '../utils/formatters.js';

const template = /*html*/`
<section class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-indigo-600">
    <h2 class="text-xl font-bold mb-6 text-slate-800">Input Transaksi Umum</h2>
    <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Jenis Transaksi</label>
            <div class="flex space-x-2">
                <button type="button" @click="simpleForm.type = 'income'" :class="{'bg-emerald-100 border-emerald-500': simpleForm.type === 'income', 'bg-slate-100 border-slate-300': simpleForm.type !== 'income'}" class="flex-1 p-3 rounded-lg border-2 font-semibold transition">Pemasukan</button>
                <button type="button" @click="simpleForm.type = 'expense'" :class="{'bg-red-100 border-red-500': simpleForm.type === 'expense', 'bg-slate-100 border-slate-300': simpleForm.type !== 'expense'}" class="flex-1 p-3 rounded-lg border-2 font-semibold transition">Pengeluaran</button>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
            <input type="text" v-model="simpleForm.description" required placeholder="Contoh: Iuran kas wajib, Beli sapu" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nilai (Rp)</label>
            <input type="text" inputmode="numeric" v-model="formattedSimpleAmount" required class="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <button type="submit" :disabled="!simpleForm.description || !simpleForm.amount" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-xl disabled:bg-slate-400 flex items-center justify-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
             Catat Transaksi
        </button>
    </form>
</section>
`;

function setup(props, { emit }) {
    const simpleForm = ref({ type: 'expense', description: '', amount: null });
    const formattedSimpleAmount = createFormattedInput(simpleForm, 'amount');

    const handleSubmit = () => {
        if (!simpleForm.value.description || !simpleForm.value.amount) return;
        addSimpleTransaction({ ...simpleForm.value });
        simpleForm.value = { type: 'expense', description: '', amount: null };
        emit('change-tab', 'list'); // Memberi tahu parent untuk pindah tab
    };

    return {
        simpleForm,
        formattedSimpleAmount,
        handleSubmit,
    };
}

export default { template, setup };