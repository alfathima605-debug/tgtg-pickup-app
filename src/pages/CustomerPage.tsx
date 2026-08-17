import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Share2, Check, X, Star,
  ShoppingBag, Package, MessageCircle, HelpCircle,
  ChevronRight, Clock, FileText, Shield, Send, CheckCircle,
} from 'lucide-react';
import { getOrder, updateOrder } from '../store';
import type { PickupOrder } from '../types';
import { getTotal, formatGBP } from '../types';
import { SwipeToCollect } from '../components/SwipeToCollect';

type Stage = 'details' | 'swipe' | 'confirmed' | 'feedback';

export function CustomerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PickupOrder | undefined>(() => getOrder(id || ''));
  const [stage, setStage] = useState<Stage>(
    order?.status === 'picked_up' ? 'confirmed' : 'details'
  );

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const refresh = useCallback(() => {
    if (id) { const o = getOrder(id); if (o) setOrder(o); }
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F1F1F1] flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-[#6B7474]" />
          </div>
          <p className="text-[#6B7474] text-lg font-bold">Order not found</p>
          <p className="text-[#6B7474] text-sm font-medium mt-1 mb-4">This order may have been removed.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00766F] text-white font-extrabold py-3 px-6 rounded-full text-sm active:bg-[#005F58] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-[#0C0C0C] mb-2">Order cancelled</h2>
          <p className="text-[#6B7474] text-sm font-medium">This order has been cancelled by the store.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-[#00766F] text-white font-extrabold py-3 px-6 rounded-full text-sm active:bg-[#005F58] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const pickupDate = new Date(order.pickupDate + 'T00:00:00');
  const dateStr = pickupDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const windowStr = `${order.pickupStart} – ${order.pickupEnd}`;

  const handleCollect = () => {
    updateOrder(order.id, { status: 'picked_up' });
    refresh();
    setStage('confirmed');
  };

  // Close confirmation sheet -> go to feedback page
  const handleCloseConfirmed = () => setStage('feedback');

  // Done on feedback page -> reset order and start over
  const handleDone = () => {
    updateOrder(order.id, { status: 'ready_for_pickup' });
    refresh();
    setFeedbackRating(0);
    setFeedbackText('');
    setFeedbackSent(false);
    setStage('details');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: order.restaurantName,
        text: `Pickup from ${order.restaurantName}! Code: ${order.confirmationCode}. Window: ${windowStr}`,
      });
    } catch {}
  };

  const headerBack = () => {
    if (stage === 'swipe') return setStage('details');
    if (stage === 'feedback') return setStage('details');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[430px] mx-auto">
      {/* ─── HEADER ─── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 bg-white z-20">
        <button
          onClick={headerBack}
          className="w-9 h-9 rounded-full bg-[#F1F1F1] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-[#0C0C0C]" />
        </button>
        <h1 className="font-extrabold text-lg text-[#0C0C0C]">Your order</h1>
      </div>

      <div className="px-4 pb-16">
        {/* ─── RESTAURANT HEADER ─── */}
        <div className="pt-6 pb-2">
          {/* Logo — bulletproof centered via flex wrapper */}
          <div className="flex justify-center mb-4">
            {order.restaurantLogo ? (
              <img
                src={order.restaurantLogo}
                alt={order.restaurantName}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#E8E8E8] block"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-[#00766F]/10 flex items-center justify-center border-2 border-[#E8E8E8]"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
              >
                <ShoppingBag size={38} className="text-[#00766F]" />
              </div>
            )}
          </div>
          <div className="text-center">
          <h2 className="font-extrabold text-xl text-[#0C0C0C] leading-tight px-4 tracking-tight">
            {order.restaurantName}
          </h2>
          <p className="text-[#6B7474] text-xs mt-1.5 flex items-center justify-center gap-1 font-medium px-6">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{order.restaurantAddress}</span>
          </p>
          {order.rating && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(order.rating!)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[#E8E8E8]'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#0C0C0C]">{order.rating}</span>
              <span className="text-xs text-[#6B7474] font-medium">({order.reviewCount})</span>
            </div>
          )}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantAddress)}`,
                  '_blank'
                )
              }
              className="flex items-center gap-2 bg-[#F1F1F1] rounded-full px-4 py-2.5 text-xs font-bold text-[#0C0C0C] active:bg-[#E8E8E8] transition-colors"
            >
              <MapPin size={14} /> Find store
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-[#F1F1F1] rounded-full px-4 py-2.5 text-xs font-bold text-[#0C0C0C] active:bg-[#E8E8E8] transition-colors"
            >
              <Share2 size={14} /> Ask a friend
            </button>
          </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            STAGE: DETAILS — Full order details + Tap to collect
        ═══════════════════════════════════════ */}
        {stage === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            {/* Order details card */}
            <div
              className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-5"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {/* Bag name + total */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#00766F]/10 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-[#00766F]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0C0C0C] truncate">{order.orderName}</p>
                    <p className="text-[11px] text-[#6B7474] font-medium">{order.quantity} x Surprise Bag</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[#00766F] shrink-0 ml-2">
                  {formatGBP(getTotal(order))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{dateStr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Pickup window</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{windowStr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Surprise bag</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{order.quantity} x {order.orderName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-extrabold text-[#00766F] leading-snug">{formatGBP(getTotal(order))}</p>
                </div>
              </div>

              {order.surpriseBagContents && (
                <div className="pt-3 border-t border-[#E8E8E8] mb-3">
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">What's in the bag</p>
                  <p className="text-sm text-[#353535] font-medium leading-relaxed">{order.surpriseBagContents}</p>
                </div>
              )}

              {order.packagingNote && (
                <div className="pt-3 border-t border-[#E8E8E8]">
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Packaging</p>
                  <p className="text-xs text-[#6B7474] leading-relaxed font-medium">{order.packagingNote}</p>
                </div>
              )}

              {order.collectionNote && (
                <div className="mt-3 bg-[#D4F5E6] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-[#005F58] uppercase tracking-wider mb-1">Collection note</p>
                  <p className="text-xs text-[#353535] font-medium leading-relaxed">{order.collectionNote}</p>
                </div>
              )}
            </div>

            <p className="text-[#6B7474] text-sm font-medium text-center mb-4">
              Tap the button when you arrive at the store
            </p>
            <button
              onClick={() => setStage('swipe')}
              className="w-full bg-[#00766F] text-white font-extrabold py-4 rounded-full active:bg-[#005F58] transition-colors text-base shadow-lg shadow-[#00766F]/20"
            >
              Tap to collect
            </button>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════
            STAGE: SWIPE — Swipe to collect
        ═══════════════════════════════════════ */}
        {stage === 'swipe' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {/* Tabs */}
            <div className="flex border-b border-[#E8E8E8] mb-4">
              <button
                className="flex-1 py-3 text-sm font-bold border-b-[3px] border-[#00766F] text-[#00766F]"
              >
                I'm picking up
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3 text-sm font-bold border-b-[3px] border-transparent text-[#6B7474]"
              >
                Ask a friend
              </button>
            </div>

            {/* Order Detail Card */}
            <div
              className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="grid grid-cols-2 gap-y-4 gap-x-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{dateStr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Pickup window</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{windowStr}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Surprise bag</p>
                  <p className="text-sm font-bold text-[#0C0C0C] leading-snug">{order.quantity} x {order.orderName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-extrabold text-[#00766F] leading-snug">{formatGBP(getTotal(order))}</p>
                </div>
              </div>

              {order.packagingNote && (
                <div className="pt-3 border-t border-[#E8E8E8]">
                  <p className="text-[10px] font-bold text-[#6B7474] uppercase tracking-wider mb-1">Packaging</p>
                  <p className="text-xs text-[#6B7474] leading-relaxed font-medium">{order.packagingNote}</p>
                </div>
              )}

              {order.collectionNote && (
                <div className="mt-3 bg-[#D4F5E6] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-[#005F58] uppercase tracking-wider mb-1">Collection note</p>
                  <p className="text-xs text-[#353535] font-medium leading-relaxed">{order.collectionNote}</p>
                </div>
              )}
            </div>

            {/* Swipe — pushed lower so it never overlaps the card */}
            <div className="mt-16 pt-4">
              <SwipeToCollect onComplete={handleCollect} />
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════
            STAGE: FEEDBACK — after confirmed sheet closes
        ═══════════════════════════════════════ */}
        {stage === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {/* Collected summary */}
            <div className="bg-[#D4F5E6] rounded-2xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00766F] flex items-center justify-center shrink-0">
                <Check size={20} className="text-white" strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-[#005F58] text-sm">Collected successfully</p>
                <p className="text-[#6B7474] text-xs font-medium truncate">
                  {order.quantity} x {order.orderName} · {formatGBP(getTotal(order))}
                </p>
              </div>
            </div>

            {/* ─── FEEDBACK CARD ─── */}
            <div
              className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-5"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {!feedbackSent ? (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <MessageCircle size={16} className="text-[#00766F]" />
                    <p className="text-sm font-extrabold text-[#0C0C0C]">
                      How was your surprise bag?
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFeedbackRating(s)}
                        className="active:scale-110 transition-transform"
                      >
                        <Star
                          size={32}
                          className={s <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-[#E8E8E8]'}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us more (optional)..."
                    rows={3}
                    className="w-full bg-[#F1F1F1] rounded-xl p-3 text-sm font-medium text-[#0C0C0C] placeholder:text-[#6B7474]/60 resize-none focus:outline-none focus:ring-2 focus:ring-[#00766F]/30 mb-4"
                  />
                  <button
                    onClick={() => setFeedbackSent(true)}
                    disabled={feedbackRating === 0}
                    className={`w-full flex items-center justify-center gap-2 font-extrabold py-3.5 rounded-full text-sm transition-colors ${
                      feedbackRating > 0
                        ? 'bg-[#00766F] text-white active:bg-[#005F58]'
                        : 'bg-[#F1F1F1] text-[#6B7474] cursor-not-allowed'
                    }`}
                  >
                    <Send size={14} /> Send feedback
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#D4F5E6] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-[#00766F]" />
                  </div>
                  <p className="font-extrabold text-[#0C0C0C] text-sm mb-1">Thanks for your feedback!</p>
                  <p className="text-[#6B7474] text-xs font-medium">Your opinion helps us improve.</p>
                </motion.div>
              )}
            </div>

            {/* ─── HELP & SUPPORT ─── */}
            <div
              className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden mb-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center gap-3 p-4 active:bg-[#F1F1F1] transition-colors"
              >
                <HelpCircle size={18} className="text-[#00766F] shrink-0" />
                <span className="text-sm font-extrabold text-[#0C0C0C] text-left flex-1">Help &amp; support</span>
                <ChevronRight
                  size={16}
                  className={`text-[#6B7474] transition-transform duration-200 ${showHelp ? 'rotate-90' : ''}`}
                />
              </button>
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4">
                      {[
                        { icon: <FileText size={16} className="text-[#6B7474]" />, label: 'Order issues', desc: 'Report a problem with your order' },
                        { icon: <Clock size={16} className="text-[#6B7474]" />, label: 'Missed pickup', desc: "Let us know you couldn't collect" },
                        { icon: <Shield size={16} className="text-[#6B7474]" />, label: 'Safety concern', desc: 'Report a safety issue with a store' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-3 py-3.5 border-t border-[#E8E8E8] active:bg-[#F1F1F1] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#F1F1F1] flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#0C0C0C]">{item.label}</p>
                            <p className="text-[11px] text-[#6B7474] font-medium">{item.desc}</p>
                          </div>
                          <ChevronRight size={14} className="text-[#6B7474] shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="px-4 pb-4 pt-2">
                      <a
                        href="mailto:support@toogoodtogo.com"
                        className="flex items-center justify-center gap-2 w-full bg-[#F1F1F1] rounded-full py-3 text-sm font-bold text-[#0C0C0C] active:bg-[#E8E8E8] transition-colors"
                      >
                        Contact support
                      </a>
                      <a
                        href="/privacy-policy.html"
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full mt-2 bg-transparent border border-[#E8E8E8] rounded-full py-3 text-sm font-bold text-[#6B7474] active:bg-[#F1F1F1] transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── DONE ─── */}
            <button
              onClick={handleDone}
              className="w-full bg-[#00766F] text-white font-extrabold py-4 rounded-full active:bg-[#005F58] transition-colors text-base shadow-lg shadow-[#00766F]/20"
            >
              Done
            </button>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          CONFIRMED BOTTOM SHEET (TGTG style)
          — rendered via portal so no ancestor can break positioning
      ═══════════════════════════════════════ */}
      {createPortal(
        <AnimatePresence>
          {stage === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              {/* Dark overlay */}
              <motion.div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
                onClick={handleCloseConfirmed}
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="relative bg-white w-full z-10 max-h-[88dvh] overflow-y-auto"
                style={{ maxWidth: 430, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              >
                {/* Close */}
                <button
                  onClick={handleCloseConfirmed}
                  className="absolute top-5 right-5 z-20 active:scale-90 transition-transform"
                >
                  <X size={22} className="text-[#0C0C0C]" strokeWidth={2.5} />
                </button>

                <div className="px-6 pt-14 pb-14">
                  {/* Title */}
                  <h2 className="font-extrabold text-[24px] text-[#0C0C0C] text-center tracking-tight">
                    Your order
                  </h2>

                  <div className="h-10" />

                  {/* Order line: name left / price + per bag right */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[15px] text-[#0C0C0C] font-semibold leading-snug truncate">
                      {order.quantity} x {order.orderName}
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block text-[15px] font-extrabold text-[#0C0C0C] leading-snug">
                        {formatGBP(getTotal(order))}
                      </span>
                      <span className="block text-[11px] text-[#6B7474] font-medium leading-snug mt-1">
                        per Surprise Bag
                      </span>
                    </span>
                  </div>

                  <div className="h-12" />

                  {/* Code pill — extended teal area, centered, can never overflow */}
                  <div className="flex justify-center">
                    <div
                      className="max-w-full"
                      style={{
                        backgroundColor: '#00766F',
                        borderRadius: 16,
                        padding: '18px 40px',
                      }}
                    >
                      <span
                        className="block font-black text-white text-center whitespace-nowrap"
                        style={{
                          fontSize: 'clamp(16px, 5vw, 21px)',
                          letterSpacing: '0.1em',
                          lineHeight: 1.4,
                        }}
                      >
                        {order.confirmationCode}
                      </span>
                    </div>
                  </div>

                  {/* Big guaranteed gap so tick never touches the code */}
                  <div className="h-16" />

                  {/* Tick — centered with plain flex wrapper */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 11, stiffness: 220, delay: 0.25 }}
                      className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#2E5A50' }}
                    >
                      <Check size={36} color="#FFFFFF" strokeWidth={3.5} />
                    </motion.div>
                  </div>

                  <div className="h-6" />

                  {/* Confirmed text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-extrabold text-[17px] text-center"
                    style={{ color: '#00766F' }}
                  >
                    Pickup confirmed
                  </motion.p>

                  <div className="h-2.5" />

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[14px] text-[#6B7474] text-center font-medium leading-relaxed"
                  >
                    Show this to the store staff to<br />pickup your meal!
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
