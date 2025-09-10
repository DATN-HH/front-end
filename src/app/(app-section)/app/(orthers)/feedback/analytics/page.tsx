'use client';

import React, { useEffect, useState } from 'react';
import { 
    TrendingUp, 
    Star, 
    MessageCircle, 
    Calendar, 
    Building2,
    Users,
    ThumbsUp,
    ThumbsDown,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FeedbackResponseDto, managerFeedbackAPI } from '@/api/v1/feedback';
import { useBranches } from '@/api/v1/branches';

export default function FeedbackAnalyticsPage() {
    const [feedbackData, setFeedbackData] = useState<FeedbackResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // days
    const [selectedBranch, setSelectedBranch] = useState('ALL');
    
    // Fetch branches using API
    const { data: branchesData, isLoading: branchesLoading } = useBranches({
        page: 0,
        size: 1000,
        sortBy: 'name',
        status: 'ACTIVE'
    });

    // Fetch feedback data
    useEffect(() => {
        const loadFeedback = async () => {
            setLoading(true);
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 1000
                });
                setFeedbackData(response.data);
            } catch (error) {
                console.error('Failed to load feedback:', error);
                setFeedbackData([]);
            } finally {
                setLoading(false);
            }
        };

        loadFeedback();
    }, []);

    // Filter data based on selected filters
    const filteredData = feedbackData.filter(feedback => {
        const feedbackDate = new Date(feedback.createdAt);
        const rangeStart = startOfDay(subDays(new Date(), parseInt(dateRange)));
        const rangeEnd = endOfDay(new Date());
        
        const isInDateRange = feedbackDate >= rangeStart && feedbackDate <= rangeEnd;
        const isInBranch = selectedBranch === 'ALL' || feedback.branchId.toString() === selectedBranch;
        
        return isInDateRange && isInBranch;
    });

    // Calculate analytics
    const analytics = {
        totalFeedback: filteredData.length,
        averageRating: filteredData.length > 0 ? 
            filteredData.reduce((sum, f) => sum + f.overallRating, 0) / filteredData.length : 0,
        positiveRatio: filteredData.length > 0 ? 
            (filteredData.filter(f => f.overallRating >= 4).length / filteredData.length) * 100 : 0,
        negativeRatio: filteredData.length > 0 ? 
            (filteredData.filter(f => f.overallRating <= 2).length / filteredData.length) * 100 : 0,
        responseRate: filteredData.length > 0 ? 
            (filteredData.filter(f => f.feedbackStatus === 'RESPONDED').length / filteredData.length) * 100 : 0,
        avgResponseTime: 2.5, // Mock data - would need to calculate from actual response times
        
        // Rating distribution
        ratingDistribution: {
            5: filteredData.filter(f => f.overallRating === 5).length,
            4: filteredData.filter(f => f.overallRating === 4).length,
            3: filteredData.filter(f => f.overallRating === 3).length,
            2: filteredData.filter(f => f.overallRating === 2).length,
            1: filteredData.filter(f => f.overallRating === 1).length,
        },
        
        // Feedback by type
        byType: {
            restaurant: filteredData.filter(f => f.feedbackType === 'RESTAURANT').length,
            product: filteredData.filter(f => f.feedbackType === 'PRODUCT').length,
        },
        
        // Feedback by branch
        byBranch: branchesData?.reduce((acc: Record<string, number>, branch) => {
            acc[branch.name] = filteredData.filter(f => f.branchId === branch.id).length;
            return acc;
        }, {}) || {},
        
        // Recent trends (mock data for demonstration)
        trends: {
            thisWeek: filteredData.filter(f => {
                const feedbackDate = new Date(f.createdAt);
                return feedbackDate >= subDays(new Date(), 7);
            }).length,
            lastWeek: Math.floor(filteredData.length * 0.8), // Mock comparison
        }
    };

    const trendChange = analytics.trends.thisWeek - analytics.trends.lastWeek;
    const trendPercentage = analytics.trends.lastWeek > 0 ? 
        ((trendChange / analytics.trends.lastWeek) * 100) : 0;

    if (loading || branchesLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageTitle icon={TrendingUp} title="Feedback Analytics" />
                
                {/* Filters */}
                <div className="flex gap-4">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 3 months</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Branches</SelectItem>
                            {branchesData?.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
                        <p className="text-xs text-muted-foreground">
                            {trendChange > 0 ? '+' : ''}{trendChange} from last period
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {analytics.averageRating.toFixed(1)}
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={star <= Math.round(analytics.averageRating) ? 
                                            'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of 5.0 stars
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.responseRate.toFixed(1)}%</div>
                        <Progress value={analytics.responseRate} className="mt-2" />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.avgResponseTime}h</div>
                        <p className="text-xs text-muted-foreground">
                            Average time to respond
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sentiment Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ThumbsUp className="h-5 w-5 text-green-500" />
                            Customer Sentiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                <span>Positive (4-5 stars)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{analytics.positiveRatio.toFixed(1)}%</span>
                                <Progress value={analytics.positiveRatio} className="w-20" />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-yellow-500 rounded-full" />
                                <span>Neutral (3 stars)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {(100 - analytics.positiveRatio - analytics.negativeRatio).toFixed(1)}%
                                </span>
                                <Progress value={100 - analytics.positiveRatio - analytics.negativeRatio} className="w-20" />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                <span>Negative (1-2 stars)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{analytics.negativeRatio.toFixed(1)}%</span>
                                <Progress value={analytics.negativeRatio} className="w-20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Rating Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(analytics.ratingDistribution)
                            .reverse()
                            .map(([rating, count]) => (
                            <div key={rating} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span>{rating} stars</span>
                                    <div className="flex">
                                        {Array.from({ length: parseInt(rating) }).map((_, i) => (
                                            <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{count}</span>
                                    <Progress 
                                        value={analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0} 
                                        className="w-20" 
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Feedback by Category */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-blue-500" />
                            Feedback by Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                <span>Restaurant Feedback</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{analytics.byType.restaurant}</Badge>
                                <Progress 
                                    value={analytics.totalFeedback > 0 ? (analytics.byType.restaurant / analytics.totalFeedback) * 100 : 0} 
                                    className="w-20" 
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <span>Product Feedback</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{analytics.byType.product}</Badge>
                                <Progress 
                                    value={analytics.totalFeedback > 0 ? (analytics.byType.product / analytics.totalFeedback) * 100 : 0} 
                                    className="w-20" 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-500" />
                            Feedback by Branch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(analytics.byBranch)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([branchName, count]) => (
                            <div key={branchName} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-purple-500" />
                                    <span className="truncate">{branchName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{count}</Badge>
                                    <Progress 
                                        value={analytics.totalFeedback > 0 ? (count / analytics.totalFeedback) * 100 : 0} 
                                        className="w-20" 
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Priority Issues */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Priority Issues
                    </CardTitle>
                    <CardDescription>
                        Feedback that requires immediate attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredData
                            .filter(feedback => feedback.overallRating <= 2 && feedback.feedbackStatus === 'PENDING')
                            .slice(0, 5)
                            .map((feedback) => (
                            <div key={feedback.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{feedback.customerName}</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= feedback.overallRating ? 
                                                        'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <Badge variant="destructive" className="text-xs">
                                            {feedback.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate max-w-md">{feedback.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm')} • {feedback.branchName}
                                    </p>
                                </div>
                                <Badge variant="outline">Needs Response</Badge>
                            </div>
                        ))}
                        
                        {filteredData.filter(f => f.overallRating <= 2 && f.feedbackStatus === 'PENDING').length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <CheckIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <p>No priority issues at the moment!</p>
                                <p className="text-sm">All low-rated feedback has been addressed.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );
}