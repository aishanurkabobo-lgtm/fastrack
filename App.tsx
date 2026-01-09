
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ExerciseCalendar from './components/ExerciseCalendar';
import FlappyBird from './components/FlappyBird';
import DinoGame from './components/DinoGame';
import Achievements from './components/Achievements';
import { WorkoutData, UserStats, GameType, MotivationMessage, Badge } from './types';
import { getMotivationalMessage } from './services/geminiService';
import { 
  Trophy, 
  Flame, 
  Target, 
  Gamepad2, 
  Calendar as CalendarIcon, 
  Quote, 
  Activity,
  ChevronRight,
  Info,
  Medal
} from 'lucide-react';

const INITIAL_BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your 1st workout.', icon: 'zap', unlocked: false },
  { id: 'consistency_week', name: 'Week Strong', description: 'Reach a 7-day streak.', icon: 'flame', unlocked: false },
  { id: 'habit_builder', name: 'Habit Builder', description: 'Reach a 21-day streak.', icon: 'target', unlocked: false },
  { id: 'century_club', name: 'Century Club', description: '100 total workouts.', icon: 'trophy', unlocked: false },
  { id: 'marathoner', name: 'Month Master', description: 'Workout 30 days total.', icon: 'award', unlocked: false },
  { id: 'dedicated', name: 'Legendary', description: 'Reach a 100-day streak.', icon: 'star', unlocked: false }
];

