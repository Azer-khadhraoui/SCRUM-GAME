import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/data/questions';
import { getRandomQuestions, prizeLadder, safeHavens } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Volume2, VolumeX, Phone, Users, Timer, Trophy, ChevronRight, Pause, Sparkles, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

// Sound effects using Web Audio API
const playSound = (type: 'correct' | 'wrong' | 'select' | 'win' | 'hover') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'correct':
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
      break;
    case 'wrong':
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.6);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
      break;
    case 'select':
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
      break;
    case 'hover':
      oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
    case 'win':
      // Play a victory arpeggio
      [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((delay, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
        osc.frequency.setValueAtTime(notes[i], audioContext.currentTime + delay);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.4);
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + 0.4);
      });
      break;
  }
};

// Trigger confetti explosion
const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

type GameState = 'menu' | 'playing' | 'answered' | 'gameover' | 'won';
type Lifeline = 'fifty-fifty' | 'phone' | 'audience';

// Animated background particles component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 7}s`
          }}
        />
      ))}
      {/* Glowing orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
};

// Esprit University Logo Easter Egg Component
const EspritLogo = ({ onClick, isPaused }: { onClick: () => void; isPaused: boolean }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-500/50"
      title="Easter Egg: Cliquez pour une surprise !"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        {isPaused && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
        )}
      </div>
      <span className="text-white font-bold text-sm tracking-wide">ESPRIT</span>
      <span className="text-yellow-300 font-bold text-xs">UNIVERSITY</span>
      <Zap className="w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default function Game() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [usedLifelines, setUsedLifelines] = useState<Lifeline[]>([]);
  const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [audienceVotes, setAudienceVotes] = useState<number[]>([]);
  const [showAudiencePoll, setShowAudiencePoll] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showEasterEggMessage, setShowEasterEggMessage] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [hoveredAnswer, setHoveredAnswer] = useState<number | null>(null);

  // Initialize questions when starting a new game
  const startNewGame = useCallback(() => {
    setQuestions(getRandomQuestions(10));
    setCurrentQuestionIndex(0);
    setGameState('playing');
    setSelectedAnswer(null);
    setUsedLifelines([]);
    setEliminatedAnswers([]);
    setAudienceVotes([]);
    setShowAudiencePoll(false);
    setTimeLeft(30);
    setIsTimerPaused(false);
    setAnswerRevealed(false);
    setShowEasterEggMessage(false);
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !isTimerPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0 && !isTimerPaused) {
      handleTimeUp();
    }
  }, [timeLeft, gameState, isTimerPaused]);

  // Reset timer when moving to next question
  useEffect(() => {
    if (gameState === 'playing') {
      setTimeLeft(30);
      setIsTimerPaused(false);
      setAnswerRevealed(false);
    }
  }, [currentQuestionIndex, gameState]);

  const handleTimeUp = () => {
    if (soundEnabled) playSound('wrong');
    setGameState('gameover');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentPrize = prizeLadder[currentQuestionIndex];
  const guaranteedPrize = safeHavens
    .filter(p => p < currentPrize)
    .pop() || 0;

  // Easter egg handler
  const handleEasterEgg = () => {
    if (!currentQuestion || gameState !== 'playing') return;
    
    setIsTimerPaused(true);
    setShowEasterEggMessage(true);
    setAnswerRevealed(true);
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setShowEasterEggMessage(false);
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState !== 'playing' || eliminatedAnswers.includes(answerIndex)) return;
    
    if (soundEnabled) playSound('select');
    setSelectedAnswer(answerIndex);
    setGameState('answered');

    // Delay before showing result
    setTimeout(() => {
      if (answerIndex === currentQuestion.correctAnswer) {
        if (soundEnabled) playSound('correct');
        triggerConfetti();
        if (currentQuestionIndex === questions.length - 1) {
          setGameState('won');
          if (soundEnabled) playSound('win');
          triggerConfetti();
        }
      } else {
        if (soundEnabled) playSound('wrong');
        setGameState('gameover');
      }
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setEliminatedAnswers([]);
      setShowAudiencePoll(false);
      setIsTimerPaused(false);
      setAnswerRevealed(false);
      setGameState('playing');
    }
  };

  const useFiftyFifty = () => {
    if (usedLifelines.includes('fifty-fifty')) return;
    
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQuestion.correctAnswer);
    const toEliminate = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedAnswers(toEliminate);
    setUsedLifelines([...usedLifelines, 'fifty-fifty']);
    
    if (soundEnabled) playSound('select');
  };

  const usePhoneFriend = () => {
    if (usedLifelines.includes('phone')) return;
    
    const confidence = Math.random();
    let suggestedAnswer: number;
    
    if (confidence > 0.3) {
      suggestedAnswer = currentQuestion.correctAnswer;
    } else {
      const wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQuestion.correctAnswer);
      suggestedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
    
    const letters = ['A', 'B', 'C', 'D'];
    alert(`📞 Votre ami pense que la réponse est ${letters[suggestedAnswer]}...`);
    setUsedLifelines([...usedLifelines, 'phone']);
    
    if (soundEnabled) playSound('select');
  };

  const useAskAudience = () => {
    if (usedLifelines.includes('audience')) return;
    
    const votes = [0, 0, 0, 0];
    const correctAnswer = currentQuestion.correctAnswer;
    
    // 70% chance audience picks correct answer
    for (let i = 0; i < 100; i++) {
      if (Math.random() < 0.7) {
        votes[correctAnswer]++;
      } else {
        const wrongAnswers = [0, 1, 2, 3].filter(j => j !== correctAnswer);
        votes[wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]]++;
      }
    }
    
    setAudienceVotes(votes);
    setShowAudiencePoll(true);
    setUsedLifelines([...usedLifelines, 'audience']);
    
    if (soundEnabled) playSound('select');
  };

  const confirmActionWithDialog = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleQuit = () => {
    confirmActionWithDialog(
      `Voulez-vous vraiment quitter avec ${guaranteedPrize.toLocaleString('fr-FR')} € ?`,
      () => {
        setGameState('gameover');
        setShowConfirmDialog(false);
      }
    );
  };

  // Get answer letter (A, B, C, D)
  const getAnswerLetter = (index: number) => ['A', 'B', 'C', 'D'][index];

  // Get answer color based on state
  const getAnswerColor = (index: number) => {
    if (eliminatedAnswers.includes(index)) {
      return 'bg-gray-900/80 opacity-20 cursor-not-allowed grayscale';
    }
    if (answerRevealed && index === currentQuestion?.correctAnswer) {
      return 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 animate-pulse-glow cursor-pointer';
    }
    if (selectedAnswer === null) {
      return 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 hover:from-blue-700 hover:via-blue-500 hover:to-blue-700 cursor-pointer transition-all duration-300';
    }
    if (selectedAnswer === index) {
      if (index === currentQuestion.correctAnswer) {
        return 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 animate-pulse-glow';
      }
      return 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-shake';
    }
    if (index === currentQuestion.correctAnswer && selectedAnswer !== null) {
      return 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 animate-pulse-glow';
    }
    return 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 opacity-40';
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Animated title */}
        <div className="text-center max-w-3xl relative z-10">
          <div className="mb-8 animate-title-entrance">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 via-orange-400 to-yellow-300 mb-2 drop-shadow-2xl animate-shimmer bg-[length:200%_auto]">
              QUI VEUT
            </h1>
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 via-orange-400 to-yellow-300 mb-6 drop-shadow-2xl animate-shimmer bg-[length:200%_auto]" style={{ animationDelay: '0.2s' }}>
              GAGNER DES
            </h2>
            <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 mb-8 drop-shadow-2xl animate-shimmer bg-[length:200%_auto]" style={{ animationDelay: '0.4s' }}>
              MILLIONS ?
            </h2>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mb-2">Édition Spéciale</p>
            <p className="text-3xl md:text-4xl font-black text-white mb-10 tracking-wider">SCRUM & AGILITÉ</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-blue-900/60 rounded-3xl p-8 mb-10 backdrop-blur-xl border border-blue-400/30 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-400 animate-spin-slow" />
              <p className="text-blue-100 text-xl font-semibold">Testez vos connaissances sur Scrum !</p>
              <Star className="w-6 h-6 text-yellow-400 animate-spin-slow" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                '10 questions aléatoires parmi 20',
                '3 jokers : 50/50, Appel, Public',
                '30 secondes par question',
                'Gagnez jusqu\'à 1 000 000 € !'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-blue-800/40 rounded-xl p-3 hover:bg-blue-700/50 transition-colors">
                  <ChevronRight className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <span className="text-blue-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button
            onClick={startNewGame}
            className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-slate-900 font-black text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce-subtle border-4 border-yellow-600/50"
          >
            <Sparkles className="w-8 h-8 mr-3" />
            COMMENCER LE JEU
            <Sparkles className="w-8 h-8 ml-3" />
          </Button>
        </div>
        
        {/* Footer with easter egg hint */}
        <div className="absolute bottom-4 text-blue-400/50 text-sm">
          Trouvez le secret caché pendant le jeu ! 🔍
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Victory confetti */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10 animate-victory-entrance">
          <Trophy className="w-40 h-40 text-yellow-400 mx-auto mb-8 animate-trophy-glow" />
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-4 drop-shadow-2xl">
            FÉLICITATIONS !
          </h1>
          <p className="text-3xl text-white mb-4 font-semibold">Vous êtes un expert Scrum ! 🏆</p>
          <p className="text-2xl text-green-300 mb-2">Votre gain final :</p>
          <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 mb-10 animate-pulse">
            1 000 000 €
          </p>
          <Button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            REJOUER
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const finalPrize = selectedAnswer === currentQuestion?.correctAnswer 
      ? currentPrize 
      : guaranteedPrize;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 via-rose-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="text-center relative z-10 animate-fade-in-up">
          <div className="text-8xl mb-6">💔</div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
            PARTIE TERMINÉE
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            {selectedAnswer === null ? '⏰ Temps écoulé !' : '❌ Mauvaise réponse !'}
          </p>
          <p className="text-2xl text-white mb-2">Votre gain :</p>
          <p className="text-6xl font-black text-yellow-400 mb-8">
            {finalPrize.toLocaleString('fr-FR')} €
          </p>
          {currentQuestion && selectedAnswer !== null && (
            <div className="bg-blue-900/60 rounded-2xl p-6 mb-8 max-w-xl mx-auto backdrop-blur-sm border border-blue-500/30">
              <p className="text-blue-200 mb-2">La bonne réponse était :</p>
              <p className="text-2xl text-white font-bold">
                {getAnswerLetter(currentQuestion.correctAnswer)}. {currentQuestion.answers[currentQuestion.correctAnswer]}
              </p>
            </div>
          )}
          <Button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all"
          >
            REJOUER
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 via-indigo-950 to-slate-950 p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Easter Egg Message */}
      {showEasterEggMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 animate-spin" />
              <span className="text-2xl font-bold">Easter Egg Activé !</span>
              <Sparkles className="w-8 h-8 animate-spin" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-center mt-2 text-green-100">Temps suspendu ! Regardez la réponse brillante...</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-full bg-blue-800/50 hover:bg-blue-700/50 transition-all hover:scale-110"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
          </button>
          
          {/* Easter Egg - Esprit University Logo */}
          <EspritLogo onClick={handleEasterEgg} isPaused={isTimerPaused} />
        </div>
        
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
          isTimerPaused 
            ? 'bg-green-600/50 border-2 border-green-400' 
            : timeLeft <= 10 
              ? 'bg-red-600/50 border-2 border-red-400 animate-pulse' 
              : 'bg-blue-800/50 border-2 border-blue-400/50'
        }`}>
          {isTimerPaused ? <Pause className="w-6 h-6 text-green-300" /> : <Timer className="w-6 h-6 text-yellow-400" />}
          <span className={`text-2xl font-black ${
            isTimerPaused ? 'text-green-300' : timeLeft <= 10 ? 'text-red-300' : 'text-white'
          }`}>
            {isTimerPaused ? 'PAUSE' : `${timeLeft}s`}
          </span>
        </div>
        
        <button
          onClick={handleQuit}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full text-white font-bold transition-all hover:scale-105 shadow-lg"
        >
          Quitter ({guaranteedPrize.toLocaleString('fr-FR')} €)
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-50 animate-pulse-slow"></div>
            <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 shadow-2xl border border-blue-400/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-300 font-semibold text-lg">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-yellow-400 font-bold text-lg">
                  💰 {currentPrize.toLocaleString('fr-FR')} €
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                {currentQuestion?.question}
              </h2>
            </div>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                onMouseEnter={() => {
                  setHoveredAnswer(index);
                  if (soundEnabled && gameState === 'playing') playSound('hover');
                }}
                onMouseLeave={() => setHoveredAnswer(null)}
                disabled={selectedAnswer !== null || eliminatedAnswers.includes(index)}
                className={`${getAnswerColor(index)} relative rounded-2xl p-5 md:p-6 text-left transition-all duration-500 border-2 shadow-xl overflow-hidden group`}
                style={{
                  borderColor: hoveredAnswer === index && selectedAnswer === null && !eliminatedAnswers.includes(index) 
                    ? '#60A5FA' 
                    : 'rgba(96, 165, 250, 0.3)'
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center gap-4">
                  <span className={`inline-flex w-12 h-12 rounded-xl items-center justify-center text-xl font-black transition-all duration-300 ${
                    answerRevealed && index === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white animate-pulse'
                      : 'bg-blue-950/50 text-yellow-400 group-hover:bg-blue-800/50'
                  }`}>
                    {getAnswerLetter(index)}
                  </span>
                  <span className="text-white font-semibold text-lg md:text-xl">{answer}</span>
                  
                  {/* Checkmark for correct answer */}
                  {answerRevealed && index === currentQuestion.correctAnswer && (
                    <div className="absolute right-4 text-3xl animate-bounce">✅</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Audience Poll */}
          {showAudiencePoll && audienceVotes.length > 0 && (
            <div className="bg-gradient-to-br from-blue-900/70 to-indigo-900/70 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30 animate-slide-up">
              <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-xl">
                <Users className="w-6 h-6 text-yellow-400" />
                Résultats du public
              </h3>
              <div className="space-y-4">
                {audienceVotes.map((votes, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-yellow-400 font-bold text-xl w-10">{getAnswerLetter(index)}</span>
                    <div className="flex-1 bg-blue-800/50 rounded-xl h-10 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${votes}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <span className="text-white font-bold w-16 text-right text-lg">{votes}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Button */}
          {gameState === 'answered' && selectedAnswer === currentQuestion?.correctAnswer && (
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white font-black text-xl py-5 rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all animate-bounce-subtle"
            >
              QUESTION SUIVANTE →
            </Button>
          )}
        </div>

        {/* Sidebar - Lifelines & Prize Ladder */}
        <div className="space-y-6">
          {/* Lifelines */}
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30">
            <h3 className="text-white font-black mb-6 text-center text-xl tracking-wider">JOKERS</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={useFiftyFifty}
                disabled={usedLifelines.includes('fifty-fifty')}
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  usedLifelines.includes('fifty-fifty')
                    ? 'bg-gray-800 opacity-30 grayscale'
                    : 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-400 hover:from-yellow-400 hover:via-yellow-300 hover:to-orange-300 shadow-xl hover:shadow-yellow-500/50 hover:scale-110 hover:-translate-y-1'
                }`}
                title="50/50"
              >
                <span className="text-slate-900 font-black text-2xl">50:50</span>
              </button>
              <button
                onClick={usePhoneFriend}
                disabled={usedLifelines.includes('phone')}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  usedLifelines.includes('phone')
                    ? 'bg-gray-800 opacity-30 grayscale'
                    : 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-400 hover:from-yellow-400 hover:via-yellow-300 hover:to-orange-300 shadow-xl hover:shadow-yellow-500/50 hover:scale-110 hover:-translate-y-1'
                }`}
                title="Appel à un ami"
              >
                <Phone className="w-10 h-10 text-slate-900" />
              </button>
              <button
                onClick={useAskAudience}
                disabled={usedLifelines.includes('audience')}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  usedLifelines.includes('audience')
                    ? 'bg-gray-800 opacity-30 grayscale'
                    : 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-400 hover:from-yellow-400 hover:via-yellow-300 hover:to-orange-300 shadow-xl hover:shadow-yellow-500/50 hover:scale-110 hover:-translate-y-1'
                }`}
                title="Aide du public"
              >
                <Users className="w-10 h-10 text-slate-900" />
              </button>
            </div>
          </div>

          {/* Prize Ladder */}
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-900/50">
            <h3 className="text-white font-black mb-6 text-center text-xl tracking-wider">PALMARÈS</h3>
            <div className="space-y-1">
              {[...prizeLadder].reverse().map((prize, index) => {
                const actualIndex = prizeLadder.length - 1 - index;
                const isCurrent = actualIndex === currentQuestionIndex;
                const isPassed = actualIndex < currentQuestionIndex;
                const isSafeHaven = safeHavens.includes(prize);
                
                return (
                  <div
                    key={prize}
                    className={`px-4 py-3 rounded-xl flex justify-between items-center transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-slate-900 font-black shadow-lg scale-105'
                        : isPassed
                        ? 'bg-green-800/50 text-green-200'
                        : 'bg-blue-800/30 text-blue-200'
                    }`}
                  >
                    <span className="text-sm font-bold">{String(actualIndex + 1).padStart(2, '0')}</span>
                    <span className={`${isSafeHaven && !isCurrent ? 'text-yellow-300 font-bold' : ''}`}>
                      {prize.toLocaleString('fr-FR')} €
                    </span>
                    {isSafeHaven && <span className="text-lg">🔒</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-900 to-indigo-900 border-2 border-blue-400 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirmation</DialogTitle>
            <DialogDescription className="text-blue-200 text-lg">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => confirmAction?.()}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-xl"
            >
              Oui
            </Button>
            <Button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-xl"
            >
              Non
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes title-entrance {
          0% { opacity: 0; transform: translateY(-50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes trophy-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(250, 204, 21, 0.9)); }
        }
        
        @keyframes victory-entrance {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% auto; }
        .animate-title-entrance { animation: title-entrance 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 1s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-confetti-fall { animation: confetti-fall linear forwards; }
        .animate-trophy-glow { animation: trophy-glow 2s ease-in-out infinite; }
        .animate-victory-entrance { animation: victory-entrance 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(30, 58, 138, 0.5); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #3B82F6; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #60A5FA; }
      `}</style>
    </div>
  );
}
