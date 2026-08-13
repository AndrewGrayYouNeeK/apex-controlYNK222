import { CAREER_MISSIONS, CAREER_RANKS } from './gameData';

const STORAGE_KEY = 'atc_career';

export function loadCareerProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveCareerProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getCurrentRank(xp = 0) {
  return CAREER_RANKS.filter(r => r.xpRequired <= xp).pop() || CAREER_RANKS[0];
}

export function getNextRank(xp = 0) {
  return CAREER_RANKS.find(r => r.xpRequired > xp) || null;
}

export function awardSessionXp(score, missionId = null) {
  const progress = loadCareerProgress();
  const earned = Math.max(0, score);
  progress.xp = (progress.xp || 0) + earned;
  progress.totalShifts = (progress.totalShifts || 0) + 1;
  progress.lastScore = score;

  if (missionId) {
    const mission = CAREER_MISSIONS.find(m => m.id === missionId);
    if (mission && score >= mission.scoreTarget) {
      if (!progress.completedMissions) progress.completedMissions = {};
      if (!progress.completedMissions[missionId]) {
        progress.completedMissions[missionId] = { score, completedAt: Date.now() };
        progress.xp += mission.xpReward;
      }
    }
  }

  saveCareerProgress(progress);
  return progress;
}

export function isMissionUnlocked(mission, xp) {
  const rank = getCurrentRank(xp);
  return rank.level >= mission.requiredRank;
}

export function isMissionCompleted(missionId) {
  const progress = loadCareerProgress();
  return Boolean(progress.completedMissions?.[missionId]);
}