const App: React.FC = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutData>(() => {
    const saved = localStorage.getItem('fitfocus_workouts');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentGame, setCurrentGame] = useState<GameType>(GameType.NONE);
  const [motivation, setMotivation] = useState<MotivationMessage | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const stats = useMemo((): UserStats => {
    const dates = Object.keys(workoutData).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Streaks
    let prevDate: Date | null = null;
    dates.forEach((dateStr) => {
      const currDate = new Date(dateStr);
      if (prevDate) {
        const diff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
      prevDate = currDate;
    });

    // Current streak
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    // If worked out today or yesterday, the streak is alive
    if (workoutData[todayStr] || workoutData[yesterdayStr]) {
      let iterDate = new Date(workoutData[todayStr] ? todayStr : yesterdayStr);
      while (workoutData[iterDate.toISOString().split('T')[0]]) {
        currentStreak++;
        iterDate.setDate(iterDate.getDate() - 1);
      }
    }

    const totalWorkouts = dates.length;
    const points = totalWorkouts * 100;
    const level = Math.floor(points / 500) + 1;

    // Achievement Logic
    const badges = INITIAL_BADGES.map(badge => {
      let unlocked = false;
      switch (badge.id) {
        case 'first_step': unlocked = totalWorkouts >= 1; break;
        case 'consistency_week': unlocked = maxStreak >= 7; break;
        case 'habit_builder': unlocked = maxStreak >= 21; break;
        case 'century_club': unlocked = totalWorkouts >= 100; break;
        case 'marathoner': unlocked = totalWorkouts >= 30; break;
        case 'dedicated': unlocked = maxStreak >= 100; break;
      }
      return { ...badge, unlocked };
    });

    return { 
      streak: currentStreak, 
      totalWorkouts, 
      bestStreak: maxStreak,
      achievements: {
        points,
        level,
        nextLevelPoints: 500,
        badges,
        weeklyConsistency: 0 // Simplification for now
      }
    };
  }, [workoutData]);

  useEffect(() => {
    localStorage.setItem('fitfocus_workouts', JSON.stringify(workoutData));
  }, [workoutData]);

  useEffect(() => {
    const fetchMotivation = async () => {
      setLoadingMotivation(true);
      const msg = await getMotivationalMessage(stats.streak, stats.totalWorkouts);
      setMotivation(msg);
      setLoadingMotivation(false);
    };
    fetchMotivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleWorkout = (date: string) => {
    setWorkoutData(prev => {
      const next = { ...prev };
      if (next[date]) {
        delete next[date];
      } else {
        next[date] = true;
      }
      return next;
    });
  };

  const handleManualMark = () => {
    const today = new Date().toISOString().split('T')[0];
    toggleWorkout(today);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row custom-scrollbar overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-20 sticky top-0 md:h-screen">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Activity className="w-6 h-6 text-emerald-950" />
          </div>
          <h1 className="text-xl font-bold hidden lg:block tracking-tight">FitFocus</h1>
        </div>

        <nav className="flex md:flex-col gap-4 flex-1">
          <button 
            onClick={() => setCurrentGame(GameType.NONE)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentGame === GameType.NONE ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <CalendarIcon className="w-6 h-6" />
            <span className="font-medium hidden lg:block">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentGame(GameType.FLAPPY)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentGame === GameType.FLAPPY ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Gamepad2 className="w-6 h-6" />
            <span className="font-medium hidden lg:block">Flappy Bird</span>
          </button>

          <button 
            onClick={() => setCurrentGame(GameType.DINO)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentGame === GameType.DINO ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Target className="w-6 h-6" />
            <span className="font-medium hidden lg:block">Dino Jump</span>
          </button>
        </nav>

        <div className="mt-auto hidden lg:block">
           <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
             <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase">
                <Info className="w-3 h-3" />
                <span>Gamification</span>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Earn 100 XP for every workout! Level up and unlock legendary badges.
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full pb-24 md:pb-12">
        {currentGame === GameType.NONE ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Stats */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">My Fitness Profile</h2>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-200">
                    <Medal className="w-3.5 h-3.5 text-amber-400" />
                    Lvl {stats.achievements.level}
                  </span>
                  <span className="text-sm">Keep up the consistency!</span>
                </div>
              </div>
              <button 
                onClick={handleManualMark}
                className={`
                  px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                  ${workoutData[new Date().toISOString().split('T')[0]] 
                    ? 'bg-slate-800 text-slate-400 cursor-default shadow-inner' 
                    : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] active:scale-95'
                  }
                `}
              >
                {workoutData[new Date().toISOString().split('T')[0]] ? 'Workout Logged ✓' : 'Log Workout (+100 XP)'}
                {!workoutData[new Date().toISOString().split('T')[0]] && <ChevronRight className="w-5 h-5" />}
              </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Flame className="w-20 h-20 text-orange-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Streak</span>
                </div>
                <div className="text-4xl font-black text-slate-100">{stats.streak} <span className="text-xl font-normal text-slate-500">days</span></div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Trophy className="w-20 h-20 text-yellow-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Workouts</span>
                </div>
                <div className="text-4xl font-black text-slate-100">{stats.totalWorkouts}</div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Target className="w-20 h-20 text-blue-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Record Streak</span>
                </div>
                <div className="text-4xl font-black text-slate-100">{stats.bestStreak}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-7 space-y-8">
                <ExerciseCalendar 
                  workoutData={workoutData} 
                  onToggleDate={toggleWorkout} 
                />
                
                {/* Motivation Box */}
                <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 p-8 rounded-3xl relative flex flex-col justify-center shadow-xl">
                  <Quote className="absolute top-6 left-6 w-10 h-10 text-indigo-500/10" />
                  {loadingMotivation ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-indigo-500/10 rounded-full animate-pulse w-3/4"></div>
                      <div className="h-4 bg-indigo-500/10 rounded-full animate-pulse w-1/2"></div>
                    </div>
                  ) : motivation ? (
                    <div className="relative z-10">
                      <p className="text-xl italic font-medium leading-relaxed mb-6 text-indigo-100">
                        "{motivation.text}"
                      </p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/30">
                            {motivation.author.charAt(0)}
                         </div>
                         <span className="font-semibold text-indigo-400/80">— {motivation.author}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">"The only bad workout is the one that didn't happen."</p>
                  )}
                </div>
              </div>

              {/* Achievements Column */}
              <div className="lg:col-span-5 space-y-8">
                <Achievements stats={stats.achievements} />
                
                {/* Game CTA */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-6 group hover:bg-amber-500/20 transition-all cursor-pointer" onClick={() => setCurrentGame(GameType.FLAPPY)}>
                  <div className="bg-amber-500 p-4 rounded-2xl group-hover:rotate-6 transition-transform">
                    <Gamepad2 className="w-8 h-8 text-amber-950" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-200">Resting set?</h4>
                    <p className="text-sm text-slate-400 mb-3">Beat your high score while you recover!</p>
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Start Gaming <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentGame(GameType.NONE)}
                  className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <div>
                  <h2 className="text-3xl font-black">{currentGame === GameType.FLAPPY ? 'Flappy Bird' : 'Dino Jump'}</h2>
                  <p className="text-slate-400">Quick cognitive boost between sets.</p>
                </div>
              </div>
              
              <div className="hidden md:flex gap-2">
                <button 
                  onClick={() => setCurrentGame(GameType.FLAPPY)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${currentGame === GameType.FLAPPY ? 'bg-amber-500 text-amber-950 shadow-lg' : 'bg-slate-800 text-slate-400'}`}
                >
                  Flappy
                </button>
                <button 
                  onClick={() => setCurrentGame(GameType.DINO)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${currentGame === GameType.DINO ? 'bg-indigo-500 text-indigo-950 shadow-lg' : 'bg-slate-800 text-slate-400'}`}
                >
                  Dino
                </button>
              </div>
            </header>

            <div className="max-w-2xl mx-auto py-8">
              {currentGame === GameType.FLAPPY ? <FlappyBird /> : <DinoGame />}
              
              <div className="mt-12 bg-slate-800/50 p-6 rounded-3xl border border-slate-700 flex items-start gap-4 shadow-xl">
                 <div className="p-3 bg-slate-700 rounded-2xl">
                    <Info className="w-6 h-6 text-slate-300" />
                 </div>
                 <div>
                    <h5 className="font-bold mb-1">How to play</h5>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Simply tap or click anywhere on the game area to perform an action. In Flappy Bird, you flap to stay afloat. In Dino Jump, you jump to avoid the red obstacles. High scores won't earn XP yet, but they sure feel good!
                    </p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Mobile Footer CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-30">
        <button 
          onClick={handleManualMark}
          className="w-full bg-emerald-500 text-emerald-950 py-4 rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-transform"
        >
          {workoutData[new Date().toISOString().split('T')[0]] ? 'ALREADY LOGGED TODAY' : 'LOG WORKOUT (+100 XP)'}
        </button>
      </div>
    </div>
  );
};

export default App;
