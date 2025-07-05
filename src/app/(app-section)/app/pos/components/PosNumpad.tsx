'use client';

import { Button } from '@/components/ui/button';
import { Delete, Check } from 'lucide-react';

interface PosNumpadProps {
    onNumberClick: (number: string) => void;
    onClear: () => void;
    onEnter?: () => void;
    disabled?: boolean;
    showEnter?: boolean;
}

export default function PosNumpad({
    onNumberClick,
    onClear,
    onEnter,
    disabled = false,
    showEnter = true,
}: PosNumpadProps) {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    return (
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {/* Numbers 1-9 */}
            {numbers.slice(0, 9).map((number) => (
                <Button
                    key={number}
                    variant="outline"
                    className="h-12 text-lg font-medium hover:bg-gray-50 border-gray-300 transition-colors duration-150"
                    onClick={() => onNumberClick(number)}
                    disabled={disabled}
                >
                    {number}
                </Button>
            ))}

            {/* Bottom row: Clear, 0, Enter */}
            <Button
                variant="outline"
                className="h-12 text-red-500 hover:bg-red-50 border-red-200 transition-colors duration-150"
                onClick={onClear}
                disabled={disabled}
            >
                <Delete className="h-5 w-5" />
            </Button>

            <Button
                variant="outline"
                className="h-12 text-lg font-medium hover:bg-gray-50 border-gray-300 transition-colors duration-150"
                onClick={() => onNumberClick('0')}
                disabled={disabled}
            >
                0
            </Button>

            {showEnter && (
                <Button
                    className="h-12 bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-150"
                    onClick={onEnter}
                    disabled={disabled || !onEnter}
                >
                    <Check className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}