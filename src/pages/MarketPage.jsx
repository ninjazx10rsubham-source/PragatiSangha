import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Store, 
  Calendar,
  Wallet
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { exportToExcel } from '../services/exportService';

export default function MarketPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'delete', entry }

  const categories = db.settings?.market_categories || [];
  const entries = db.marketEntries || [];

  const [form, setForm] = useState({
    category: categories[0] || 'পুজোর ফুল',
    shop_name: '',
    item_name: '',
    quantity: '',
    amount: '',
    entry_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (item.visible === false) return false;
      const matchSearch =
        !search ||
        item.item_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.shop_name && item.shop_name.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'সব' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [entries, search, selectedCategory]);

  const totalMarketCost = filteredEntries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleOpenAdd = () => {
    setForm({
      category: categories[0] || 'পুজোর ফুল',
      shop_name: '',
      item_name: '',
      quantity: '',
      amount: '',
      entry_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  const handleOpenEdit = (entry) => {
    setForm({
      category: entry.category,
      shop_name: entry.shop_name || '',
      item_name: entry.item_name,
      quantity: entry.quantity || '',
      amount: entry.amount,
      entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
      notes: entry.notes || ''
    });
    setModalState({ type: 'edit', entry });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.item_name.trim() || !form.amount) {
      showToast('সামগ্রীর নাম ও খরচের পরিমাণ আবশ্যক', 'error');
      return;
    }

    const amount = Number(form.amount) || 0;

    if (modalState.type === 'add') {
      const newEntry = {
        id: 'mk_' + Date.now(),
        category: form.category,
        shop_name: form.shop_name.trim(),
        item_name: form.item_name.trim(),
        quantity: form.quantity.trim(),
        amount: amount,
        entry_date: form.entry_date,
        notes: form.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        marketEntries: [newEntry, ...(prev.marketEntries || [])]
      }));
      showToast('বাজারের সামগ্রী যুক্ত হয়েছে');
    } else if (modalState.type === 'edit') {
      onUpdateDB((prev) => ({
        ...prev,
        marketEntries: (prev.marketEntries || []).map((mk) =>
          mk.id === modalState.entry.id
            ? {
                ...mk,
                category: form.category,
                shop_name: form.shop_name.trim(),
                item_name: form.item_name.trim(),
                quantity: form.quantity.trim(),
                amount: amount,
                entry_date: form.entry_date,
                notes: form.notes.trim()
              }
            : mk
        )
      }));
      showToast('বাজারের তথ্য হালনাগাদ হয়েছে');
    }
    setModalState(null);
  };

  const handleDelete = () => {
    onUpdateDB((prev) => ({
      ...prev,
      marketEntries: (prev.marketEntries || []).filter((mk) => mk.id !== modalState.entry.id)
    }));
    showToast('বাজার এন্ট্রি মুছে ফেলা হয়েছে');
    setModalState(null);
  };

  const handleExportExcel = () => {
    const data = entries.map((item, idx) => ({
      'ক্রমিক': idx + 1,
      'বিভাগ': item.category,
      'সামগ্রীর নাম': item.item_name,
      'পরিমাণ': item.quantity || '-',
      'দোকান': item.shop_name || '-',
      'খরচ (₹)': item.amount,
      'তারিখ': item.entry_date,
      'মন্তব্য': item.notes || '-'
    }));
    exportToExcel(data, 'প্রগতি_সংঘ_বাজারের_ফর্দ_ও_খরচ', 'বাজার ফর্দ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            বাজারের ফর্দ ও সামগ্রী খরচ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            ফুল, ফল, ভোগ, সবজি, মুদিখানা ও জরুরি সামগ্রী ক্রয়ের হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel ফর্দ</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>বাজার এন্ট্রি করুন</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase">মোট বাজার খরচ</span>
            <p className="text-xl font-extrabold text-rose-800">{formatTaka(totalMarketCost)}</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-stone-600">
          মোট সামগ্রী এন্ট্রি: <span className="text-stone-900 font-bold">{toBnDigits(filteredEntries.length)} টি</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="সামগ্রী, দোকান বা বিভাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Category Dropdown/Selector */}
        <div className="shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <option value="সব">সকল বিভাগ (All)</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Market Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো বাজার সামগ্রী পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">বিভাগ</th>
                  <th className="py-3 px-4">সামগ্রীর বিবরণ</th>
                  <th className="py-3 px-4">দোকানের নাম</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">টাকা (₹)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDF8EA]/60 transition">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      {item.item_name}
                      {item.notes && (
                        <p className="text-xs text-stone-500 font-normal italic mt-0.5">{item.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {item.shop_name ? (
                        <span className="flex items-center gap-1">
                          <Store size={13} className="text-stone-400" />
                          <span>{item.shop_name}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {item.quantity || '-'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-rose-800">
                      {formatTaka(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {item.entry_date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'delete', entry: item })}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <Modal
          title={modalState.type === 'add' ? 'নতুন বাজার খরচ যোগ করুন' : 'বাজার এন্ট্রি সম্পাদনা'}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বাজারের বিভাগ *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">তারিখ</label>
                <input
                  type="date"
                  value={form.entry_date}
                  onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">সামগ্রীর নাম *</label>
              <input
                type="text"
                required
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                placeholder="যেমন: গাঁদা ফুল, পদ্মফুল, ঘি, আতপ চাল"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">খরচ / দাম (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="যেমন: 850"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-rose-800"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">পরিমাণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="যেমন: ৫ কেজি, ১০টি"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">দোকানের নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.shop_name}
                  onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                  placeholder="যেমন: রাধে ফুল ভান্ডার"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="বিল নম্বর বা বিশেষ বিবরণ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white rounded-xl font-bold shadow-md"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {modalState?.type === 'delete' && (
        <Modal title="বাজার এন্ট্রি মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.entry.item_name}</span>-এর খরচ মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
