import { computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { transactions, sharedBills } from '../store/index.js';
import { formatRupiah, formatDate } from '../utils/formatters.js';
import { getHistoryItemClass, getHistoryItemIcon, getAmountColor } from '../utils/uiHelpers.js';

const template = /*html*/`
<section class="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-indigo-600">
    <h2 class="text-xl font-bold mb-4 text-slate-800">Riwayat Transaksi</h2>
    <div class="scroll-area pr-2">
        <transition-group v-if="combinedHistory.length > 0" name="list" tag="ul" class="space-y-3">
            <li v-for="item in combinedHistory" :key="item.id" class="p-4 rounded-xl flex items-center transition duration-200" :class="getHistoryItemClass(item.type)">
                <div class="mr-4" v-html="getHistoryItemIcon(item.type)"></div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold truncate text-slate-800">{{ item.title }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ item.details }}</p>
                </div>
                <div class="text-right ml-2">
                    <p class="font-extrabold whitespace-nowrap" :class="getAmountColor(item.type, item.amount)">
                        {{ item.amount > 0 ? '+' : '' }}{{ formatRupiah(item.amount) }}
                    </p>
                    <p class="text-xs text-slate-400">{{ formatDate(item.date) }}</p>
                </div>
            </li>
        </transition-group>
        <p v-else class="text-center text-slate-500 py-10">Belum ada riwayat transaksi.</p>
    </div>
</section>
`;

function setup() {
    const combinedHistory = computed(() => {
        const simpleHistory = transactions.value.map(t => ({
            id: t.id, date: t.date, title: t.description,
            amount: ['income', 'bill_surplus'].includes(t.type) ? t.amount : -t.amount,
            details: t.type === 'galon_expense' ? `Pembelian galon dari kas` : t.type === 'patungan_expense' ? 'Pembayaran patungan dari kas' : `Transaksi umum`,
            type: t.type
        }));
        const billHistory = sharedBills.value.filter(b => b.status === 'settled').map(b => {
            let details;
            let amount;
            if (b.type === 'galon') {
                details = `Dibayar oleh ${b.paymentDetails.paidBy}. Metode: ${b.paymentDetails.method === 'kontrakan_fund' ? 'Kas Kontrakan' : 'Tunai Anggota'}`;
                amount = b.paymentDetails.method === 'kontrakan_fund' ? -b.paymentDetails.actualAmount : 0;
            } else {
                details = `Dibayar oleh ${b.paymentDetails.paidBy} via ${b.paymentDetails.paymentMethod === 'kontrakan_fund' ? 'Uang Kas' : 'Tunai Anggota'}.`;
                if (b.settlement.surplus > 0) {
                    details += ` Sisa ${formatRupiah(b.settlement.surplus)} masuk kas.`;
                } else if (b.settlement.surplus < 0) {
                    details += ` Kurang ${formatRupiah(Math.abs(b.settlement.surplus))} ditanggung pembayar.`;
                }
                amount = b.paymentDetails.paymentMethod === 'kontrakan_fund' ? -b.paymentDetails.actualAmount : 0;
            }
            return {
                id: b.id, date: b.paymentDetails.date, title: b.title,
                amount: amount, details: details, type: `bill_${b.type}`
            };
        });
        return [...simpleHistory, ...billHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return {
        combinedHistory,
        formatRupiah,
        formatDate,
        getHistoryItemClass,
        getHistoryItemIcon,
        getAmountColor,
    };
}

export default { template, setup };