
import React from 'react';
import { Badge, AchievementStats } from '../types';
import { Medal, Star, Zap, Award, Target, Flame, Trophy } from 'lucide-react';

interface AchievementsProps {
  stats: AchievementStats;
}

const Achievements: React.FC<AchievementsProps> = ({ stats }) => {
  const getIcon = (iconName: string, unlocked: boolean) => {
    const className = `w-6 h-6 ${unlocked ? 'text-slate-100' : 'text-slate-500'}`;
    switch (iconName) {
      case 'star': return <Star className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'award': return <Award className={className} />;
      case 'target': return <Target className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'trophy': return <Trophy className={className} />;
      default: return <Medal className={className} />;
    }
  };

  const progressPercentage = (stats.points % 500) / 500 * 100;

  return (
    <div className="space-y-6">
      {/* Level and Points Card */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 opacity-5">
          <Star className="w-32 h-32 text-emerald-400" />
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">User Level</span>
            <div className="text-4xl font-black text-slate-100">Lvl {stats.level}</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total XP</span>
            <div className="text-xl font-bold text-slate-300">{stats.points} pts</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Progress to Level {stats.level + 1}</span>
            <span>{Math.floor(progressPercentage)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-500" />
          Milestone Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.badges.map((badge) => (
            <div 
              key={badge.id}
              className={`
                p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-500
                ${badge.unlocked 
                  ? 'bg-slate-800/80 border-slate-700 shadow-md scale-100' 
                  : 'bg-slate-900/20 border-slate-800 opacity-40 grayscale'
                }
              `}
            >
              <div className={`
                p-3 rounded-full mb-3 
                ${badge.unlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg' : 'bg-slate-800'}
              `}>
                {getIcon(badge.icon, badge.unlocked)}
              </div>
              <div className="text-xs font-bold text-slate-100 mb-1">{badge.name}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
