import {
  BADGE_LEVEL_INTERVAL,
  WELCOME_XP,
  XP_PER_LEVEL,
  XP_SLOWDOWN_AFTER_LEVEL,
  XP_SLOWDOWN_MULTIPLIER,
} from '../constants.js';

const BADGE_TITLES = ['Trailblazer', 'Guardian', 'Champion', 'Legend', 'Mythic'];
const SLOW_XP_PER_LEVEL = Math.round(XP_PER_LEVEL * XP_SLOWDOWN_MULTIPLIER);
const NORMAL_XP_CAP = XP_SLOWDOWN_AFTER_LEVEL * XP_PER_LEVEL;

function getBadgeLabel(level) {
  const badgeIndex = Math.max(0, Math.floor(level / BADGE_LEVEL_INTERVAL) - 1);
  const title = BADGE_TITLES[Math.min(badgeIndex, BADGE_TITLES.length - 1)];
  return `Level ${level} ${title}`;
}

export function getLevelFromXp(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  if (safeXp < NORMAL_XP_CAP) {
    return Math.max(1, Math.floor(safeXp / XP_PER_LEVEL) + 1);
  }

  return XP_SLOWDOWN_AFTER_LEVEL + 1 + Math.floor((safeXp - NORMAL_XP_CAP) / SLOW_XP_PER_LEVEL);
}

export function getXpRequiredForLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return safeLevel <= XP_SLOWDOWN_AFTER_LEVEL ? XP_PER_LEVEL : SLOW_XP_PER_LEVEL;
}

export function getLevelStartXp(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  if (safeLevel <= XP_SLOWDOWN_AFTER_LEVEL + 1) {
    return (safeLevel - 1) * XP_PER_LEVEL;
  }

  return NORMAL_XP_CAP + (safeLevel - (XP_SLOWDOWN_AFTER_LEVEL + 1)) * SLOW_XP_PER_LEVEL;
}

export function getCurrentLevelXp(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const level = getLevelFromXp(safeXp);
  return Math.max(0, safeXp - getLevelStartXp(level));
}

export function getLevelProgressPercent(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const level = getLevelFromXp(safeXp);
  const currentXp = getCurrentLevelXp(safeXp);
  const xpRequiredForLevel = getXpRequiredForLevel(level);
  return Number(((currentXp / xpRequiredForLevel) * 100).toFixed(2));
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
  const currentXp = getCurrentLevelXp(safeXp);
  const xpRequiredForLevel = getXpRequiredForLevel(level);
  return {
    score: safeXp,
    totalXp: safeXp,
    level,
    currentXp,
    xpRequiredForLevel,
    xpToNextLevel: Math.max(0, xpRequiredForLevel - currentXp),
    levelProgressPct: getLevelProgressPercent(safeXp),
    badges: buildMilestoneBadges(level, existingBadges, awardedAt),
  };
}
