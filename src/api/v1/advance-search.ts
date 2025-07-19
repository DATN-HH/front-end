import { useQuery } from '@tanstack/react-query';
import { advanceSearch } from '@/features/system/api/api-advance-search';

export const useAdvanceSearch = (tableName: string) => {
  return useQuery({
    queryKey: ['advance-search', tableName],
    queryFn: () => advanceSearch(tableName),
  });
}; 