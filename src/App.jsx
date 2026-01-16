import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Dices,
  Library,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Info,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Filter,
  X,
  ShoppingCart,
  ListPlus,
  Save,
  MoreHorizontal,
  Palette,
  Award,
  TrendingUp,
  UserCog,
  Database,
  Loader2
} from 'lucide-react';

// 載入動作資料庫
import loadAllExercises, {
  CONTRAINDICATIONS_LIST,
  EQUIPMENT_LIST,
  BODY_TARGETS,
  THEMES
} from './data/exerciseDb';

// Helper Functions for Date
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const formatDate = (date) => date.toISOString().split('T')[0];

const getWeekDays = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(current);
    d.setDate(diff + i);
    days.push(d);
  }
  return days;
};

const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// --- 組件: 動作卡片詳情 (Modal) ---
const ExerciseDetailModal = ({ exercise, onClose, themeColor }) => {
  if (!exercise) return null;

  const rawData = exercise.rawData || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`inline-block px-2 py-1 bg-${themeColor}-100 text-${themeColor}-800 text-xs rounded-full mb-2 font-medium`}>
                {exercise.category}
              </span>
              <h3 className="text-2xl font-bold text-gray-800">{exercise.name}</h3>
              <p className="text-sm text-gray-500 mt-1">編號: {exercise.id}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">難度</span>
                <span className="font-medium text-gray-800">{rawData.難度分級 || exercise.level}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">建議次數</span>
                <span className="font-medium text-gray-800">{exercise.reps}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className={`font-semibold text-${themeColor}-700 mb-2 flex items-center`}>
                <Settings size={16} className="mr-2"/> 器材設定
              </h4>
              <p className="text-gray-700 text-sm">{exercise.details.settings || '無特殊設定'}</p>
            </div>

            {rawData.學員特性過濾 && Object.keys(rawData.學員特性過濾).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                  <AlertTriangle size={16} className="mr-2"/> 學員特性過濾
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(rawData.學員特性過濾).map(([key, value]) => (
                    <div key={key} className="bg-red-50 p-2 rounded">
                      <span className="font-medium text-red-800">{key}:</span>
                      <span className="text-red-700 ml-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exercise.details.safety && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                  <AlertTriangle size={16} className="mr-2"/> 安全要點
                </h4>
                <p className="text-gray-700 text-sm">{exercise.details.safety}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold text-indigo-600 mb-2 flex items-center">
                <CheckCircle size={16} className="mr-2"/> 教學口令
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{exercise.details.cues}</p>
            </div>

            {exercise.details.imagery && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-purple-600 mb-2 flex items-center">
                  <Info size={16} className="mr-2"/> 意象提示
                </h4>
                <p className="text-gray-700 italic text-sm">"{exercise.details.imagery}"</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold text-teal-600 mb-2 flex items-center">
                <TrendingUp size={16} className="mr-2"/> 訓練目標
              </h4>
              <p className="text-gray-700 text-sm">{exercise.details.goals}</p>
            </div>

            {exercise.details.variations && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-600 mb-2">動作變化</h4>
                <p className="text-gray-700 text-sm">{exercise.details.variations}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t text-center">
          <button onClick={onClose} className={`w-full py-3 bg-${themeColor}-600 text-white rounded-xl font-medium hover:bg-${themeColor}-700 transition`}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 組件: 日曆視圖 ---
const CalendarView = ({ schedule, setSchedule, themeColor }) => {
  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());

  useEffect(() => {
    setDisplayDate(selectedDate);
  }, []);

  const today = new Date();
  const yearMonthStr = displayDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const currentWeekDays = useMemo(() => getWeekDays(displayDate), [displayDate]);

  const currentMonthDays = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [displayDate]);

  const hasEvent = (date) => {
    if (!date) return false;
    return schedule.some(s => s.date === formatDate(date));
  };

  const getDayEvents = (date) => {
    const dateStr = formatDate(date);
    return schedule.filter(s => s.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
  };

  const selectedEvents = getDayEvents(selectedDate);

  const handlePrev = () => {
    const newDate = new Date(displayDate);
    viewMode === 'week' ? newDate.setDate(newDate.getDate() - 7) : newDate.setMonth(newDate.getMonth() - 1);
    setDisplayDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(displayDate);
    viewMode === 'week' ? newDate.setDate(newDate.getDate() + 7) : newDate.setMonth(newDate.getMonth() + 1);
    setDisplayDate(newDate);
  };

  const selectDay = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setDisplayDate(date);
    if (viewMode === 'month') setViewMode('week');
  };

  return (
    <div className="p-0 lg:p-4 max-w-4xl mx-auto pb-24 h-full flex flex-col">
      <div className="bg-white p-4 lg:rounded-t-2xl shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
           {viewMode === 'week' ? (
             <button onClick={() => setViewMode('month')} className={`flex items-center text-${themeColor}-600 font-medium hover:bg-${themeColor}-50 px-2 py-1 rounded-lg transition`}>
               <ChevronLeft size={20} />
               <span>{displayDate.toLocaleString('default', { month: 'long' })}</span>
             </button>
           ) : (
             <h2 className="text-xl font-bold text-gray-800 px-2">{yearMonthStr}</h2>
           )}
        </div>

        <div className="flex items-center space-x-4">
           {viewMode === 'month' && (
              <div className="flex space-x-1">
                <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
              </div>
           )}
           {viewMode === 'week' && (
             <div className="text-sm font-bold text-gray-800">{yearMonthStr}</div>
           )}
        </div>
      </div>

      <div className="bg-white lg:rounded-b-2xl shadow-sm border-b border-gray-100 pb-2 transition-all duration-300">
        <div className="grid grid-cols-7 text-center mb-2 pt-2">
          {dayNames.map(d => <div key={d} className="text-xs font-medium text-gray-400">{d}</div>)}
        </div>

        {viewMode === 'month' ? (
          <div className="grid grid-cols-7 text-center gap-y-2 pb-4 animate-fadeIn">
            {currentMonthDays.map((date, idx) => (
              <div key={idx} className="flex justify-center">
                {date ? (
                  <button onClick={() => selectDay(date)} className="relative w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all hover:bg-gray-100">
                     <span className={`relative z-10 ${isSameDay(date, selectedDate) ? 'text-white' : isSameDay(date, today) ? `text-${themeColor}-600 font-bold` : 'text-gray-700'}`}>{date.getDate()}</span>
                     {isSameDay(date, selectedDate) && <div className={`absolute inset-0 bg-${themeColor}-600 rounded-full z-0`}></div>}
                     {hasEvent(date) && !isSameDay(date, selectedDate) && <div className="absolute bottom-1 w-1 h-1 bg-gray-400 rounded-full"></div>}
                     {hasEvent(date) && isSameDay(date, selectedDate) && <div className="absolute bottom-1 w-1 h-1 bg-white/70 rounded-full"></div>}
                  </button>
                ) : <div className="w-10 h-10"/>}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
             <button onClick={handlePrev} className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-${themeColor}-600 hidden lg:block`}><ChevronLeft size={24}/></button>
             <button onClick={handleNext} className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-${themeColor}-600 hidden lg:block`}><ChevronRight size={24}/></button>

            <div className="grid grid-cols-7 text-center py-4 px-2 overflow-x-auto scrollbar-hide touch-pan-x">
              {currentWeekDays.map((date, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button onClick={() => selectDay(date)} className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-medium transition-all ${isSameDay(date, selectedDate) ? `bg-${themeColor}-600 text-white shadow-md scale-110` : isSameDay(date, today) ? `bg-gray-100 text-${themeColor}-600 font-bold` : 'text-gray-700 hover:bg-gray-50'}`}>
                    {date.getDate()}
                  </button>
                  {hasEvent(date) && <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isSameDay(date, selectedDate) ? `bg-${themeColor}-600` : 'bg-gray-300'}`}></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
          <span>{selectedDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
          <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full">{selectedEvents.length} 堂課</span>
        </h3>

        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-2">
            <CalendarIcon size={48} className="mb-2 opacity-20" />
            <p>本日尚無安排課程</p>
            <button className={`mt-4 text-${themeColor}-600 font-medium text-sm hover:underline`}>
              + 新增課程
            </button>
          </div>
        ) : (
          <div className="space-y-3">
             {selectedEvents.map((event) => (
                <div key={event.id} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-stretch group hover:border-${themeColor}-300 transition-colors`}>
                  <div className="flex flex-col justify-center items-center pr-4 border-r border-gray-100 min-w-[4rem]">
                    <span className="text-lg font-bold text-gray-800">{event.time}</span>
                    <span className="text-xs text-gray-500">1 hr</span>
                  </div>
                  <div className="pl-4 flex-1 py-1">
                    <h4 className="font-bold text-gray-800 text-lg mb-1">{event.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User size={14} className="mr-1" />
                      {event.student}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.plan.slice(0, 3).map((ex, i) => (
                         <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{ex.name}</span>
                      ))}
                      {event.plan.length > 3 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">+{event.plan.length - 3}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end pl-2">
                     <button className={`text-gray-300 hover:text-${themeColor}-600`}><MoreHorizontal size={18}/></button>
                     <button onClick={() => setSchedule(schedule.filter(s => s.id !== event.id))} className="text-red-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 組件: 購物車 (手動排課) ---
const PlanCart = ({ cart, setCart, onSave, themeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (cart.length === 0) return null;

  return (
    <>
      {!isOpen && (
        <div className={`fixed bottom-20 left-4 right-4 lg:left-72 lg:right-8 bg-${themeColor}-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-40 animate-fadeIn cursor-pointer`} onClick={() => setIsOpen(true)}>
          <div className="flex items-center">
            <div className={`bg-white text-${themeColor}-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3`}>{cart.length}</div>
            <span className="font-medium">已選擇動作 (手動排課)</span>
          </div>
          <div className="flex items-center"><span className="mr-2 text-sm">查看</span><ChevronRight size={18} /></div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end lg:justify-center items-center">
          <div className="bg-white w-full max-w-2xl lg:rounded-2xl rounded-t-2xl shadow-2xl h-[80vh] flex flex-col animate-fadeIn">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 lg:rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <ShoppingCart className={`mr-2 text-${themeColor}-600`}/> 手動排課清單
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.map((ex, idx) => (
                <div key={`${ex.id}-${idx}`} className="flex items-center bg-white p-3 border rounded-lg shadow-sm">
                   <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-3">{idx + 1}</div>
                   <div className="flex-1">
                     <div className="font-medium text-gray-800">{ex.name}</div>
                     <div className="text-xs text-gray-500">{ex.category} • {ex.target}</div>
                   </div>
                   <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-gray-500 mt-10">清單是空的，去動作庫加點東西吧！</p>}
            </div>

            <div className="p-4 border-t bg-gray-50 lg:rounded-b-2xl">
               <div className="flex space-x-3">
                 <button onClick={() => setCart([])} className="px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-white transition">清空</button>
                 <button onClick={() => { onSave(cart); setIsOpen(false); setCart([]); }} className={`flex-1 py-3 bg-${themeColor}-600 text-white rounded-xl font-bold shadow hover:bg-${themeColor}-700 transition flex items-center justify-center`}>
                   <Save className="mr-2" size={18}/> 存入課表
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- 組件: 動作庫 ---
const LibraryView = ({ exercises, openDetail, addToCart, cart, themeColor }) => {
  const [filter, setFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...EQUIPMENT_LIST];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = useMemo(() => {
    let result = exercises;

    if (filter !== 'All') {
      result = result.filter(ex => ex.category === filter);
    }

    if (levelFilter !== 'All') {
      result = result.filter(ex => ex.level === levelFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [exercises, filter, levelFilter, searchQuery]);

  return (
    <div className="p-4 max-w-6xl mx-auto pb-32">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Library className={`mr-2 text-${themeColor}-600`} /> 動作資料庫
        </h2>
        <span className={`text-xs bg-${themeColor}-50 text-${themeColor}-600 px-3 py-1 rounded-full border border-${themeColor}-100`}>
          共 {exercises.length} 個動作
        </span>
       </div>

       {/* 搜尋框 */}
       <div className="mb-4">
         <input
           type="text"
           placeholder="搜尋動作名稱或編號..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-100 outline-none transition`}
         />
       </div>

       {/* 器材分類 */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              filter === cat
                ? `bg-${themeColor}-600 text-white shadow-md`
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'All' ? '全部器材' : cat}
          </button>
        ))}
      </div>

      {/* 難度分類 */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-4 scrollbar-hide">
        {levels.map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
              levelFilter === lvl
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {lvl === 'All' ? '全部難度' : lvl === 'Beginner' ? '初階' : lvl === 'Intermediate' ? '中階' : '高階'}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">顯示 {filteredExercises.length} 個動作</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map(ex => (
          <div key={ex.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group relative">
            <div className="cursor-pointer" onClick={() => openDetail(ex)}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold text-${themeColor}-600 bg-${themeColor}-50 px-2 py-1 rounded-md`}>{ex.category}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${ex.level === 'Advanced' ? 'bg-red-100 text-red-600' : ex.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-600'}`}>
                  {ex.level === 'Beginner' ? '初階' : ex.level === 'Intermediate' ? '中階' : '高階'}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{ex.name}</h3>
              <p className="text-gray-400 text-xs mb-2">{ex.id}</p>
              <p className="text-gray-500 text-sm line-clamp-2">{ex.details.goals}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); addToCart(ex); }} className={`absolute bottom-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-${themeColor}-600 hover:text-white transition shadow-sm active:scale-90`}>
              <Plus size={20} />
            </button>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Database size={48} className="mx-auto mb-4 opacity-30" />
          <p>找不到符合條件的動作</p>
        </div>
      )}
    </div>
  );
};

// --- 主要應用程式 ---
export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [cart, setCart] = useState([]);
  const [themeColor, setThemeColor] = useState('stone');

  // 載入動作資料庫
  const [exerciseDB, setExerciseDB] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const data = loadAllExercises();
      setExerciseDB(data);
      setIsLoading(false);
    } catch (error) {
      console.error('載入資料庫失敗:', error);
      setIsLoading(false);
    }
  }, []);

  // 時數計算
  const teachingHours = useMemo(() => {
    const baseTeaching = 120;
    const scheduledHours = schedule.length;
    return {
      teaching: baseTeaching + scheduledHours,
      observation: 45,
      practice: 80,
      goal: 500
    };
  }, [schedule]);

  const totalHours = teachingHours.teaching + teachingHours.observation + teachingHours.practice;
  const progressPercent = Math.min(100, Math.round((totalHours / teachingHours.goal) * 100));

  const [studio, setStudio] = useState('City Center Studio');
  const [classType, setClassType] = useState('private');
  const [students] = useState([
    { id: 1, name: '張小美', notes: '左膝舊傷，核心較弱', planHistory: 5 },
    { id: 2, name: '李大文', notes: '長時間久坐，下背緊繃', planHistory: 12 },
  ]);

  const [genDifficulty, setGenDifficulty] = useState(['Beginner']);
  const [genEquipment, setGenEquipment] = useState([]);
  const [genTargets, setGenTargets] = useState([]);
  const [genContra, setGenContra] = useState([]);
  const [genResult, setGenResult] = useState(null);

  const generatePlan = () => {
    let pool = [...exerciseDB];

    // 器材過濾
    if (genEquipment.length > 0) {
      pool = pool.filter(ex => genEquipment.includes(ex.category));
    }

    // 難度過濾
    const levels = genDifficulty.length > 0 ? genDifficulty : ['Beginner', 'Intermediate', 'Advanced'];
    pool = pool.filter(ex => levels.includes(ex.level));

    // 訓練部位過濾
    if (genTargets.length > 0) {
      pool = pool.filter(ex => genTargets.includes(ex.target) || ex.target === 'Full Body');
    }

    // 禁忌症過濾
    if (genContra.length > 0) {
      pool = pool.filter(ex => !ex.contraindications.some(c => genContra.includes(c)));
    }

    // 隨機抽取
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const activeMoves = shuffled.filter(ex => ex.type === 'Active');
    const coolDownMoves = shuffled.filter(ex => ex.type === 'CoolDown');
    const selectedActive = activeMoves.slice(0, 9);
    const selectedCoolDown = coolDownMoves.slice(0, 1);
    const finalPlan = [...selectedActive, ...selectedCoolDown];
    setGenResult(finalPlan);
  };

  const addToSchedule = (plan, planName) => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent = {
      id: Date.now(),
      date: today,
      time: '10:00',
      title: planName,
      plan: plan,
      student: classType === 'private' ? '張小美 (預設)' : '團體課'
    };
    setSchedule([...schedule, newEvent]);
    setCurrentTab('calendar');
  };

  const toggleEquipment = (eq) => setGenEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);
  const toggleDifficulty = (lvl) => setGenDifficulty(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  const toggleTarget = (targetId) => setGenTargets(prev => prev.includes(targetId) ? prev.filter(t => t !== targetId) : [...prev, targetId]);
  const toggleContra = (c) => setGenContra(prev => prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]);

  // Loading 畫面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-gray-600">載入動作資料庫中...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(currentTab) {
      case 'home':
        return (
          <div className="p-4 max-w-4xl mx-auto pb-24 animate-fadeIn">
            <header className="mb-8 mt-4">
              <h1 className="text-3xl font-bold text-gray-800">早安，教練</h1>
              <p className="text-gray-500">準備好開始今天的課程了嗎？</p>
            </header>

            {/* 資料庫統計 */}
            <div className={`bg-${themeColor}-50 rounded-2xl p-4 mb-6 border border-${themeColor}-100`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className={`text-${themeColor}-600 mr-2`} size={20} />
                  <span className="font-medium text-gray-700">動作資料庫已載入</span>
                </div>
                <span className={`text-${themeColor}-700 font-bold`}>{exerciseDB.length} 個動作</span>
              </div>
            </div>

            {/* 教室選擇 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">選擇教室</h2>
                <select
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  className={`bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-${themeColor}-500 focus:border-${themeColor}-500 block p-2.5`}
                >
                  <option>City Center Studio</option>
                  <option>Riverside Branch</option>
                  <option>Home Studio</option>
                </select>
              </div>

              <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setClassType('group')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${classType === 'group' ? `bg-white shadow text-${themeColor}-700` : 'text-gray-500'}`}
                >
                  <Users className="inline-block w-4 h-4 mr-1"/> 團體課程
                </button>
                <button
                  onClick={() => setClassType('private')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${classType === 'private' ? `bg-white shadow text-${themeColor}-700` : 'text-gray-500'}`}
                >
                  <User className="inline-block w-4 h-4 mr-1"/> 私人教練
                </button>
              </div>

              {classType === 'private' ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">學員名單</h3>
                  <div className="space-y-3">
                    {students.map(student => (
                      <div key={student.id} className={`flex items-center justify-between p-3 hover:bg-${themeColor}-50 rounded-xl border border-transparent hover:border-${themeColor}-100 transition cursor-pointer group`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full bg-${themeColor}-100 flex items-center justify-center text-${themeColor}-700 font-bold mr-3`}>
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.notes}</p>
                          </div>
                        </div>
                        <ChevronRight className={`text-gray-300 group-hover:text-${themeColor}-500`} size={20} />
                      </div>
                    ))}
                    <button className={`w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-${themeColor}-300 hover:text-${themeColor}-600 transition flex items-center justify-center`}>
                      <Plus size={18} className="mr-1"/> 新增學員
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-orange-100 text-orange-500 mb-3">
                    <Users size={32} />
                  </div>
                  <h3 className="font-bold text-gray-800">團體課模式</h3>
                  <p className="text-sm text-gray-500 mt-1">無需記錄詳細個案，專注於動作流暢度與通用指令。</p>
                  <button
                    onClick={() => setCurrentTab('auto')}
                    className={`mt-4 px-6 py-2 bg-${themeColor}-600 text-white rounded-full text-sm font-medium hover:bg-${themeColor}-700`}
                  >
                    前往排課
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 max-w-4xl mx-auto pb-24 animate-fadeIn">
             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <UserCog className={`mr-2 text-${themeColor}-600`} /> 設定與個人檔案
            </h2>

            {/* 教學時數存摺 */}
            <div className={`bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h2 className="text-lg font-bold flex items-center opacity-90">
                    <Award className="mr-2" size={20}/> 認證時數存摺
                  </h2>
                  <p className="text-sm opacity-70">PMA 認證目標進度</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">{totalHours}</span>
                  <span className="text-sm opacity-70"> / {teachingHours.goal} hr</span>
                </div>
              </div>

              <div className="w-full bg-black/20 rounded-full h-3 mb-4 relative z-10">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 relative z-10">
                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                  <div className="text-xs opacity-70">教學</div>
                  <div className="font-bold">{teachingHours.teaching}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                  <div className="text-xs opacity-70">觀摩</div>
                  <div className="font-bold">{teachingHours.observation}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                  <div className="text-xs opacity-70">練習</div>
                  <div className="font-bold">{teachingHours.practice}</div>
                </div>
              </div>

              <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition flex items-center justify-center">
                 <Clock size={14} className="mr-1"/> 補登時數
              </button>
            </div>

            {/* 主題選擇器 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                <Palette size={16} className="mr-2"/> 自訂主題風格
              </h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setThemeColor(key)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition ${themeColor === key ? `border-${theme.color}-500 bg-${theme.color}-50 ring-1 ring-${theme.color}-500` : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${theme.class}`}></div>
                    <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 資料庫資訊 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                <Database size={16} className="mr-2"/> 動作資料庫統計
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_LIST.map(eq => {
                  const count = exerciseDB.filter(ex => ex.category === eq).length;
                  return (
                    <div key={eq} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">{eq}</div>
                      <div className="font-bold text-gray-800">{count} 個動作</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 其他設定 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                  <span className="text-gray-700">關於 Pilates AI</span>
                  <span className="text-gray-400 text-sm">v1.0.0</span>
               </div>
               <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                  <span className="text-red-500">登出帳號</span>
               </div>
            </div>
          </div>
        );

      case 'auto':
        return (
          <div className="p-4 max-w-4xl mx-auto pb-24 animate-fadeIn">
             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Dices className={`mr-2 text-${themeColor}-600`} /> 自動排課抽卡
            </h2>

            {!genResult ? (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Filter size={18} className="mr-2"/> 難度選擇 (可複選)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <button key={lvl} onClick={() => toggleDifficulty(lvl)} className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${genDifficulty.includes(lvl) ? `bg-${themeColor}-600 text-white border-${themeColor}-600 shadow-sm` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                        {lvl === 'Beginner' ? '初階' : lvl === 'Intermediate' ? '中階' : '高階'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center"><ListPlus size={18} className="mr-2"/> 訓練部位 (預設全選)</h3>
                  <div className="flex flex-wrap gap-2">
                    {BODY_TARGETS.map(target => (
                      <button key={target.id} onClick={() => toggleTarget(target.id)} className={`py-2 px-3 rounded-lg text-sm transition border ${genTargets.includes(target.id) ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                        {target.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Settings size={18} className="mr-2"/> 可用器材 (複選)</h3>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_LIST.map(eq => (
                      <button key={eq} onClick={() => toggleEquipment(eq)} className={`py-2 px-3 rounded-lg text-sm transition ${genEquipment.includes(eq) ? `bg-${themeColor}-100 text-${themeColor}-800 border-${themeColor}-200 border` : 'bg-gray-50 text-gray-600 border-transparent'}`}>
                        {eq}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">* 未選擇則從所有器材中抽取</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-red-700 mb-3 flex items-center"><AlertTriangle size={18} className="mr-2"/> 禁忌項目 (排除危險動作)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CONTRAINDICATIONS_LIST.map(c => (
                      <label key={c.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={genContra.includes(c.id)} onChange={() => toggleContra(c.id)} className="rounded text-red-600 focus:ring-red-500" />
                        <span className="text-sm text-gray-700">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={generatePlan} className={`w-full py-4 bg-${themeColor}-600 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-${themeColor}-700 active:scale-95 transition flex items-center justify-center`}>
                  <Dices className="mr-2" /> 開始抽卡 (生成 10 式)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl text-gray-800">生成結果</h3>
                  <button onClick={() => setGenResult(null)} className={`text-sm text-gray-500 hover:text-${themeColor}-600 underline`}>重新設定</button>
                </div>
                {genResult.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl"><p>條件太嚴格，找不到符合的動作。</p></div>
                ) : (
                  <div className="space-y-3">
                    {genResult.map((ex, idx) => (
                      <div key={`${ex.id}-${idx}`} onClick={() => setSelectedExercise(ex)} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center cursor-pointer hover:border-${themeColor}-300 transition`}>
                        <div className={`w-8 h-8 rounded-full bg-${themeColor}-50 flex items-center justify-center text-${themeColor}-600 font-bold mr-3 text-sm`}>{idx + 1}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{ex.name}</h4>
                          <div className="flex gap-2 text-xs mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{ex.category}</span>
                            <span className="bg-indigo-50 px-2 py-0.5 rounded text-indigo-600">{ex.target}</span>
                            {idx === 9 && <span className="bg-green-100 px-2 py-0.5 rounded text-green-700 font-medium">緩和</span>}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                )}
                {genResult.length > 0 && (
                   <button onClick={() => addToSchedule(genResult, `AI 課表 (${genResult.length}式)`)} className={`w-full mt-6 py-3 bg-${themeColor}-600 text-white rounded-xl font-bold shadow hover:bg-${themeColor}-700 flex items-center justify-center`}>
                    <CalendarIcon className="mr-2" size={18} /> 排入課程日曆
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'library':
        return (
          <>
            <LibraryView
              exercises={exerciseDB}
              openDetail={setSelectedExercise}
              addToCart={(ex) => setCart([...cart, ex])}
              cart={cart}
              themeColor={themeColor}
            />
            <PlanCart cart={cart} setCart={setCart} onSave={(items) => addToSchedule(items, `手動排課 (${items.length}式)`)} themeColor={themeColor} />
          </>
        );

      case 'calendar':
        return <CalendarView schedule={schedule} setSchedule={setSchedule} themeColor={themeColor} />;

      default: return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-${themeColor}-100`}>
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 flex justify-between items-center lg:hidden">
        <h1 className={`font-bold text-${themeColor}-700 text-lg flex items-center`}>
          <div className={`w-8 h-8 bg-${themeColor}-600 rounded-lg mr-2 flex items-center justify-center text-white font-serif italic`}>P</div>
          Pilates AI
        </h1>
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User size={18} className="text-gray-600" /></div>
      </div>

      <main className="lg:pl-64 min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col z-40">
          <div className="p-6">
             <h1 className={`font-bold text-${themeColor}-700 text-2xl flex items-center mb-8`}>
              <div className={`w-10 h-10 bg-${themeColor}-600 rounded-lg mr-3 flex items-center justify-center text-white font-serif italic text-xl`}>P</div>
              Pilates AI
            </h1>
            <nav className="space-y-2">
              {[
                { id: 'home', icon: Home, label: '首頁總覽' },
                { id: 'auto', icon: Dices, label: '排課生成器' },
                { id: 'library', icon: Library, label: '動作庫 (手動)' },
                { id: 'calendar', icon: CalendarIcon, label: '課程日曆' },
                { id: 'settings', icon: Settings, label: '設定' },
              ].map(item => (
                <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition font-medium ${currentTab === item.id ? `bg-${themeColor}-50 text-${themeColor}-700` : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">C</div>
              <div><p className="text-sm font-bold text-gray-800">Coach Demo</p><p className="text-xs text-gray-500">Pro Plan</p></div>
            </div>
          </div>
        </aside>
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 lg:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {[
            { id: 'home', icon: Home, label: '首頁' },
            { id: 'auto', icon: Dices, label: '排課' },
            { id: 'library', icon: Library, label: '動作庫' },
            { id: 'calendar', icon: CalendarIcon, label: '日曆' },
            { id: 'settings', icon: Settings, label: '設定' },
          ].map(item => (
            <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center justify-center w-full h-full transition ${currentTab === item.id ? `text-${themeColor}-600` : 'text-gray-400'}`}>
              <item.icon size={currentTab === item.id ? 24 : 20} strokeWidth={currentTab === item.id ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Exercise Detail Modal */}
      {selectedExercise && <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} themeColor={themeColor} />}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
