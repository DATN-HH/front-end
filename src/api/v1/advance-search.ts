import { useQuery } from '@tanstack/react-query';

import { FilterDefinition } from '@/components/common/Table/types';
import { OperandType } from '@/lib/response-object';
import apiClient from '@/services/api-client';

const advanceSearch = async (
    tableName: string
): Promise<FilterDefinition[]> => {
    const response = await apiClient.get('/advance-search', {
        params: {
            tableName,
        },
    });
    const payload = response.data.payload;
    return payload.map((item: any) => ({
        field: item.columnName,
        label: item.label,
        type: item.operandType as OperandType,
    }));
};

export const useAdvanceSearch = (tableName: string) => {
    return useQuery({
        queryKey: ['advance-search', tableName],
        queryFn: () => advanceSearch(tableName),
    });
};
