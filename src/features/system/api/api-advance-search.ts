import { FilterDefinition } from '@/components/common/Table/types';
import { OperandType } from '@/lib/response-object';
import apiClient from '@/services/api-client';

export async function advanceSearch(
    tableName: string
): Promise<FilterDefinition[]> {
    const response = await apiClient.get('/advance-search', {
        params: {
            tableName,
        },
    });
    const payload = response.data.payload;
    console.log('advanceSearch: ', payload);
    return payload.map((item: any) => ({
        field: item.columnName,
        label: item.label,
        type: item.operandType as OperandType,
    }));
}
