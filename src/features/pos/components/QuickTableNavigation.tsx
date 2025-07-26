'use client';

import { useState } from 'react';
import { Search, Hash, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useTablesByFloor, type TableResponse } from '@/api/v1/tables';

interface QuickTableNavigationProps {
    onTableNavigate: (tableId: number) => void;
    onClose?: () => void;
    selectedFloorId?: number | null;
}

export function QuickTableNavigation({ onTableNavigate, onClose, selectedFloorId }: QuickTableNavigationProps) {
    const [tableInput, setTableInput] = useState('');
    const [error, setError] = useState('');

    // Fetch tables for the selected floor to validate table existence
    const { data: floorData } = useTablesByFloor(selectedFloorId || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const input = tableInput.trim();

        if (!input) {
            setError('Please enter a table number');
            return;
        }

        // Try to find table by number or ID
        let foundTable: TableResponse | undefined;

        if (floorData?.tables) {
            // First try to find by table name (string match)
            foundTable = floorData.tables.find(table =>
                table.tableName?.toString() === input
            );

            // If not found by table number, try by ID
            if (!foundTable) {
                const tableId = parseInt(input);
                if (!isNaN(tableId) && tableId > 0) {
                    foundTable = floorData.tables.find(table => table.id === tableId);
                }
            }
        }

        if (!foundTable) {
            setError(`Table "${input}" not found on this floor`);
            return;
        }

        setError('');
        onTableNavigate(foundTable.id);
        setTableInput('');
        onClose?.();
    };

    const handleInputChange = (value: string) => {
        setTableInput(value);
        if (error) setError('');
    };

    return (
        <Card className="p-4 bg-white border border-gray-200 shadow-lg">
            <div className="flex items-center mb-3">
                <Hash className="w-4 h-4 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Quick Table Navigation</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Enter table name or ID..."
                            value={tableInput}
                            onChange={(e) => handleInputChange(e.target.value)}
                            className={`pl-10 ${error ? 'border-red-300 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                    </div>
                    {error && (
                        <div className="flex items-center mt-1 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {error}
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        type="submit" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        disabled={!tableInput.trim()}
                    >
                        Go to Table
                    </Button>
                    {onClose && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    Enter a table name or ID to quickly navigate to that table's order
                </p>
                {floorData?.tables && floorData.tables.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                        Available tables: {floorData.tables.map(t => t.tableName || t.id).join(', ')}
                    </p>
                )}
            </div>
        </Card>
    );
}
