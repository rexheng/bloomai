'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BloomCharacterProps {
  mood?: 'happy' | 'curious' | 'encouraging' | 'sleepy';
  isGreeting?: boolean;
  onTap: () => void;
  speechBubble?: string;
  size?: 'sm' | 'md' | 'lg';
  /** When true, avatar is displayed within the room context */
  isInRoom?: boolean;
  /** When true, conversation is active */
  isActive?: boolean;
}

const moodEmojis = {
  happy: '✨',
  curious: '🤔',
  encouraging: '💪',
  sleepy: '😴',
};

const greetings = [
  "Hi there! Ready to reflect?",
  "Welcome back! How's your day?",
  "Hey! I've been waiting for you 🌱",
  "Let's grow together today!",
];

export function BloomCharacter({ 
  mood = 'happy', 
  isGreeting = true,
  onTap, 
  speechBubble,
  size = 'lg',
  isInRoom = false,
  isActive = false,
}: BloomCharacterProps) {
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (isGreeting) {
      // Pick a random greeting on mount
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      setCurrentGreeting(randomGreeting);
    }
  }, [isGreeting]);

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);
    onTap();
  };

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56 md:w-64 md:h-64',
  };

  // In room mode with active conversation, don't show greeting bubble (conversation overlay handles messages)
  const displayMessage = isInRoom && isActive ? undefined : (speechBubble || currentGreeting);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Speech Bubble */}
      {displayMessage && (
        <div className="relative animate-speech-bubble">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-sage-200 max-w-xs text-center">
            <p className="text-sage-800 text-sm md:text-base font-medium">
              {displayMessage}
            </p>
            {mood && (
              <span className="absolute -top-2 -right-2 text-lg">
                {moodEmojis[mood]}
              </span>
            )}
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-r border-b border-sage-200 rotate-45" />
        </div>
      )}

      {/* Character */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-sage-400/50 rounded-full",
          sizeClasses[size],
          isHovered && "scale-105",
          isBouncing && "animate-bounce-once"
        )}
        aria-label="Chat with Bloom"
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-sage-300/30 blur-xl transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-50"
        )} />
        
        {/* Character image */}
        <div className="relative w-full h-full animate-bloom-idle">
          <Image
            src="/bloom-avatar.svg"
            alt="Bloom - Your AI Companion"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Tap indicator */}
        <div className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-sage-500 transition-opacity",
          isHovered ? "opacity-100" : "opacity-60"
        )}>
          <span className="animate-pulse">tap to chat</span>
        </div>
      </button>
    </div>
  );
}
