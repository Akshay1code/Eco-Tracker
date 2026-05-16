import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = ["transport", "energy", "food", "water", "waste", "shopping", "nature", "community"];
const DIFFICULTIES = ["easy", "medium", "hard"];

const QUEST_TEMPLATES = [
  { title: "Meatless Meal", desc: "Enjoy a fully plant-based meal today.", category: "food", diff: "easy" },
  { title: "Short Walk", desc: "Walk instead of driving for a short trip.", category: "transport", diff: "easy" },
  { title: "Unplug Devices", desc: "Unplug electronics when not in use.", category: "energy", diff: "easy" },
  { title: "Reusable Bag", desc: "Use a reusable bag for shopping.", category: "shopping", diff: "easy" },
  { title: "Cold Wash", desc: "Wash a load of laundry in cold water.", category: "water", diff: "medium" },
  { title: "Public Transit", desc: "Take public transit instead of a car.", category: "transport", diff: "medium" },
  { title: "Zero Waste Day", desc: "Produce no landfill waste for 24 hours.", category: "waste", diff: "hard" },
  { title: "Community Cleanup", desc: "Pick up trash in your local neighborhood.", category: "community", diff: "hard" },
  { title: "Plant a Tree", desc: "Plant a tree or native plant.", category: "nature", diff: "hard" },
  { title: "Line Dry", desc: "Air dry your clothes instead of using a dryer.", category: "energy", diff: "medium" },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getXpReward(difficulty) {
  switch (difficulty) {
    case 'easy': return getRandomInt(10, 20);
    case 'medium': return getRandomInt(25, 45);
    case 'hard': return getRandomInt(50, 80);
    default: return 10;
  }
}

function generateQuests() {
  const quests = [];
  
  for (let day = 1; day <= 365; day++) {
    for (let q = 1; q <= 10; q++) {
      const template = QUEST_TEMPLATES[getRandomInt(0, QUEST_TEMPLATES.length - 1)];
      const hype_score = Math.random();
      const carbon_reduction = 0.2 + (hype_score * (0.4 - 0.2));
      
      quests.push({
        quest_id: `D${String(day).padStart(3, '0')}_Q${q}`,
        day_of_year: day,
        title: template.title,
        description: template.description,
        category: template.category,
        difficulty: template.diff,
        carbon_reduction: parseFloat(carbon_reduction.toFixed(4)),
        xp_reward: getXpReward(template.diff),
        hype_score: parseFloat(hype_score.toFixed(4))
      });
    }
  }
  
  return quests;
}

const datasetPath = path.join(__dirname, '../data/quests_dataset.json');
const dataDir = path.dirname(datasetPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(datasetPath, JSON.stringify(generateQuests(), null, 2));
console.log(`Generated 3,650 quests at ${datasetPath}`);
