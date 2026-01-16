// 動作資料庫載入與轉換工具
// 載入五大器材的動作資料庫

import reformerData from './核心床動作資料庫.json';
import trapData from './鞦韆床動作資料庫.json';
import chairData from './椅子動作資料庫.json';
import barrelData from './梯筒動作資料庫.json';
import arcData from './ARC 動作資料庫.json';

// 難度對照表
const LEVEL_MAP = {
  '初階': 'Beginner',
  '初學': 'Beginner',
  '初-中階': 'Beginner',
  '中階': 'Intermediate',
  '中級': 'Intermediate',
  '中-高階': 'Intermediate',
  '高階': 'Advanced',
  '高級': 'Advanced',
  '高-超高階': 'Advanced',
  '超級高階': 'Advanced'
};

// 器材類型對照
const CATEGORY_MAP = {
  'Reformer': 'Reformer',
  '核心床': 'Reformer',
  'Trapeze Table (Cadillac)': 'Cadillac',
  'Trapeze Table': 'Cadillac',
  'Cadillac': 'Cadillac',
  '鞦韆床': 'Cadillac',
  'Wunda Chair': 'Chair',
  'Chair': 'Chair',
  '椅子': 'Chair',
  'Ladder Barrel': 'Barrel',
  'Barrel': 'Barrel',
  '梯筒': 'Barrel',
  'Spine Corrector': 'ARC',
  'ARC': 'ARC',
  'Arc': 'ARC'
};

// 禁忌症關鍵字對照
const CONTRAINDICATION_KEYWORDS = {
  pregnancy: ['懷孕', '孕婦', 'pregnancy', '妊娠'],
  osteoporosis: ['骨質疏鬆', 'osteoporosis', '骨鬆'],
  scoliosis: ['脊椎側彎', 'scoliosis', '側彎'],
  neck_pain: ['頸部', '頸椎', 'neck', '脖子'],
  lower_back_pain: ['下背', '腰背', '腰部', '背痛', 'back pain', '腰椎'],
  knee_pain: ['膝蓋', 'knee', '膝關節'],
  shoulder_pain: ['肩膀', 'shoulder', '肩部', '肩胛'],
  hip_pain: ['髖關節', 'hip', '髖部', '臀部'],
  wrist_pain: ['手腕', 'wrist', '腕關節']
};

// 訓練目標關鍵字對照
const TARGET_KEYWORDS = {
  'Core': ['核心', '腹部', '腹肌', 'core', '軀幹', 'abdominal'],
  'Upper': ['上肢', '手臂', '肩', '背部', 'upper', 'arm', 'shoulder'],
  'Lower': ['下肢', '腿', '臀', '髖', 'lower', 'leg', 'hip', 'glute'],
  'Back': ['背部', '脊椎', 'back', 'spine', '豎脊'],
  'Side': ['側向', '側腹', '斜肌', 'side', 'oblique', '側面'],
  'Full Body': ['全身', 'full body', '整體']
};

// 解析禁忌症
function parseContraindications(studentFilters) {
  if (!studentFilters) return [];

  const contraindications = [];
  const filterText = JSON.stringify(studentFilters).toLowerCase();

  for (const [key, keywords] of Object.entries(CONTRAINDICATION_KEYWORDS)) {
    for (const kw of keywords) {
      if (filterText.includes(kw.toLowerCase())) {
        // 檢查是否包含「規避」「避免」等關鍵字
        const fullText = JSON.stringify(studentFilters);
        if (fullText.includes('規避') || fullText.includes('避免') || fullText.includes('禁做')) {
          contraindications.push(key);
          break;
        }
      }
    }
  }

  return [...new Set(contraindications)];
}

// 解析訓練目標
function parseTarget(trainingGoal) {
  if (!trainingGoal) return 'Core';

  const goalText = trainingGoal.toLowerCase();

  for (const [target, keywords] of Object.entries(TARGET_KEYWORDS)) {
    for (const kw of keywords) {
      if (goalText.includes(kw.toLowerCase())) {
        return target;
      }
    }
  }

  return 'Core'; // 預設
}

// 判斷動作類型 (Active/CoolDown)
function parseType(courseCategory, name) {
  if (!courseCategory) return 'Active';

  const categoryText = courseCategory.toLowerCase();
  const nameText = (name || '').toLowerCase();

  if (categoryText.includes('緩和') ||
      categoryText.includes('cooldown') ||
      nameText.includes('stretch') ||
      nameText.includes('伸展') ||
      nameText.includes('放鬆')) {
    return 'CoolDown';
  }

  return 'Active';
}

