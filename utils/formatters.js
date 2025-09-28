export const formatRupiah = (number) => {
    if (typeof number !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

// Fungsi untuk membuat input Rupiah menjadi reaktif
export const createFormattedInput = (targetObject, key) => {
    const { computed } = Vue;
    return computed({
        get: () => {
            const value = targetObject.value[key];
            if (value === null || value === undefined) return '';
            return value.toLocaleString('id-ID');
        },
        set: (newValue) => {
            const numericValue = parseInt(String(newValue).replace(/[^0-9]/g, ''), 10);
            targetObject.value[key] = isNaN(numericValue) ? null : numericValue;
        }
    });
};