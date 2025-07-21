'use client';

import { FloorResponse } from '@/api/v1/floors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { FloorCard } from './FloorCard';

interface FloorGridProps {
  floors: FloorResponse[];
  isLoading: boolean;
  onEdit: (floor: FloorResponse) => void;
  onDelete: (floor: FloorResponse) => void;
  onViewImage: (floor: FloorResponse) => void;
}

// Loading skeleton for floor card
const FloorCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left side - Image skeleton */}
        <div className="w-full lg:w-1/2 h-64 lg:h-80 bg-gray-100">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Right side - Info skeleton */}
        <div className="w-full lg:w-1/2 p-6 space-y-4">
          <div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function FloorGrid({
  floors,
  isLoading,
  onEdit,
  onDelete,
  onViewImage,
}: FloorGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <FloorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Floors</CardTitle>
          <CardDescription>{floors.length} floor(s) found</CardDescription>
        </CardHeader>
      </Card>

      {floors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-16h6m2 16V7a2 2 0 00-2-2H9a2 2 0 00-2 2v14m0 0h6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No floors found
            </h3>
            <p className="text-gray-500 max-w-sm">
              There are no floors in this branch yet. Click "Add Floor" to
              create your first floor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {floors.map((floor) => (
            <FloorCard
              key={floor.id}
              floor={floor}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewImage={onViewImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
