'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface FeedbackAnalyticsProps {
    branches: Array<{ id: number; name: string }>;
    filters: any;
    onFiltersChange: (filters: any) => void;
}

export function FeedbackAnalytics({
    branches,
    filters,
    onFiltersChange,
}: FeedbackAnalyticsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Feedback Analytics
                </CardTitle>
                <CardDescription>
                    Detailed analytics and insights from customer feedback
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                        Analytics Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                        Advanced analytics features including rating trends,
                        sentiment analysis, and performance metrics will be
                        available in the next update.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

