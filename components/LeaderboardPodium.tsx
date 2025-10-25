import React, { useState, useEffect } from 'react';
import { leaderboardManager } from '../utils/leaderboard';
import type { LeaderboardScore } from '../types';

interface LeaderboardPodiumProps {
    game: string;
    gameId: number; // A changing key to trigger re-fetches
}

const formatTime = (seconds: number) => {
    if (seconds === Infinity || typeof seconds !== 'number') return "-:--";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const PodiumPlace: React.FC<{ rank: number; score?: LeaderboardScore; icon: string }> = ({ rank, score, icon }) => {
    const time = score ? formatTime(score.time) : "-:--";
    const name = score ? score.name : '???';
    const date = score ? new Date(score.date).toLocaleDateString('fr-FR') : 'N/A';
    
    const heightClasses: { [key: number]: string } = { 1: 'h-40', 2: 'h-32', 3: 'h-24' };
    const bgColorClasses: { [key: number]: string } = { 1: 'bg-amber-400', 2: 'bg-slate-400', 3: 'bg-yellow-700' };

    return (
        <div className="flex flex-col items-center w-32">
            <p className="text-4xl">{icon}</p>
            <div className={`w-full text-center rounded-t-lg flex flex-col justify-center items-center p-2 text-white font-bold ${heightClasses[rank]} ${bgColorClasses[rank]}`}>
                <span className="text-lg font-semibold truncate w-full px-1">{name}</span>
                <span className="text-2xl my-1">{time}</span>
                <span className="text-xs opacity-80">{date}</span>
            </div>
        </div>
    );
};

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ game, gameId }) => {
    const [scores, setScores] = useState<LeaderboardScore[]>([]);

    useEffect(() => {
        setScores(leaderboardManager.getScores(game));
    }, [game, gameId]);

    return (
        <div className="w-full mt-12 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">🏆 Podium des Meilleurs Temps</h3>
            <div className="flex justify-center items-end gap-2 sm:gap-4">
                <PodiumPlace rank={2} score={scores[1]} icon="🥈" />
                <PodiumPlace rank={1} score={scores[0]} icon="🥇" />
                <PodiumPlace rank={3} score={scores[2]} icon="🥉" />
            </div>
        </div>
    );
};

export default LeaderboardPodium;