// 轉換單一動作資料
function transformExercise(exercise, defaultCategory) {
  const category = CATEGORY_MAP[exercise.器材設定?.器材種類] || defaultCategory;
  const level = LEVEL_MAP[exercise.難度分級] || 'Intermediate';

  return {
    id: exercise.編號,
    name: exercise.動作名稱,
    category: category,
    level: level,
    target: parseTarget(exercise.訓練目標),
    type: parseType(exercise.課程分類, exercise.動作名稱),
    contraindications: parseContraindications(exercise.學員特性過濾),
    details: {
      settings: formatEquipmentSettings(exercise.器材設定),
      safety: Array.isArray(exercise.安全要點) ? exercise.安全要點.join('；') : (exercise.安全要點 || ''),
      cues: formatTeachingCues(exercise.教學口令),
      imagery: exercise.意象提示 || '',
      goals: exercise.訓練目標 || '',
      variations: Array.isArray(exercise.動作變化) ? exercise.動作變化.join('；') : (exercise.動作變化 || '')
    },
    reps: exercise.建議次數 || '10次',
    rawData: exercise // 保留原始資料以便詳情顯示
  };
}

// 格式化器材設定
function formatEquipmentSettings(settings) {
  if (!settings) return '';

  const parts = [];
  if (settings.器材種類) parts.push(`器材：${settings.器材種類}`);
  if (settings.彈簧顏色) parts.push(`彈簧：${settings.彈簧顏色}`);
  if (settings.把桿高度) parts.push(`把桿：${settings.把桿高度}`);
  if (settings.頭靠位置) parts.push(`頭靠：${settings.頭靠位置}`);
  if (settings.繩子設定) parts.push(`繩子：${settings.繩子設定}`);
  if (settings.箱子輔具) parts.push(`輔具：${settings.箱子輔具}`);
  if (settings.梯子位置) parts.push(`梯子：${settings.梯子位置}`);
  if (settings.備註) parts.push(`備註：${settings.備註}`);

  return parts.join('、');
}

// 格式化教學口令
function formatTeachingCues(cues) {
  if (!cues) return '';

  const parts = [];
  if (cues.起始位置) parts.push(`【起始位置】${cues.起始位置}`);
  if (cues.動作引導) parts.push(`【動作引導】${cues.動作引導}`);

  return parts.join(' ');
}

// 載入並轉換所有資料庫
export function loadAllExercises() {
  const allExercises = [];

  // 載入核心床 (Reformer)
  if (Array.isArray(reformerData)) {
    reformerData.forEach(ex => {
      allExercises.push(transformExercise(ex, 'Reformer'));
    });
  }

  // 載入鞦韆床 (Cadillac)
  if (Array.isArray(trapData)) {
    trapData.forEach(ex => {
      allExercises.push(transformExercise(ex, 'Cadillac'));
    });
  }

  // 載入椅子 (Chair)
  if (Array.isArray(chairData)) {
    chairData.forEach(ex => {
      allExercises.push(transformExercise(ex, 'Chair'));
    });
  }

  // 載入梯筒 (Barrel)
  if (Array.isArray(barrelData)) {
    barrelData.forEach(ex => {
      allExercises.push(transformExercise(ex, 'Barrel'));
    });
  }

  // 載入 ARC
  if (Array.isArray(arcData)) {
    arcData.forEach(ex => {
      allExercises.push(transformExercise(ex, 'ARC'));
    });
  }

  console.log(`已載入 ${allExercises.length} 個動作`);
  return allExercises;
}

// 禁忌症選項列表
export const CONTRAINDICATIONS_LIST = [
  { id: 'pregnancy', label: '懷孕 (Pregnancy)' },
  { id: 'osteoporosis', label: '骨質疏鬆 (Osteoporosis)' },
  { id: 'scoliosis', label: '脊椎側彎 (Scoliosis)' },
  { id: 'neck_pain', label: '頸部問題 (Neck Pain)' },
  { id: 'lower_back_pain', label: '下背痛 (Lower Back Pain)' },
  { id: 'knee_pain', label: '膝蓋受傷 (Knee Pain)' },
  { id: 'shoulder_pain', label: '肩膀受傷 (Shoulder Pain)' },
  { id: 'hip_pain', label: '髖關節問題 (Hip Pain)' },
  { id: 'wrist_pain', label: '手腕問題 (Wrist Pain)' }
];

// 器材列表
export const EQUIPMENT_LIST = ['Reformer', 'Cadillac', 'Chair', 'Barrel', 'ARC'];

// 訓練部位列表
export const BODY_TARGETS = [
  { id: 'Core', label: '核心 (Core)' },
  { id: 'Upper', label: '上肢 (Upper)' },
  { id: 'Lower', label: '下肢 (Lower)' },
  { id: 'Back', label: '背部 (Back)' },
  { id: 'Side', label: '側向 (Side)' },
  { id: 'Full Body', label: '全身 (Full)' }
];

// 主題色設定
export const THEMES = {
  stone: { name: '大地暖灰 (Stone)', color: 'stone', class: 'bg-stone-600' },
  slate: { name: '莫蘭迪黑 (Slate)', color: 'slate', class: 'bg-slate-700' },
  rose:  { name: '乾燥玫瑰 (Rose)',  color: 'rose',  class: 'bg-rose-500' },
  teal:  { name: '鼠尾草綠 (Teal)',  color: 'teal',  class: 'bg-teal-600' },
  indigo:{ name: '皇家深藍 (Indigo)',color: 'indigo',class: 'bg-indigo-600' }
};

export default loadAllExercises;
