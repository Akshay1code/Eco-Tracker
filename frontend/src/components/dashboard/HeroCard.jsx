import { useEffect, useMemo } from 'react';
import { TODOS_INIT } from '../../data/mockData.js';
import CarbonFootprint from './CarbonFootprint.jsx';

function HeroCard({ onXPData, deviceData, compact = false }) {
  const stats = useMemo(() => {
    const fallbackXP = TODOS_INIT.filter((todo) => todo.done).reduce((sum, todo) => sum + todo.xp, 0);
    const totalXP = Number(deviceData?.totalXp ?? fallbackXP);
    const level = Number(deviceData?.level ?? Math.floor(totalXP / 200) + 1);
    const levelPct = Number(deviceData?.levelProgressPct ?? ((totalXP % 200) / 200) * 100);
    return { totalXP, level, levelPct };
  }, [deviceData?.level, deviceData?.levelProgressPct, deviceData?.totalXp]);

  const heroFootprintScore = Math.max(0, Math.min(10, Number(deviceData?.footprintScore ?? deviceData?.carbon ?? 0)));

  useEffect(() => {
    if (onXPData) {
      onXPData(stats);
    }
  }, [onXPData, stats]);

  return (
    <section className={`hero-card-solo hero-card--mascot${compact ? ' hero-card-solo--inline' : ''}`}>
      <div className="hero-card-solo__panel">
        <CarbonFootprint score={heroFootprintScore} showControls={false} />
      </div>
    </section>
  );
}

export default HeroCard;
