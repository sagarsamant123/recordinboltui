import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AudioWaveformProps {
  audioBuffer: AudioBuffer;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  height?: number;
  barWidth?: number;
  barGap?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioBuffer,
  currentTime,
  duration,
  onSeek,
  className = '',
  height = 80,
  barWidth = 2,
  barGap = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  // Generate waveform data from audio buffer
  useEffect(() => {
    if (!audioBuffer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const samples = Math.floor(width / (barWidth + barGap));
    const blockSize = Math.floor(audioBuffer.length / samples);
    const channelData = audioBuffer.getChannelData(0);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = blockSize * i;
      let sum = 0;
      let max = 0;

      for (let j = 0; j < blockSize; j++) {
        const sample = Math.abs(channelData[start + j] || 0);
        sum += sample;
        max = Math.max(max, sample);
      }

      // Use RMS for smoother waveform
      const rms = Math.sqrt(sum / blockSize);
      waveform.push(rms);
    }

    setWaveformData(waveform);
  }, [audioBuffer, barWidth, barGap]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    ctx.clearRect(0, 0, width, canvasHeight);

    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * width;
    const hoverX = isHovering ? (hoverTime / duration) * width : -1;

    waveformData.forEach((amplitude, index) => {
      const x = index * (barWidth + barGap);
      const barHeight = Math.max(2, amplitude * canvasHeight * 0.8);
      const y = (canvasHeight - barHeight) / 2;

      // Determine bar color
      let color = '#E5E7EB'; // Default gray
      if (x < progressX) {
        color = '#B8FF4F'; // Played portion - green
      } else if (isHovering && Math.abs(x - hoverX) < barWidth + barGap) {
        color = '#A3E844'; // Hover color
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [waveformData, currentTime, duration, isHovering, hoverTime, barWidth, barGap]);

  // Redraw when dependencies change
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = rect.width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }
      
      drawWaveform();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [height, drawWaveform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    setHoverTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    onSeek(Math.max(0, Math.min(time, duration)));
  }, [duration, onSeek]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full cursor-pointer rounded-lg"
        style={{ height: `${height}px` }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        aria-label="Audio waveform - click to seek"
      />
      
      {/* Hover time tooltip */}
      {isHovering && (
        <div 
          className="absolute -top-8 lg:-top-10 bg-black text-white px-2 py-1 rounded text-xs lg:text-sm pointer-events-none transform -translate-x-1/2 shadow-lg"
          style={{ 
            left: `${(hoverTime / duration) * 100}%`,
            opacity: duration > 0 ? 1 : 0
          }}
        >
          {Math.floor(hoverTime / 60)}:{Math.floor(hoverTime % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
};