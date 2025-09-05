'use client';

import React from 'react';
import { RestaurantFeedbackForm } from '@/features/feedback/components/RestaurantFeedbackForm';
import { useBranches } from '@/api/v1/branches';

export default function RestaurantFeedbackPage() {
  const { data: branchData, isLoading } = useBranches();
  
  const branches = branchData?.map(branch => ({ id: branch.id, name: branch.name })) || [
    // Fallback mock data
    { id: 1, name: 'Branch 1' },
    { id: 2, name: 'Branch 2' },
    { id: 3, name: 'Branch 3' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Share Your Restaurant Experience</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We value your feedback! Tell us about your overall dining experience at Menu+. 
          Your insights help us improve our service and create better experiences for all our guests.
        </p>
      </div>

      <RestaurantFeedbackForm
        branches={branches}
        onSuccess={() => {
          // Redirect to thank you page or show success message
          window.location.href = '/feedback/thank-you';
        }}
      />
    </div>
  );
}
