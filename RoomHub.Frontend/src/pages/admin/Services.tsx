import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Service {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  commissionRate: number;
}

const money = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [commission, setCommission] = useState('10');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => setToast({ text, type });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {
      triggerToast('Không thể tải danh mục dịch vụ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setCommission('10');
  };

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setName(s.name);
    setDescription(s.description || '');
    setBasePrice(String(s.basePrice));
    setCommission(String(Math.round(s.commissionRate * 100)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      basePrice: Number(basePrice) || 0,
      commissionRate: (Number(commission) || 0) / 100,
    };
    try {
      if (editingId) {
        const res = await api.put(`/admin/services/${editingId}`, body);
        setServices(prev => prev.map(s => (s.id === editingId ? res.data : s)));
        triggerToast('Đã cập nhật dịch vụ.');
      } else {
        const res = await api.post('/admin/services', body);
        setServices(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        triggerToast('Đã thêm dịch vụ.');
      }
      resetForm();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể lưu dịch vụ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      await api.delete(`/admin/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      triggerToast('Đã xóa dịch vụ.');
      if (editingId === id) resetForm();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể xóa dịch vụ.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 relative">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Form thêm/sửa */}
      <Reveal>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 lg:sticky lg:top-[96px]">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">{editingId ? 'edit' : 'add_circle'}</span>
            {editingId ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
          </h3>
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên dịch vụ" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Mô tả" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white resize-none" />
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Giá cơ bản (đ)</label>
              <input type="number" min={0} value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="150000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Hoa hồng (%)</label>
              <input type="number" min={0} max={100} value={commission} onChange={e => setCommission(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white" />
            </div>
            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer">Hủy</button>
              )}
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {editingId ? 'Lưu' : 'Thêm'}
              </button>
            </div>
          </div>
        </form>
      </Reveal>

      {/* Danh sách dịch vụ */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-xl font-bold text-on-surface mb-1">Danh mục dịch vụ</h2>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
            <p className="text-xs font-bold text-gray-500">Đang tải...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-10 text-center text-xs font-semibold text-gray-500">
            Chưa có dịch vụ nào. Thêm mới ở form bên trái.
          </div>
        ) : (
          services.map((s, i) => (
            <Reveal key={s.id} delay={i * 40}>
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-on-surface">{s.name}</h4>
                  {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                  <p className="text-xs text-gray-400 mt-2 font-semibold">
                    Giá: <span className="text-primary-container">{money(s.basePrice)}</span> · Hoa hồng: {Math.round(s.commissionRate * 100)}%
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-primary-container p-1.5 rounded-lg hover:bg-orange-50 cursor-pointer" title="Sửa">
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" title="Xóa">
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            </Reveal>
          ))
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-red-650">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Xóa dịch vụ?</h3>
            <p className="text-sm text-gray-500 mb-6 font-semibold">Bạn có chắc muốn xóa dịch vụ này khỏi danh mục?</p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer">Hủy bỏ</button>
              <button type="button" onClick={() => confirmDelete(deleteId)} className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95">Xóa bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
