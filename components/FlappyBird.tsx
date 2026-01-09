
import React, { useEffect, useRef, useState, useCallback } from 'react';

const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state held in refs to avoid re-renders during animation
  const gameState = useRef({
    birdY: 200,
    birdVelocity: 0,
    pipes: [] as { x: number; gapTop: number; width: number; passed: boolean }[],
    frameCount: 0
  });

  const BIRD_SIZE = 24;
  const GRAVITY = 0.3;
  const JUMP = -6;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 160;
  const PIPE_SPEED = 2.5;

  const resetGame = useCallback(() => {
    gameState.current = {
      birdY: 200,
      birdVelocity: 0,
      pipes: [],
      frameCount: 0
    };
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  }, []);

  const flap = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    gameState.current.birdVelocity = JUMP;
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
        ctx.fillText('Tap to Flap', canvas.width / 2, canvas.height / 2);
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px Inter';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 50);
        return;
      }

      // Physics
      gameState.current.birdVelocity += GRAVITY;
      gameState.current.birdY += gameState.current.birdVelocity;

      // Pipe Management
      if (gameState.current.frameCount % 90 === 0) {
        const gapTop = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
        gameState.current.pipes.push({ x: canvas.width, gapTop, width: PIPE_WIDTH, passed: false });
      }

      gameState.current.pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
      });

      gameState.current.pipes = gameState.current.pipes.filter(pipe => pipe.x + pipe.width > 0);

      // Collisions
      if (gameState.current.birdY + BIRD_SIZE > canvas.height || gameState.current.birdY < 0) {
        setGameOver(true);
      }

      gameState.current.pipes.forEach(pipe => {
        const bx = 50;
        const by = gameState.current.birdY;
        if (bx + BIRD_SIZE > pipe.x && bx < pipe.x + pipe.width) {
          if (by < pipe.gapTop || by + BIRD_SIZE > pipe.gapTop + PIPE_GAP) {
            setGameOver(true);
          }
        }
        if (!pipe.passed && pipe.x + pipe.width < bx) {
          pipe.passed = true;
          setScore(s => s + 1);
        }
      });

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Pipes
      ctx.fillStyle = '#10b981';
      gameState.current.pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
        ctx.fillRect(pipe.x, pipe.gapTop + PIPE_GAP, pipe.width, canvas.height);
      });

      // Draw Bird
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(50 + BIRD_SIZE / 2, gameState.current.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw Score
      ctx.fillStyle = '#f8fafc';
      ctx.font = '24px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 40);

      gameState.current.frameCount++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, gameOver, score]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-900 cursor-pointer touch-none" onPointerDown={flap}>
      <canvas ref={canvasRef} width={400} height={500} className="w-full h-full" />
    </div>
  );
};

export default FlappyBird;
