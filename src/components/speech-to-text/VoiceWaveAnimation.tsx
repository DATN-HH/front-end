'use client';

import React, {
    useState,
    useEffect,
    useRef,
    MouseEvent as ReactMouseEvent,
} from 'react';

interface VoiceWaveAnimationProps {
    isListening: boolean;
    finalTranscript?: string;
    interimTranscript?: string;
    onRequestStop?: () => void;
}

export function VoiceWaveAnimation({
    isListening,
    finalTranscript = '',
    interimTranscript = '',
    onRequestStop,
}: VoiceWaveAnimationProps) {
    const [animationState, setAnimationState] = useState<
        'idle' | 'active' | 'finish'
    >('idle');
    const [ripples, setRipples] = useState<
        Array<{ id: number; x: number; y: number }>
    >([]);
    const modalRef = useRef<HTMLDivElement>(null);
    const nextRippleId = useRef<number>(0);

    // Handle clicks outside or inside the popup
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                // Click was outside the modal, dismiss it and stop recording if we're in active state
                if (animationState === 'active') {
                    setAnimationState('idle');
                    // Notify parent component to stop recording
                    if (onRequestStop) {
                        onRequestStop();
                    }
                }
            }
        }

        // Add event listener only when animation is active
        if (animationState !== 'idle') {
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [animationState, onRequestStop]);

    // Handle clicks directly on the modal with ripple effect
    const handleModalClick = (e: ReactMouseEvent<HTMLDivElement>) => {
        // Add ripple effect
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create new ripple
            const newRipple = {
                id: nextRippleId.current,
                x,
                y,
            };
            nextRippleId.current += 1;

            // Add new ripple to state
            setRipples((ripples) => [...ripples, newRipple]);

            // Remove ripple after animation completes
            setTimeout(() => {
                setRipples((ripples) =>
                    ripples.filter((r) => r.id !== newRipple.id)
                );
            }, 800); // Match the animation duration
        }

        // Handle stop request
        if (isListening && onRequestStop) {
            onRequestStop();
        }
    };

    // Handle animation state changes based on listening state and transcript
    useEffect(() => {
        if (isListening) {
            setAnimationState('active');
        } else if (finalTranscript) {
            setAnimationState('finish');
            // Reset to idle after showing the result for a moment
            const timer = setTimeout(() => {
                setAnimationState('idle');
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            // Small delay before hiding when stopping without transcript
            const timer = setTimeout(() => {
                setAnimationState('idle');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isListening, finalTranscript]);

    if (animationState === 'idle') {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
            <div
                ref={modalRef}
                className="bg-orange-500 dark:bg-orange-600 rounded-lg p-4 shadow-xl w-[300px] h-[200px] mx-auto animate-fade-in cursor-pointer flex items-center justify-center overflow-hidden relative"
                onClick={handleModalClick}
                role="dialog"
                aria-label="Speech Recognition Dialog"
            >
                {/* Render ripple elements */}
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full bg-white bg-opacity-30 animate-ripple pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: '10px',
                            height: '10px',
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                ))}

                <div className="flex flex-col items-center">
                    {/* Voice wave animation */}
                    <div className="flex items-center justify-center h-full w-full">
                        {animationState === 'active' ? (
                            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 sm:w-2.5 md:w-3 bg-white rounded-full animate-sound-wave"
                                        style={{
                                            height: `${Math.random() * 40 + 20}px`,
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    ></div>
                                ))}
                                <div className="w-2 sm:w-2.5 md:w-3 bg-white rounded-full h-16 sm:h-16 md:h-20 animate-sound-wave"></div>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i + 8}
                                        className="w-2 sm:w-2.5 md:w-3 bg-white rounded-full animate-sound-wave"
                                        style={{
                                            height: `${Math.random() * 40 + 20}px`,
                                            animationDelay: `${(i + 8) * 0.1}s`,
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-2xl text-green-500">✓</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
