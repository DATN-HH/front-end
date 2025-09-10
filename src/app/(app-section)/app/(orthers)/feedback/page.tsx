'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

import { PageTitle } from '@/components/layouts/app-section/page-title';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ManagerFeedbackDashboard } from '@/features/feedback/components/ManagerFeedbackDashboard';
import { FeedbackResponseDto, managerFeedbackAPI } from '@/api/v1/feedback';
import { useBranches } from '@/api/v1/branches';
import { useAllProducts } from '@/api/v1/menu/products';

export default function FeedbackPage() {
    const [feedbackData, setFeedbackData] = useState<FeedbackResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch branches using API
    const {
        data: branchesData,
        isLoading: branchesLoading,
        error: branchesError,
    } = useBranches({
        page: 0,
        size: 1000,
        sortBy: 'name',
        status: 'ACTIVE',
    });

    // Fetch products using API
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError,
    } = useAllProducts();

    // Fetch feedback data
    useEffect(() => {
        const loadFeedback = async () => {
            setLoading(true);
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 100, // Get all feedback for now
                });
                setFeedbackData(response.data);
            } catch (error) {
                console.error('Failed to load feedback:', error);
                setFeedbackData([]); // Empty array on error
            } finally {
                setLoading(false);
            }
        };

        loadFeedback();
    }, []);

    // Transform branches data to the format expected by the component
    const branches =
        branchesData?.map((branch) => ({
            id: branch.id,
            name: branch.name,
        })) || [];

    // Transform products data to the format expected by the component
    const products =
        productsData?.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
        })) || [];

    // Calculate stats
    const stats = {
        total: feedbackData.length,
        pending: feedbackData.filter((f) => f.feedbackStatus === 'PENDING')
            .length,
        responded: feedbackData.filter((f) => f.feedbackStatus === 'RESPONDED')
            .length,
        avgRating:
            feedbackData.length > 0
                ? feedbackData.reduce((sum, f) => sum + f.overallRating, 0) /
                  feedbackData.length
                : 0,
    };

    if (loading || branchesLoading || productsLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-32 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (branchesError || productsError) {
        return (
            <div className="space-y-6">
                <PageTitle icon={MessageSquare} title="Feedback Management" />
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Failed to load data
                    </h3>
                    <p className="text-gray-500 mb-4">
                        There was an error loading the required data. Please try
                        again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle icon={MessageSquare} title="Feedback Management" />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Feedback
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All customer feedback
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Reply
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats.pending}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting response
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Responded
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.responded}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Successfully replied
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Rating
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.avgRating.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of 5.0 stars
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/app/feedback/analytics">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto text-blue-500" />
                            <CardTitle className="text-lg">
                                Feedback Analytics
                            </CardTitle>
                            <CardDescription>
                                View detailed analytics and trends
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/app/feedback/reports">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <BarChart3 className="h-8 w-8 mx-auto text-green-500" />
                            <CardTitle className="text-lg">
                                Feedback Reports
                            </CardTitle>
                            <CardDescription>
                                Generate comprehensive reports
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader className="text-center">
                        <MessageSquare className="h-8 w-8 mx-auto text-purple-500" />
                        <CardTitle className="text-lg">
                            Customer Reviews
                        </CardTitle>
                        <CardDescription>
                            Public customer review page
                        </CardDescription>
                        <div className="pt-2">
                            <Link
                                href="/feedback"
                                target="_blank"
                                className="text-sm text-purple-600 hover:text-purple-800 underline"
                            >
                                View Public Page →
                            </Link>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Dashboard */}
            <ManagerFeedbackDashboard
                branches={branches}
                products={products}
                feedbackData={feedbackData}
                onFeedbackUpdate={setFeedbackData}
            />
        </div>
    );
}
