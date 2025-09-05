'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';

interface FeedbackFiltersProps {
  branches: Array<{ id: number; name: string }>;
  filters: {
    branchId?: number;
    status: string;
    feedbackType: string;
    minRating?: number;
    maxRating?: number;
    startDate: string;
    endDate: string;
    search: string;
  };
  onFiltersChange: (filters: Partial<FeedbackFiltersProps['filters']>) => void;
}

export function FeedbackFilters({ branches, filters, onFiltersChange }: FeedbackFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      branchId: undefined,
      status: '',
      feedbackType: '',
      minRating: undefined,
      maxRating: undefined,
      startDate: '',
      endDate: '',
      search: '',
    });
  };

  const hasActiveFilters = 
    filters.branchId || 
    filters.status || 
    filters.feedbackType || 
    filters.minRating || 
    filters.maxRating || 
    filters.startDate || 
    filters.endDate || 
    filters.search;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Branch Filter */}
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select
              value={filters.branchId?.toString() || ''}
              onValueChange={(value) => 
                onFiltersChange({ branchId: value ? parseInt(value) : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="RESPONDED">Responded</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Type Filter */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.feedbackType}
              onValueChange={(value) => onFiltersChange({ feedbackType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                <SelectItem value="PRODUCT">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating Range */}
          <div className="space-y-2">
            <Label>Min Rating</Label>
            <Select
              value={filters.minRating?.toString() || ''}
              onValueChange={(value) => 
                onFiltersChange({ minRating: value ? parseInt(value) : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1⭐</SelectItem>
                <SelectItem value="2">2⭐</SelectItem>
                <SelectItem value="3">3⭐</SelectItem>
                <SelectItem value="4">4⭐</SelectItem>
                <SelectItem value="5">5⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Rating</Label>
            <Select
              value={filters.maxRating?.toString() || ''}
              onValueChange={(value) => 
                onFiltersChange({ maxRating: value ? parseInt(value) : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1⭐</SelectItem>
                <SelectItem value="2">2⭐</SelectItem>
                <SelectItem value="3">3⭐</SelectItem>
                <SelectItem value="4">4⭐</SelectItem>
                <SelectItem value="5">5⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFiltersChange({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({ endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFiltersChange({ search: '' })}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.branchId && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                  Branch: {branches.find(b => b.id === filters.branchId)?.name}
                  <button
                    onClick={() => onFiltersChange({ branchId: undefined })}
                    className="ml-1 hover:text-green-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.status && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                  Status: {filters.status}
                  <button
                    onClick={() => onFiltersChange({ status: '' })}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.feedbackType && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                  Type: {filters.feedbackType}
                  <button
                    onClick={() => onFiltersChange({ feedbackType: '' })}
                    className="ml-1 hover:text-orange-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {(filters.minRating || filters.maxRating) && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm">
                  Rating: {filters.minRating || 1}⭐ - {filters.maxRating || 5}⭐
                  <button
                    onClick={() => onFiltersChange({ minRating: undefined, maxRating: undefined })}
                    className="ml-1 hover:text-yellow-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {(filters.startDate || filters.endDate) && (
                <div className="flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm">
                  Date: {filters.startDate || 'Start'} - {filters.endDate || 'End'}
                  <button
                    onClick={() => onFiltersChange({ startDate: '', endDate: '' })}
                    className="ml-1 hover:text-indigo-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
