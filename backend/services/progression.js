import { BADGE_LEVEL_INTERVAL, WELCOME_XP, XP_PER_LEVEL } from '../constants.js';

const BADGE_TITLES = ['Trailblazer', 'Guardian', 'Champion', 'Legend', 'Mythic'];

function getBadgeLabel(level) {
  const badgeIndex = Math.max(0, Math.floor(level / BADGE_LEVEL_INTERVAL) - 1);
  const title = BADGE_TITLES[Math.min(badgeIndex, BADGE_TITLES.length - 1)];
  return `Level ${level} ${title}`;
}

export function getLevelFromXp(totalXp) {
  return Math.max(1, Math.floor(Math.max(0, Number(totalXp) || 0) / XP_PER_LEVEL) + 1);
}

export function getLevelProgressPercent(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  return Number((((safeXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100).toFixed(2));
}

export function buildMilestoneBadges(level, existingBadges = [], awardedAt = new Date().toISOString()) {
  const badgeMap = new Map(
    Array.isArray(existingBadges)
      ? existingBadges
          .filter((badge) => badge && typeof badge === 'object' && typeof badge.key === 'string')
          .map((badge) => [badge.key, badge])
      : []
  );

  for (let badgeLevel = BADGE_LEVEL_INTERVAL; badgeLevel <= level; badgeLevel += BADGE_LEVEL_INTERVAL) {
    const key = `level-${badgeLevel}`;
    if (!badgeMap.has(key)) {
      badgeMap.set(key, {
        key,
        level: badgeLevel,
        label: getBadgeLabel(badgeLevel),
        awardedAt,
      });
    }
  }

  return [...badgeMap.values()].sort((left, right) => left.level - right.level);
}

export function buildProgressionSnapshot(totalXp, existingBadges = [], awardedAt = new Date().toISOString()) {
  const safeXp = Math.max(WELCOME_XP, Math.max(0, Number(totalXp) || 0));
  const level = getLevelFromXp(safeXp);
  return {
    score: safeXp,
    level,
    levelProgressPct: getLevelProgressPercent(safeXp),
    badges: buildMilestoneBadges(level, existingBadges, awardedAt),
  };
}
