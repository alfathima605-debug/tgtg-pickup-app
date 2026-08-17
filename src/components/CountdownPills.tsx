import { useState, useEffect } from 'react';

interface Props {
  date: string;
  time: string;
}

function parseTarget(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function calcDiff(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { hrs: 0, min: 0, expired: true };
  const totalMin = Math.floor(diff / 60000);
  return { hrs: Math.floor(totalMin / 60), min: totalMin % 60, expired: false };
}

export function CountdownPills({ date, time }: Props) {
  const target = parseTarget(date, time);
  const [diff, setDiff] = useState(() => calcDiff(target));

  useEffect(() => {
    const t = setInterval(() => setDiff(calcDiff(target)), 10000);
    return () => clearInterval(t);
  }, [date, time]);

  if (diff.expired) {
    return (
      <div className="flex gap-1.5">
        <div className="bg-[#00766F] rounded-xl px-3 py-1.5 text-center min-w-[44px]">
          <span className="text-white font-black text-base leading-none">0</span>
          <span className="text-white/70 text-[9px] font-bold block">hrs</span>
        </div>
        <div className="bg-[#00766F] rounded-xl px-3 py-1.5 text-center min-w-[44px]">
          <span className="text-white font-black text-base leading-none">0</span>
          <span className="text-white/70 text-[9px] font-bold block">min</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <div className="bg-[#72E0AE] rounded-xl px-3 py-1.5 text-center min-w-[44px]">
        <span className="text-[#005F58] font-black text-base leading-none">{diff.hrs}</span>
        <span className="text-[#005F58]/70 text-[9px] font-bold block">{diff.hrs === 1 ? 'hr' : 'hrs'}</span>
      </div>
      <div className="bg-[#72E0AE] rounded-xl px-3 py-1.5 text-center min-w-[44px]">
        <span className="text-[#005F58] font-black text-base leading-none">{diff.min}</span>
        <span className="text-[#005F58]/70 text-[9px] font-bold block">min</span>
      </div>
    </div>
  );
}
