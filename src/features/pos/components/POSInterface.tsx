'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { POSRegisterView } from './POSRegisterView';
// Define Table interface locally since we need a simpler version
interface Table {
    id: number;
    name: string;
    status: string;
}

export function POSInterface() {
    const router = useRouter();
    const [selectedTables, setSelectedTables] = useState<Table[]>([]);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [isRegisterView, setIsRegisterView] = useState(false);

    const handleTableSelect = (tableId: number, tableName?: string) => {
        // Create a table object from the tableId with proper name
        const table: Table = {
            id: tableId,
            name: tableName || `Table ${tableId}`,
            status: 'OCCUPIED',
        };
        setSelectedTables([table]);
        setEditingOrderId(null);
        setIsRegisterView(true);
    };

    const handleOrderCreated = (orderId: number) => {
        setEditingOrderId(orderId);
    };

    if (isRegisterView) {
        return (
            <POSRegisterView
                selectedTables={selectedTables}
                setSelectedTables={setSelectedTables}
                onOrderCreated={handleOrderCreated}
                editingOrderId={editingOrderId}
                setEditingOrderId={setEditingOrderId}
            />
        );
    }

    // For now, return a simple message since POSTablesView needs more props
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">POS Tables View</h2>
                <p className="text-gray-600 mb-4">
                    Table selection feature is being implemented
                </p>
                <button
                    onClick={() => setIsRegisterView(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Register
                </button>
            </div>
        </div>
    );
}
