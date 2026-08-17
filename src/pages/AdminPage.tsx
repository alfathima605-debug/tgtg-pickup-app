import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Copy, Check, X, Package, MapPin,
  Clock, FileText, ChevronDown, ExternalLink, RotateCcw,
  Star, UtensilsCrossed, ShoppingBag, Camera
} from 'lucide-react';
import type { PickupOrder, OrderStatus } from '../types';
import { getTotal, formatGBP, generateCode, statusColor, statusLabel } from '../types';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../store';

type Tab = 'orders' | 'restaurants';

const EMPTY_ORDER = {
  restaurantName: '',
  restaurantAddress: '',
  restaurantLogo: '',
  orderName: '',
  quantity: 1,
  unitPrice: 0,
  pickupDate: new Date().toISOString().slice(0, 10),
  pickupStart: '22:00',
  pickupEnd: '22:30',
  packagingNote: '',
  collectionNote: '',
  confirmationCode: '',
  status: 'ready_for_pickup' as OrderStatus,
  category: 'Meals',
  rating: 4.5,
  reviewCount: 0,
  pickupAddress: '',
  surpriseBagContents: '',
};

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ORDER);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => { setOrders(getOrders()); }, []);
  const refresh = () => setOrders(getOrders());

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_ORDER);
    setShowForm(true);
  };

  const openEdit = (o: PickupOrder) => {
    setEditId(o.id);
    setForm({
      restaurantName: o.restaurantName,
      restaurantAddress: o.restaurantAddress,
      restaurantLogo: o.restaurantLogo,
      orderName: o.orderName,
      quantity: o.quantity,
      unitPrice: o.unitPrice,
      pickupDate: o.pickupDate,
      pickupStart: o.pickupStart,
      pickupEnd: o.pickupEnd,
      packagingNote: o.packagingNote,
      collectionNote: o.collectionNote,
      confirmationCode: o.confirmationCode,
      status: o.status,
      category: o.category || 'Meals',
      rating: o.rating || 4.5,
      reviewCount: o.reviewCount || 0,
      pickupAddress: o.pickupAddress || '',
      surpriseBagContents: o.surpriseBagContents || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      confirmationCode: form.confirmationCode || generateCode(),
      unitPrice: Number(form.unitPrice),
      quantity: Number(form.quantity),
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
    };
    if (editId) {
      updateOrder(editId, data);
    } else {
      createOrder(data);
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this order?')) {
      deleteOrder(id);
      refresh();
    }
  };

  const handleStatus = (id: string, status: OrderStatus) => {
    updateOrder(id, { status });
    refresh();
  };

  const handleRecollect = (id: string) => {
    updateOrder(id, { status: 'ready_for_pickup', confirmationCode: generateCode() });
    refresh();
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/order/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const readyCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const pickedCount = orders.filter(o => o.status === 'picked_up').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sidebar / Mobile Nav */}
      <div className="flex items-start">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex w-56 bg-white border-r border-[#E8E8E8] flex-col sticky top-0 h-screen shrink-0 z-30">
          <div className="p-5 border-b border-[#E8E8E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00766F] flex items-center justify-center">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-[#0C0C0C] text-base tracking-tight">TGTG Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {[
              { key: 'orders' as Tab, label: 'Orders', icon: Package, count: readyCount },
              { key: 'restaurants' as Tab, label: 'Restaurants', icon: UtensilsCrossed },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === item.key ? 'bg-[#00766F]/10 text-[#00766F]' : 'text-[#6B7474] hover:bg-[#F1F1F1]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto bg-[#00766F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 bg-white border-b border-[#E8E8E8] px-4 py-3 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00766F] flex items-center justify-center">
                <ShoppingBag size={14} className="text-white" />
              </div>
              <span className="font-extrabold text-[#0C0C0C] text-sm">TGTG Admin</span>
            </div>
            <button onClick={openNew} className="flex items-center gap-1.5 bg-[#00766F] text-white px-3.5 py-2 rounded-full font-bold text-xs">
              <Plus size={14} /> New
            </button>
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden flex border-b border-[#E8E8E8] bg-white px-4">
            {[
              { key: 'orders' as Tab, label: 'Orders', count: readyCount },
              { key: 'restaurants' as Tab, label: 'Restaurants' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 py-3 text-sm font-bold border-b-[3px] transition-colors ${
                  activeTab === item.key ? 'border-[#00766F] text-[#00766F]' : 'border-transparent text-[#6B7474]'
                }`}
              >
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">{item.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <>
                <div className="hidden md:flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#0C0C0C] tracking-tight">Orders</h1>
                    <p className="text-[#6B7474] text-sm mt-1 font-medium">Manage pickup orders and collections</p>
                  </div>
                  <button onClick={openNew} className="flex items-center gap-2 bg-[#00766F] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#005F58] transition-colors shadow-sm">
                    <Plus size={18} strokeWidth={2.5} /> New Order
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Ready', count: readyCount, color: 'bg-[#00766F]' },
                    { label: 'Picked up', count: pickedCount, color: 'bg-green-500' },
                    { label: 'Cancelled', count: cancelledCount, color: 'bg-red-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 text-center">
                      <div className={`text-2xl font-extrabold ${s.color === 'bg-[#00766F]' ? 'text-[#00766F]' : s.color === 'bg-green-500' ? 'text-green-600' : 'text-red-500'}`}>{s.count}</div>
                      <div className="text-[11px] font-bold text-[#6B7474] uppercase tracking-wider mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(['all', 'ready_for_pickup', 'picked_up', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                        filter === s
                          ? 'bg-[#00766F] text-white'
                          : 'bg-white text-[#6B7474] hover:bg-gray-100 border border-[#E8E8E8]'
                      }`}
                    >
                      {s === 'all' ? 'All' : statusLabel(s)}
                      <span className="ml-1.5 text-xs opacity-70">{orders.filter((o) => s === 'all' || o.status === s).length}</span>
                    </button>
                  ))}
                </div>

                {/* Order List */}
                {filtered.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E8E8]">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-[#6B7474] text-lg font-bold">No orders yet</p>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Create your first pickup order to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filtered.map((o) => (
                        <motion.div
                          key={o.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)' }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-extrabold text-[#0C0C0C] text-base truncate">{o.restaurantName}</h3>
                                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${statusColor(o.status)}`}>
                                  {statusLabel(o.status)}
                                </span>
                              </div>
                              <p className="text-[#6B7474] text-sm flex items-center gap-1.5 mb-1 font-medium">
                                <MapPin size={13} /> {o.restaurantAddress}
                              </p>
                              <p className="text-[#353535] text-sm font-medium">
                                {o.quantity}x {o.orderName} — <span className="font-bold text-[#00766F]">{formatGBP(getTotal(o))}</span>
                              </p>
                              {o.rating && (
                                <p className="text-[#6B7474] text-xs flex items-center gap-1 mt-1 font-medium">
                                  <Star size={12} className="fill-amber-400 text-amber-400" /> {o.rating} ({o.reviewCount} reviews)
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7474] font-medium">
                                <span className="flex items-center gap-1"><Clock size={12} /> {o.pickupDate} · {o.pickupStart}–{o.pickupEnd}</span>
                                <span className="flex items-center gap-1"><FileText size={12} /> {o.confirmationCode}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                              <button onClick={() => copyLink(o.id)} title="Copy customer link" className="p-2 rounded-full hover:bg-[#F1F1F1] transition-colors">
                                {copied === o.id ? <Check size={16} className="text-[#00766F]" /> : <Copy size={16} className="text-[#6B7474]" />}
                              </button>
                              <a href={`/order/${o.id}`} target="_blank" rel="noopener" title="Preview" className="p-2 rounded-full hover:bg-[#F1F1F1] transition-colors">
                                <ExternalLink size={16} className="text-[#6B7474]" />
                              </a>
                              <button onClick={() => openEdit(o)} title="Edit" className="p-2 rounded-full hover:bg-[#F1F1F1] transition-colors">
                                <Pencil size={16} className="text-[#6B7474]" />
                              </button>
                              <button onClick={() => handleDelete(o.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 transition-colors">
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-3 pt-3 border-t border-[#E8E8E8]">
                            {o.status === 'ready_for_pickup' && (
                              <>
                                <button onClick={() => handleStatus(o.id, 'picked_up')} className="text-xs font-bold text-[#00766F] hover:underline">Mark picked up</button>
                                <button onClick={() => handleStatus(o.id, 'cancelled')} className="text-xs font-bold text-red-500 hover:underline">Cancel</button>
                              </>
                            )}
                            {o.status === 'picked_up' && (
                              <button onClick={() => handleRecollect(o.id)} className="flex items-center gap-1.5 text-xs font-bold text-[#00766F] hover:underline">
                                <RotateCcw size={12} /> Re-collect
                              </button>
                            )}
                            {o.status === 'cancelled' && (
                              <button onClick={() => handleStatus(o.id, 'ready_for_pickup')} className="text-xs font-bold text-[#00766F] hover:underline">Restore</button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#0C0C0C] tracking-tight">Restaurants</h1>
                    <p className="text-[#6B7474] text-sm mt-1 font-medium">Manage restaurant details and surprise bags</p>
                  </div>
                  <button onClick={openNew} className="flex items-center gap-2 bg-[#00766F] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#005F58] transition-colors shadow-sm">
                    <Plus size={18} strokeWidth={2.5} /> Add Restaurant
                  </button>
                </div>

                {/* Group by restaurant */}
                {(() => {
                  const restaurantMap = new Map<string, PickupOrder[]>();
                  orders.forEach(o => {
                    const key = o.restaurantName;
                    if (!restaurantMap.has(key)) restaurantMap.set(key, []);
                    restaurantMap.get(key)!.push(o);
                  });
                  return (
                    <div className="space-y-4">
                      {Array.from(restaurantMap.entries()).map(([name, restOrders]) => {
                        const first = restOrders[0];
                        return (
                          <motion.div
                            key={name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                          >
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                {first.restaurantLogo ? (
                                  <img src={first.restaurantLogo} alt={name} className="w-14 h-14 rounded-xl object-cover border border-[#E8E8E8] shrink-0" />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-[#00766F]/10 flex items-center justify-center shrink-0">
                                    <UtensilsCrossed size={24} className="text-[#00766F]" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-extrabold text-[#0C0C0C] text-base">{name}</h3>
                                  <p className="text-[#6B7474] text-sm flex items-center gap-1.5 mt-0.5 font-medium">
                                    <MapPin size={12} /> {first.restaurantAddress}
                                  </p>
                                  {first.rating && (
                                    <p className="text-[#6B7474] text-xs flex items-center gap-1 mt-1.5 font-medium">
                                      <Star size={12} className="fill-amber-400 text-amber-400" /> {first.rating} ({first.reviewCount} reviews)
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-bold text-[#00766F] bg-[#00766F]/10 px-2.5 py-1 rounded-full">
                                    {restOrders.length} bag{restOrders.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>

                              {/* Surprise bags from this restaurant */}
                              <div className="mt-4 space-y-2">
                                {restOrders.map(o => (
                                  <div key={o.id} className="flex items-center justify-between bg-[#F5F5F5] rounded-xl px-4 py-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-[#0C0C0C] truncate">{o.orderName}</p>
                                      <p className="text-xs text-[#6B7474] font-medium">{o.pickupStart}–{o.pickupEnd} · {formatGBP(o.unitPrice)}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-3 ${statusColor(o.status)}`}>
                                      {statusLabel(o.status)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#E8E8E8] px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <h2 className="font-extrabold text-lg text-[#0C0C0C]">{editId ? 'Edit Order' : 'New Order'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[#F1F1F1] rounded-full">
                  <X size={20} className="text-[#6B7474]" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Restaurant Section */}
                <div className="bg-[#00766F]/5 rounded-xl p-4 space-y-4">
                  <p className="text-[10px] font-bold text-[#00766F] uppercase tracking-wider">Restaurant Details</p>
                  <Field label="Restaurant name" required value={form.restaurantName} onChange={(v) => setForm({ ...form, restaurantName: v })} placeholder="e.g. Happy Lamb Hot Pot" />
                  <Field label="Restaurant address" required value={form.restaurantAddress} onChange={(v) => setForm({ ...form, restaurantAddress: v })} placeholder="21 Ladywell Walk, Birmingham B5 4ST" />
                  <LogoUpload value={form.restaurantLogo} onChange={(v) => setForm({ ...form, restaurantLogo: v })} />
                </div>

                {/* Order Section */}
                <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-4">
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider">Surprise Bag</p>
                  <Field label="Bag name" required value={form.orderName} onChange={(v) => setForm({ ...form, orderName: v })} placeholder="e.g. Hot Favorites Bag" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Quantity" type="number" required min={1} value={String(form.quantity)} onChange={(v) => setForm({ ...form, quantity: Number(v) })} />
                    <Field label="Unit price (£)" type="number" required min={0} step={0.01} value={String(form.unitPrice)} onChange={(v) => setForm({ ...form, unitPrice: Number(v) })} />
                  </div>
                  <div className="bg-[#00766F]/10 rounded-xl p-3 text-sm">
                    <span className="text-[#6B7474] font-medium">Total: </span>
                    <span className="font-extrabold text-[#00766F] text-lg">{formatGBP(form.quantity * form.unitPrice)}</span>
                  </div>
                </div>

                {/* Pickup Section */}
                <div className="bg-amber-50 rounded-xl p-4 space-y-4">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pickup Details</p>
                  <Field label="Pickup date" type="date" required value={form.pickupDate} onChange={(v) => setForm({ ...form, pickupDate: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start time" type="time" required value={form.pickupStart} onChange={(v) => setForm({ ...form, pickupStart: v })} />
                    <Field label="End time" type="time" required value={form.pickupEnd} onChange={(v) => setForm({ ...form, pickupEnd: v })} />
                  </div>
                  <Field label="Pickup address" value={form.pickupAddress || ''} onChange={(v) => setForm({ ...form, pickupAddress: v })} placeholder="Same as restaurant or different" />
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <Field label="Packaging note" value={form.packagingNote} onChange={(v) => setForm({ ...form, packagingNote: v })} placeholder="e.g. Bring your own bag" />
                  <Field label="Collection note" value={form.collectionNote} onChange={(v) => setForm({ ...form, collectionNote: v })} placeholder="e.g. Mention code at counter" />
                  <Field label="Surprise bag contents" value={form.surpriseBagContents || ''} onChange={(v) => setForm({ ...form, surpriseBagContents: v })} placeholder="What's typically in the bag" />
                </div>

                {/* Rating Section */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Rating (0-5)" type="number" min={0} max={5} step={0.1} value={String(form.rating || 4.5)} onChange={(v) => setForm({ ...form, rating: Number(v) })} />
                  <Field label="Review count" type="number" min={0} value={String(form.reviewCount || 0)} onChange={(v) => setForm({ ...form, reviewCount: Number(v) })} />
                </div>

                {/* Code & Status */}
                <Field label="Confirmation code" value={form.confirmationCode} onChange={(v) => setForm({ ...form, confirmationCode: v.toUpperCase() })} placeholder={`Auto-generated: ${generateCode()}`} />
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7474] uppercase tracking-wider mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                      className="w-full appearance-none bg-[#F1F1F1] border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm font-semibold text-[#0C0C0C] focus:outline-none focus:ring-2 focus:ring-[#00766F]/30"
                    >
                      <option value="ready_for_pickup">Ready for pickup</option>
                      <option value="picked_up">Picked up</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7474] pointer-events-none" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#00766F] text-white font-bold py-3.5 rounded-full hover:bg-[#005F58] transition-colors text-sm mt-2">
                  {editId ? 'Save changes' : 'Create order'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, onChange, ...props }: { label: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#6B7474] uppercase tracking-wider mb-1.5">{label}</label>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F1F1F1] border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0C0C0C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00766F]/30"
      />
    </div>
  );
}

function LogoUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value || '');

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrl = (v: string) => {
    onChange(v);
    setPreview(v);
  };

  return (
    <div>
      <label className="block text-[11px] font-bold text-[#6B7474] uppercase tracking-wider mb-1.5">
        Restaurant logo
      </label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-16 h-16 rounded-xl border-2 border-dashed border-[#E8E8E8] bg-[#F1F1F1] flex items-center justify-center overflow-hidden active:bg-[#E8E8E8] transition-colors shrink-0 group"
        >
          {preview ? (
            <>
              <img src={preview} alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={16} className="text-white" />
              </div>
            </>
          ) : (
            <Camera size={20} className="text-[#6B7474]" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <div className="flex-1 min-w-0">
          <input
            value={value}
            onChange={(e) => handleUrl(e.target.value)}
            placeholder="Or paste image URL..."
            className="w-full bg-[#F1F1F1] border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0C0C0C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00766F]/30"
          />
          <p className="text-[10px] text-[#6B7474] mt-1.5 font-medium">Tap the icon to upload, or paste a URL</p>
        </div>
      </div>
    </div>
  );
}
