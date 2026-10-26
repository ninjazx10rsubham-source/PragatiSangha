import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Calendar
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits } from '../utils/formatters';
import { exportToExcel } from '../services/exportService';

export default function ExpensesPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'delete', expense }

  const categories = db.settings?.expense_categories || [];
  const expenses = db.expenses || [];

  const [form, setForm] = useState({
    title: '',
    category: categories[0] || 'পুজো',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    paid_by: 'কোষাধ্যক্ষ',
    bill_no: '',
    notes: ''
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (e.visible === false) return false;
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.paid_by && e.paid_by.toLowerCase().includes(search.toLowerCase())) ||
        (e.bill_no && e.bill_no.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategory === 'সব' || e.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, selectedCategory]);

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleOpenAdd = () => {
    setForm({
      title: '',
      category: categories[0] || 'পুজো',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      paid_by: 'কোষাধ্যক্ষ',
      bill_no: '',
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  const handleOpenEdit = (exp) => {
    setForm({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      expense_date: exp.expense_date || new Date().toISOString().split('T')[0],
      paid_by: exp.paid_by || '',
      bill_no: exp.bill_no || '',
      notes: exp.notes || ''
    });
    setModalState({ type: 'edit', expense: exp });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      showToast('খরচের খাত ও টাকার পরিমাণ আবশ্যক', 'error');
      return;
    }

    const amount = Number(form.amount) || 0;

    if (modalState.type === 'add') {
      const newExp = {
        id: 'exp_' + Date.now(),
        title: form.title.trim(),
        category: form.category,
        amount: amount,
        expense_date: form.expense_date,
        paid_by: form.paid_by.trim(),
        bill_no: form.bill_no.trim(),
        notes: form.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        expenses: [newExp, ...(prev.expenses || [])]
      }));
      showToast('খরচের ভাউচার যুক্ত হয়েছে');
    } else if (modalState.type === 'edit') {
      onUpdateDB((prev) => ({
        ...prev,
        expenses: (prev.expenses || []).map((exp) =>
          exp.id === modalState.expense.id
            ? {
                ...exp,
                title: form.title.trim(),
                category: form.category,
                amount: amount,
                expense_date: form.expense_date,
                paid_by: form.paid_by.trim(),
                bill_no: form.bill_no.trim(),
                notes: form.notes.trim()
              }
            : exp
        )
      }));
      showToast('খরচের তথ্য হালনাগাদ হয়েছে');
    }
    setModalState(null);
  };

  const handleDelete = () => {
    onUpdateDB((prev) => ({
      ...prev,
      expenses: (prev.expenses || []).filter((exp) => exp.id !== modalState.expense.id)
    }));
    showToast('খরচ মুছে ফেলা হয়েছে');
    setModalState(null);
  };

  const handleExportExcel = () => {
    const data = expenses.map((e, idx) => ({
      'ক্রমিক': idx + 1,
      'খরচের খাত': e.title,
      'ক্যাটাগরি': e.category,
      'টাকার পরিমাণ (₹)': e.amount,
      'তারিখ': e.expense_date,
      'প্রদানকারী': e.paid_by || '-',
      'ভাউচার / বিল নং': e.bill_no || '-',
      'মন্তব্য': e.notes || '-'
    }));
    exportToExcel(data, 'প্রগতি_সংঘ_পূজা_খরচের_তালিকা', 'পূজা খরচ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            বিবিধ পূজা খরচ ও ভাউচার
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            প্রতিমা, প্যান্ডেল, আলো, সাউন্ড, পুরোহিত ও বিবিধ আয়োজনের খরচের হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel খরচ</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>নতুন খরচ লিখুন</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
            <ReceiptText size={20} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase">মোট পূজা খরচ</span>
            <p className="text-xl font-extrabold text-rose-800">{formatTaka(totalExpenseAmount)}</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-stone-600">
          মোট ভাউচার সংখ্যা: <span className="text-stone-900 font-bold">{toBnDigits(filteredExpenses.length)} টি</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="খাত, ভাউচার নং বা কে খরচ করলেন তা দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        <div className="shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            <option value="সব">সকল ক্যাটাগরি (All)</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো খরচ খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">খরচের খাত</th>
                  <th className="py-3 px-4">পরিমাণ (₹)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">কে করলেন</th>
                  <th className="py-3 px-4">বিল / ভাউচার</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FDF8EA]/60 transition">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      {exp.title}
                      {exp.notes && (
                        <p className="text-xs text-stone-500 font-normal italic mt-0.5">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-rose-800">
                      {formatTaka(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {exp.expense_date}
                    </td>
                    <td className="py-3 px-4 text-stone-800 font-medium">
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-stone-400" />
                        <span>{exp.paid_by || '-'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-stone-700">
                      {exp.bill_no ? (
                        <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-900 border border-amber-200">
                          {exp.bill_no}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'delete', expense: exp })}
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
          title={modalState.type === 'add' ? 'নতুন পূজা খরচ যোগ করুন' : 'খরচ সম্পাদনা'}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">ক্যাটাগরি *</label>
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
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">খরচের খাত বা বিবরণ *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="যেমন: প্রতিমা বায়না, ডেকোরেটর্স প্যান্ডেল চার্জ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">টাকার পরিমাণ (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="যেমন: 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-rose-800"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">কে খরচ করলেন?</label>
                <input
                  type="text"
                  value={form.paid_by}
                  onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
                  placeholder="যেমন: সম্পাদক / কোষাধ্যক্ষ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বিল বা ভাউচার নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.bill_no}
                  onChange={(e) => setForm({ ...form, bill_no: e.target.value })}
                  placeholder="যেমন: V-101"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="বিশেষ বিবরণ"
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
        <Modal title="খরচ মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.expense.title}</span>-এর খরচ মুছে ফেলতে চান?
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
