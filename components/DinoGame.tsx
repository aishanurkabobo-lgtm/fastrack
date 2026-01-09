
import React, { useEffect, useRef, useState, useCallback } from 'react';

const DinoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gameState = useRef({
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    cacti: [] as { x: number; width: number; height: number }[],
    frameCount: 0
  });

  const DINO_WIDTH = 30;
  const DINO_HEIGHT = 45;
  const GRAVITY = 0.4; // Low gravity for long jump distance
  const JUMP_FORCE = -11.5; // Strong jump force for high/far arc
  const GROUND_Y = 350;
  const SPEED = 3.8; // Slower speed for easier gameplay

  const resetGame = useCallback(() => {
    gameState.current = {
      dinoY: GROUND_Y - DINO_HEIGHT,
      dinoVelocity: 0,
      isJumping: false,
      cacti: [],
      frameCount: 0
    };
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameState.current.isJumping) {
      gameState.current.dinoVelocity = JUMP_FORCE;
      gameState.current.isJumping = true;
    }
  }, [gameOver, gameStarted, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (!gameStarted && !gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '20px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Tap to Jump', canvas.width / 2, canvas.height / 2);
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px Inter';
        ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Tap to Try Again', canvas.width / 2, canvas.height / 2 + 50);
        return;
      }

      // Physics
      gameState.current.dinoVelocity += GRAVITY;
      gameState.current.dinoY += gameState.current.dinoVelocity;

      if (gameState.current.dinoY >= GROUND_Y - DINO_HEIGHT) {
        gameState.current.dinoY = GROUND_Y - DINO_HEIGHT;
        gameState.current.dinoVelocity = 0;
        gameState.current.isJumping = false;
      }

      // Obstacle Management
      // Increased frame gap: now between 180 and 280 frames (approx 2.5 - 4 seconds apart)
      if (gameState.current.frameCount > 150 && gameState.current.frameCount % (Math.floor(Math.random() * 100) + 180) === 0) {
        gameState.current.cacti.push({
          x: canvas.width,
          width: 20 + Math.random() * 20,
          height: 30 + Math.random() * 30
        });
      }

      gameState.current.cacti.forEach(c => c.x -= SPEED);
      gameState.current.cacti = gameState.current.cacti.filter(c => c.x + c.width > 0);

      // Collisions
      const dx = 50;
      const dy = gameState.current.dinoY;
      gameState.current.cacti.forEach(c => {
        if (dx < c.x + c.width && dx + DINO_WIDTH > c.x && dy + DINO_HEIGHT > GROUND_Y - c.height) {
          setGameOver(true);
        }
      });

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(canvas.width, GROUND_Y);
      ctx.stroke();

      // Dino
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(dx, dy, DINO_WIDTH, DINO_HEIGHT);

      // Cacti
      ctx.fillStyle = '#f87171';
      gameState.current.cacti.forEach(c => {
        ctx.fillRect(c.x, GROUND_Y - c.height, c.width, c.height);
      });

      // Score
      setScore(s => s + 0.08);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '20px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(score)}`, canvas.width - 20, 40);

      gameState.current.frameCount++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, gameOver, score]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-900 cursor-pointer touch-none" onPointerDown={jump}>
      <canvas ref={canvasRef} width={600} height={400} className="w-full h-full" />
    </div>
  );
};

export default DinoGame;
