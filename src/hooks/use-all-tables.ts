import { useEffect, useState } from 'react';

import { useFloorsByBranch } from '@/api/v1/floors';
import { useTablesByFloor } from '@/api/v1/tables';

export interface Table {
    id: number;
    name: string;
    status: string;
    floorName?: string;
    floorId?: number;
}

export function useAllTables(branchId: number) {
    const [allTables, setAllTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get floors for the branch
    const { data: floors = [], isLoading: floorsLoading } =
        useFloorsByBranch(branchId);

    // Create hooks for each floor (up to a reasonable limit)
    // This is a workaround for the rules of hooks
    const floor1Query = useTablesByFloor(floors[0]?.id || 0);
    const floor2Query = useTablesByFloor(floors[1]?.id || 0);
    const floor3Query = useTablesByFloor(floors[2]?.id || 0);
    const floor4Query = useTablesByFloor(floors[3]?.id || 0);
    const floor5Query = useTablesByFloor(floors[4]?.id || 0);

    useEffect(() => {
        if (floorsLoading) {
            setIsLoading(true);
            return;
        }

        // Map floors to their corresponding queries
        const floorQueries = [
            { floor: floors[0], query: floor1Query },
            { floor: floors[1], query: floor2Query },
            { floor: floors[2], query: floor3Query },
            { floor: floors[3], query: floor4Query },
            { floor: floors[4], query: floor5Query },
        ].filter(({ floor }) => floor); // Remove undefined floors

        // Check if all queries are loaded
        const allQueriesLoaded = floorQueries.every(
            ({ query }) => !query.isLoading
        );

        if (allQueriesLoaded) {
            const combinedTables: Table[] = [];

            floorQueries.forEach(({ floor, query }) => {
                if (query.data?.tables) {
                    const floorTables = query.data.tables.map((table) => ({
                        id: table.id,
                        name: table.tableName,
                        status: table.status || 'AVAILABLE',
                        floorName: floor.name,
                        floorId: floor.id,
                    }));
                    combinedTables.push(...floorTables);
                }
            });

            setAllTables(combinedTables);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [
        floors,
        floorsLoading,
        floor1Query.data,
        floor1Query.isLoading,
        floor2Query.data,
        floor2Query.isLoading,
        floor3Query.data,
        floor3Query.isLoading,
        floor4Query.data,
        floor4Query.isLoading,
        floor5Query.data,
        floor5Query.isLoading,
    ]);

    return {
        tables: allTables,
        isLoading,
        floors,
    };
}
