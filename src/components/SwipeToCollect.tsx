import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export function SwipeToCollect({ onComplete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(250);
  const doneRef = useRef(false);

  const trackProgress = useTransform(x, [0, max], [0, 1]);
  const labelOpacity = useTransform(x, [0, max * 0.25], [1, 0]);
  const checkOpacity = useTransform(x, [max * 0.7, max], [0, 1]);

  useEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      if (trackRef.current) setMax(trackRef.current.offsetWidth - 52 - 8);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  const handleDragEnd = () => {
    if (doneRef.current) return;
    const current = x.get();
    if (current / max > 0.78) {
      doneRef.current = true;
      animate(x, max, { type: 'spring', damping: 20, stiffness: 300 });
      setTimeout(() => onComplete(), 350);
    } else {
      animate(x, 0, { type: 'spring', damping: 20, stiffness: 300 });
    }
  };

  return (
    <div
      ref={trackRef}
      className="relative h-[52px] bg-[#00766F] rounded-full overflow-hidden select-none touch-pan-y"
    >
      <motion.div
        className="absolute inset-0 bg-[#005F58] rounded-full origin-left"
        style={{ scaleX: trackProgress }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: labelOpacity }}
      >
        <span className="text-white font-extrabold text-sm tracking-wide">Swipe to collect</span>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: checkOpacity }}
      >
        <span className="text-white font-extrabold text-sm flex items-center gap-2">
          <Check size={18} strokeWidth={3} /> Collected!
        </span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="absolute top-[4px] left-[4px] w-[44px] h-[44px] bg-white rounded-full flex items-center justify-center shadow-md z-10 cursor-grab active:cursor-grabbing touch-none"
      >
        <ArrowRight size={18} className="text-[#00766F]" />
      </motion.div>
    </div>
  );
}
