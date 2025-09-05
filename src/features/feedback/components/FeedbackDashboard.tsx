'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Users, 
  Filter, 
  Search, 
  Download,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { managerFeedbackAPI, FeedbackResponseDto, FeedbackSummaryDto } from '@/api/v1/feedback';
import { useCustomToast } from '@/lib/show-toast';
import { FeedbackList } from './FeedbackList';
import { FeedbackSummaryCards } from './FeedbackSummaryCards';
import { FeedbackAnalytics } from './FeedbackAnalytics';
import { FeedbackFilters } from './FeedbackFilters';

interface FeedbackDashboardProps {
  branches: Array<{ id: number; name: string }>;
}

export function FeedbackDashboard({ branches }: FeedbackDashboardProps) {
  const toast = useCustomToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackData, setFeedbackData] = useState<FeedbackResponseDto[]>([]);
  const [summaryData, setSummaryData] = useState<FeedbackSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branchId: undefined as number | undefined,
    status: '',
    feedbackType: '',
    minRating: undefined as number | undefined,
    maxRating: undefined as number | undefined,
    startDate: '',
    endDate: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    total: 0,
  });

  const loadFeedbackData = async () => {
    setLoading(true);
    try {
      const [feedbackResponse, summaryResponse] = await Promise.all([
        managerFeedbackAPI.getAllFeedback({
          ...filters,
          page: pagination.page,
          size: pagination.size,
        }),
        managerFeedbackAPI.getFeedbackSummary({
          branchId: filters.branchId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);

      setFeedbackData(feedbackResponse.data);
      setPagination(prev => ({
        ...prev,
        total: feedbackResponse.total,
      }));
      setSummaryData(summaryResponse);
    } catch (error: any) {
      console.error('Failed to load feedback data:', error);
      toast.error('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, [filters, pagination.page, pagination.size]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const downloadUrl = await managerFeedbackAPI.exportFeedbackData({
        format,
        branchId: filters.branchId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `feedback_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Success', `Feedback data exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast.error('Error', 'Failed to export feedback data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">
            Monitor and respond to customer feedback across all branches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFeedbackData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <FeedbackSummaryCards 
          summary={summaryData}
          loading={loading}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            All Feedback
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Feedback */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Feedback
                </CardTitle>
                <CardDescription>
                  Latest customer feedback requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackData.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{feedback.title}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < feedback.overallRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feedback.reviewText}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span>{feedback.customerName}</span>
                          <span>•</span>
                          <span>{feedback.branchName}</span>
                          <span>•</span>
                          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(feedback.feedbackStatus)}>
                          {feedback.feedbackStatus}
                        </Badge>
                        <Badge className={getPriorityColor(feedback.priority)}>
                          {feedback.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Response</span>
                    <span className="font-medium">{summaryData?.pendingFeedback || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Responded Today</span>
                    <span className="font-medium">{summaryData?.respondedFeedback || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-medium">
                      {summaryData?.averageRating.toFixed(1) || '0.0'} ⭐
                    </span>
                  </div>
                </div>
                
                {summaryData?.ratingDistribution && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Rating Distribution</h4>
                    {Object.entries(summaryData.ratingDistribution)
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating}⭐</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${((count as number) / (summaryData.totalFeedback || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm w-8 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackFilters
            branches={branches}
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
          
          <FeedbackList
            feedback={feedbackData}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            onRefresh={loadFeedbackData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FeedbackAnalytics
            branches={branches}
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Reports</CardTitle>
              <CardDescription>
                Generate detailed reports for feedback analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced reporting features will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
