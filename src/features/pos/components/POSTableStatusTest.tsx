'use client';

import {
    usePOSTableStatus,
    usePOSTableOccupancy,
} from '@/api/v1/pos-table-status';

export function POSTableStatusTest({ floorId }: { floorId: number }) {
    const {
        data: statusData,
        isLoading: statusLoading,
        error: statusError,
    } = usePOSTableStatus(floorId);
    const {
        data: occupancyData,
        isLoading: occupancyLoading,
        error: occupancyError,
    } = usePOSTableOccupancy(floorId);

    if (statusLoading || occupancyLoading) {
        return <div>Loading...</div>;
    }

    if (statusError || occupancyError) {
        return (
            <div className="p-4 bg-red-100 border border-red-300 rounded">
                <h3 className="font-bold text-red-800">API Error:</h3>
                <p className="text-red-700">
                    Status Error: {statusError?.message || 'None'}
                </p>
                <p className="text-red-700">
                    Occupancy Error: {occupancyError?.message || 'None'}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="bg-blue-100 border border-blue-300 rounded p-3">
                <h3 className="font-bold text-blue-800">
                    Table Status API Response:
                </h3>
                <pre className="text-xs text-blue-700 mt-2 overflow-auto">
                    {JSON.stringify(statusData, null, 2)}
                </pre>
            </div>

            <div className="bg-green-100 border border-green-300 rounded p-3">
                <h3 className="font-bold text-green-800">
                    Occupancy API Response:
                </h3>
                <pre className="text-xs text-green-700 mt-2 overflow-auto">
                    {JSON.stringify(occupancyData, null, 2)}
                </pre>
            </div>

            {statusData?.payload && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                    <h3 className="font-bold text-yellow-800">
                        Table Status Summary:
                    </h3>
                    <p className="text-yellow-700">
                        Total Tables: {statusData.payload.totalTables}
                    </p>
                    <p className="text-yellow-700">
                        Available: {statusData.payload.availableTablesCount}
                    </p>
                    <p className="text-yellow-700">
                        Occupied: {statusData.payload.occupiedTablesCount}
                    </p>
                    <p className="text-yellow-700">
                        Availability:{' '}
                        {statusData.payload.availabilityPercentage}%
                    </p>
                </div>
            )}

            {occupancyData?.payload?.tables && (
                <div className="bg-purple-100 border border-purple-300 rounded p-3">
                    <h3 className="font-bold text-purple-800">
                        Occupied Tables:
                    </h3>
                    {occupancyData.payload.tables
                        .filter((table) => table.occupancyDetails)
                        .map((table) => (
                            <div
                                key={table.tableId}
                                className="text-purple-700 text-sm"
                            >
                                {table.tableName}: {table.currentStatus}
                                {table.occupancyDetails && (
                                    <span className="ml-2">
                                        ({table.occupancyDetails.occupationType}
                                        )
                                    </span>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
