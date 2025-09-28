import { ref, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { appSettings, showResetModal } from '../store/index.js';
import { createFormattedInput } from '../utils/formatters.js';

const template = /*html*/`
<section class="space-y-6">
    <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-slate-500">
        <h2 class="text-xl font-bold mb-6 text-slate-800">Pengaturan Harga Default</h2>
        <form @submit.prevent class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Harga Default Galon</label>
                <input type="text" inputmode="numeric" v-model="formattedSettingGalon" class="w-full p-3 border border-slate-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Biaya Tambahan Patungan</label>
                <input type="text" inputmode="numeric" v-model="formattedSettingFee" class="w-full p-3 border border-slate-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Harga Wifi Bulanan</label>
                <input type="text" inputmode="numeric" v-model="formattedSettingWifi" class="w-full p-3 border border-slate-300 rounded-lg">
            </div>
        </form>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-red-500">
        <h2 class="text-xl font-bold mb-4 text-slate-800">Zona Berbahaya</h2>
        <p class="text-sm text-slate-600 mb-4">Aksi ini akan menghapus semua data transaksi, patungan, dan pengaturan secara permanen.</p>
        <button @click="showResetModal = true" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Reset Semua Data
        </button>
    </div>
</section>
`;

function setup() {
    // Local ref untuk form, lalu watch untuk update state global
    // Ini mencegah update pada setiap ketikan jika tidak diinginkan
    const localSettings = ref({ ...appSettings.value });

    watch(localSettings, (newValue) => {
        appSettings.value = { ...newValue };
    }, { deep: true });
    
    const formattedSettingGalon = createFormattedInput(localSettings, 'galonDefault');
    const formattedSettingFee = createFormattedInput(localSettings, 'extraFee');
    const formattedSettingWifi = createFormattedInput(localSettings, 'wifiPrice');

    return {
        showResetModal,
        formattedSettingGalon,
        formattedSettingFee,
        formattedSettingWifi,
    };
}

export default { template, setup };