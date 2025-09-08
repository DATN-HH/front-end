'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceWaveAnimation } from './VoiceWaveAnimation';

interface SpeechRecognitionProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
    language?: string;
}

export function SpeechRecognition({
    onTranscript,
    disabled = false,
    language = 'vi-VN', // Default to Vietnamese
}: SpeechRecognitionProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [showAnimation, setShowAnimation] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    // Handle browser compatibility
    useEffect(() => {
        const supported =
            'webkitSpeechRecognition' in window ||
            'SpeechRecognition' in window;
        setIsSupported(supported);

        // Check microphone permissions when component mounts
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => {
                    console.log('Microphone permission granted');
                    setPermissionDenied(false);
                })
                .catch((err) => {
                    console.warn('Microphone permission not yet granted:', err);
                    // Don't set permissionDenied here, wait until user clicks
                });
        }

        // Cleanup on component unmount
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                } catch (e) {
                    console.error('Error stopping speech recognition:', e);
                }
            }
        };
    }, []);

    // Effect to update recognition language when language prop changes
    useEffect(() => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.abort();
                startListening();
            } catch (e) {
                console.error('Error updating speech recognition language:', e);
            }
        }
    }, [language]);

    // Handle speech recognition
    const startListening = useCallback(() => {
        if (!isSupported || disabled) return;

        try {
            // Using our type declaration for SpeechRecognition API
            const SpeechRecognitionAPI =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognitionAPI();

            // Save recognition instance to ref for cleanup
            recognitionRef.current = recognition;

            // Configure recognition
            recognition.lang = language;
            recognition.continuous = true; // Changed to true to keep listening
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            // Set up event handlers
            recognition.onstart = () => {
                setIsListening(true);
                setShowAnimation(true);
                setInterimTranscript('');
                setFinalTranscript('');
                console.log(
                    'Speech recognition started with language:',
                    language
                );
            };

            recognition.onresult = (event: any) => {
                let interim = '';
                let final = '';

                for (let i = 0; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                setInterimTranscript(interim);

                if (final) {
                    setFinalTranscript(final);
                    console.log('Speech recognition final result:', final);
                    onTranscript(final);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);

                // Handle permission errors specially
                if (
                    event.error === 'not-allowed' ||
                    event.error === 'permission-denied'
                ) {
                    console.error('Microphone permission denied');
                    setPermissionDenied(true);
                    setIsListening(false);
                    return;
                }

                // Handle network errors specially
                if (
                    event.error === 'network' ||
                    event.error === 'service-not-allowed'
                ) {
                    console.error(`Speech recognition error: ${event.error}`);
                    setNetworkError(true);
                    setIsListening(false);
                    return;
                }

                // Try to recover from no-speech error by restarting
                if (event.error === 'no-speech') {
                    console.log('No speech detected, continuing to listen...');
                    // Don't set isListening to false, let it continue
                    return;
                }

                // For other errors, stop listening
                setIsListening(false);
                setShowAnimation(false);
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');

                // Reset network error state when recognition ends
                setNetworkError(false);

                // If finalTranscript has content, we successfully got some speech
                if (finalTranscript.trim()) {
                    console.log('Recognition completed with results');
                    setIsListening(false);

                    // Keep showing animation for a moment after recognition ends
                    setTimeout(() => {
                        setShowAnimation(false);
                        setInterimTranscript('');
                    }, 1500);
                } else if (isListening && !permissionDenied && !networkError) {
                    // If speech recognition ended without results and we're still supposed to be listening
                    // and there are no permission or network errors
                    console.log(
                        'Recognition ended unexpectedly, attempting to restart...'
                    );

                    // Reset the recognition instance to avoid issues in some browsers
                    try {
                        recognitionRef.current = null;
                    } catch (e) {
                        console.error(
                            'Error resetting recognition instance:',
                            e
                        );
                    }
                    try {
                        // Brief timeout before restarting to prevent rapid cycles
                        setTimeout(() => {
                            if (isListening) {
                                // Only restart if we're still supposed to be listening
                                try {
                                    // Create a new recognition instance for better cross-browser compatibility
                                    const SpeechRecognitionAPI =
                                        window.SpeechRecognition ||
                                        window.webkitSpeechRecognition;
                                    const newRecognition =
                                        new SpeechRecognitionAPI();

                                    // Copy over all the event handlers and properties
                                    newRecognition.lang = language;
                                    newRecognition.continuous = true;
                                    newRecognition.interimResults = true;
                                    newRecognition.maxAlternatives = 1;
                                    newRecognition.onstart =
                                        recognition.onstart;
                                    newRecognition.onresult =
                                        recognition.onresult;
                                    newRecognition.onerror =
                                        recognition.onerror;
                                    newRecognition.onend = recognition.onend;

                                    // Replace the old reference and start the new instance
                                    recognitionRef.current = newRecognition;
                                    newRecognition.start();
                                } catch (e) {
                                    console.error(
                                        'Failed to restart after timeout:',
                                        e
                                    );
                                    setIsListening(false);
                                    setShowAnimation(false);
                                }
                            }
                        }, 500); // Increased timeout to be safer
                    } catch (e) {
                        console.error(
                            'Failed to restart speech recognition:',
                            e
                        );
                        setIsListening(false);
                        setShowAnimation(false);
                    }
                } else {
                    // Normal ending (e.g., user manually stopped)
                    setIsListening(false);
                    setShowAnimation(false);
                }
            };

            // Start listening
            recognition.start();
        } catch (e) {
            console.error('Error starting speech recognition:', e);
            setIsListening(false);
        }
    }, [isSupported, disabled, language, onTranscript]);

    // Button click handler - ensures we handle any errors
    const handleButtonClick = useCallback(() => {
        console.log('Speech recognition button clicked');
        // If already listening, stop it
        if (isListening) {
            console.log('Stopping speech recognition');
            try {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                }
                setIsListening(false);
                setShowAnimation(false);
            } catch (e) {
                console.error('Error stopping speech recognition:', e);
            }
            return;
        }

        // Reset error states when attempting to listen again
        setPermissionDenied(false);
        setNetworkError(false);

        // Request microphone permission before starting
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => {
                    // Permission granted, start listening
                    try {
                        startListening();
                    } catch (e) {
                        console.error('Error starting speech recognition:', e);
                        setIsListening(false);
                    }
                })
                .catch((err) => {
                    // Permission denied or error occurred
                    console.error('Microphone permission denied:', err);
                    setPermissionDenied(true);
                    setIsListening(false);
                });
        } else {
            // Browser doesn't support getUserMedia, try direct approach
            try {
                startListening();
            } catch (e) {
                console.error('Error in button click handler:', e);
                setIsListening(false);
            }
        }
    }, [isListening, startListening]);

    if (!isSupported) {
        return null; // Don't render anything if not supported
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleButtonClick}
                disabled={disabled}
                className={`transition-all duration-300 ${
                    isListening
                        ? 'text-red-500 animate-pulse ring-2 ring-red-500 ring-opacity-50'
                        : permissionDenied
                          ? 'text-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
                          : networkError
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20'
                            : ''
                }`}
                title={
                    isListening
                        ? 'Stop listening'
                        : permissionDenied
                          ? 'Microphone permission required'
                          : networkError
                            ? 'Network error - try again'
                            : 'Click to speak'
                }
                type="button" // Ensure it doesn't submit forms
            >
                {isListening ? (
                    <Mic className="h-4 w-4 text-red-500" />
                ) : permissionDenied ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                ) : networkError ? (
                    <WifiOff className="h-4 w-4 text-amber-500" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </Button>

            {/* Voice animation popup */}
            {showAnimation && (
                <VoiceWaveAnimation
                    isListening={isListening}
                    finalTranscript={finalTranscript}
                    interimTranscript={interimTranscript}
                    onRequestStop={handleButtonClick}
                />
            )}
        </>
    );
}
