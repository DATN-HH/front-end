'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    Download,
    FileText,
    Calendar,
    Filter,
    Eye,
    Building2,
    Star,
    MessageCircle,
    Clock,
    Users,
    TrendingUp,
    TrendingDown,
    RefreshCw,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

import { PageTitle } from '@/components/layouts/app-section/page-title';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FeedbackResponseDto, managerFeedbackAPI } from '@/api/v1/feedback';
import { useBranches } from '@/api/v1/branches';
import { useCustomToast } from '@/lib/show-toast';

interface ReportConfig {
    dateRange: string;
    branch: string;
    type: string;
    format: string;
}

export default function FeedbackReportsPage() {
    const toast = useCustomToast();
    const [feedbackData, setFeedbackData] = useState<FeedbackResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reportConfig, setReportConfig] = useState<ReportConfig>({
        dateRange: '30',
        branch: 'ALL',
        type: 'ALL',
        format: 'EXCEL',
    });

    // Fetch branches using API
    const { data: branchesData, isLoading: branchesLoading } = useBranches({
        page: 0,
        size: 1000,
        sortBy: 'name',
        status: 'ACTIVE',
    });

    // Fetch feedback data
    useEffect(() => {
        const loadFeedback = async () => {
            setLoading(true);
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 1000,
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

    // Filter data based on report config
    const filteredData = feedbackData.filter((feedback) => {
        const feedbackDate = new Date(feedback.createdAt);
        const rangeStart = startOfDay(
            subDays(new Date(), parseInt(reportConfig.dateRange))
        );
        const rangeEnd = endOfDay(new Date());

        const isInDateRange =
            feedbackDate >= rangeStart && feedbackDate <= rangeEnd;
        const isInBranch =
            reportConfig.branch === 'ALL' ||
            feedback.branchId.toString() === reportConfig.branch;
        const isInType =
            reportConfig.type === 'ALL' ||
            feedback.feedbackType === reportConfig.type;

        return isInDateRange && isInBranch && isInType;
    });

    // Calculate report data
    const reportData = {
        summary: {
            totalFeedback: filteredData.length,
            averageRating:
                filteredData.length > 0
                    ? filteredData.reduce(
                          (sum, f) => sum + f.overallRating,
                          0
                      ) / filteredData.length
                    : 0,
            responseRate:
                filteredData.length > 0
                    ? (filteredData.filter(
                          (f) => f.feedbackStatus === 'RESPONDED'
                      ).length /
                          filteredData.length) *
                      100
                    : 0,
            positiveCount: filteredData.filter((f) => f.overallRating >= 4)
                .length,
            negativeCount: filteredData.filter((f) => f.overallRating <= 2)
                .length,
        },
        trends: {
            thisPeriod: filteredData.length,
            lastPeriod: Math.floor(filteredData.length * 0.85), // Mock comparison
        },
        byBranch:
            branchesData?.map((branch) => ({
                name: branch.name,
                count: filteredData.filter((f) => f.branchId === branch.id)
                    .length,
                avgRating: (() => {
                    const branchFeedback = filteredData.filter(
                        (f) => f.branchId === branch.id
                    );
                    return branchFeedback.length > 0
                        ? branchFeedback.reduce(
                              (sum, f) => sum + f.overallRating,
                              0
                          ) / branchFeedback.length
                        : 0;
                })(),
            })) || [],
        topIssues: filteredData
            .filter((f) => f.overallRating <= 2)
            .slice(0, 10),
        topPerformers:
            branchesData
                ?.map((branch) => {
                    const branchFeedback = filteredData.filter(
                        (f) => f.branchId === branch.id
                    );
                    const avgRating =
                        branchFeedback.length > 0
                            ? branchFeedback.reduce(
                                  (sum, f) => sum + f.overallRating,
                                  0
                              ) / branchFeedback.length
                            : 0;
                    return {
                        name: branch.name,
                        avgRating,
                        count: branchFeedback.length,
                    };
                })
                .sort((a, b) => b.avgRating - a.avgRating)
                .slice(0, 5) || [],
    };

    const trendChange =
        reportData.trends.thisPeriod - reportData.trends.lastPeriod;
    const trendPercentage =
        reportData.trends.lastPeriod > 0
            ? (trendChange / reportData.trends.lastPeriod) * 100
            : 0;

    const handleGenerateReport = async () => {
        setGenerating(true);

        try {
            // Simulate processing time
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (reportConfig.format === 'EXCEL') {
                generateExcelReport();
            } else if (reportConfig.format === 'CSV') {
                generateCSVReport();
            } else if (reportConfig.format === 'PDF') {
                // For PDF, you could integrate with jsPDF or use backend API
                toast.error(
                    'Info',
                    'PDF export will be implemented with backend API'
                );
            } else {
                generateJSONReport();
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast.error('Error', 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const generateExcelReport = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['Feedback Report Summary'],
            [''],
            ['Generated At', new Date().toLocaleString()],
            ['Date Range', `Last ${reportConfig.dateRange} days`],
            [
                'Branch',
                reportConfig.branch === 'ALL'
                    ? 'All Branches'
                    : branchesData?.find(
                          (b) => b.id.toString() === reportConfig.branch
                      )?.name || 'Unknown',
            ],
            [
                'Feedback Type',
                reportConfig.type === 'ALL' ? 'All Types' : reportConfig.type,
            ],
            [''],
            ['Total Feedback', reportData.summary.totalFeedback],
            ['Average Rating', reportData.summary.averageRating.toFixed(2)],
            ['Response Rate', `${reportData.summary.responseRate.toFixed(1)}%`],
            ['Positive Reviews (4-5★)', reportData.summary.positiveCount],
            ['Negative Reviews (1-2★)', reportData.summary.negativeCount],
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Detailed feedback data sheet
        const feedbackHeaders = [
            'ID',
            'Customer Name',
            'Email',
            'Phone',
            'Branch',
            'Product',
            'Feedback Type',
            'Overall Rating',
            'Priority',
            'Status',
            'Title',
            'Review Text',
            'Response Text',
            'Created At',
        ];

        const feedbackRows = filteredData.map((feedback) => [
            feedback.id,
            feedback.customerName,
            feedback.customerEmail,
            feedback.customerPhone || '',
            feedback.branchName || '',
            feedback.productName || '',
            feedback.feedbackType,
            feedback.overallRating,
            feedback.priority,
            feedback.feedbackStatus,
            feedback.title,
            feedback.reviewText,
            feedback.responseText || '',
            format(new Date(feedback.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        ]);

        const feedbackData = [feedbackHeaders, ...feedbackRows];
        const feedbackSheet = XLSX.utils.aoa_to_sheet(feedbackData);
        XLSX.utils.book_append_sheet(workbook, feedbackSheet, 'Feedback Data');

        // Branch performance sheet
        const branchHeaders = [
            'Branch Name',
            'Total Feedback',
            'Average Rating',
            'Response Rate',
        ];
        const branchRows = reportData.byBranch
            .filter((branch) => branch.count > 0)
            .map((branch) => [
                branch.name,
                branch.count,
                branch.avgRating.toFixed(2),
                `${((filteredData.filter((f) => f.branchName === branch.name && f.responseText).length / branch.count) * 100).toFixed(1)}%`,
            ]);

        const branchData = [branchHeaders, ...branchRows];
        const branchSheet = XLSX.utils.aoa_to_sheet(branchData);
        XLSX.utils.book_append_sheet(
            workbook,
            branchSheet,
            'Branch Performance'
        );

        // Priority issues sheet
        const priorityHeaders = [
            'ID',
            'Customer',
            'Priority',
            'Rating',
            'Title',
            'Created At',
            'Status',
        ];
        const priorityRows = reportData.topIssues.map((issue) => [
            issue.id,
            issue.customerName,
            issue.priority,
            issue.overallRating,
            issue.title,
            format(new Date(issue.createdAt), 'yyyy-MM-dd HH:mm:ss'),
            issue.feedbackStatus,
        ]);

        const priorityData = [priorityHeaders, ...priorityRows];
        const prioritySheet = XLSX.utils.aoa_to_sheet(priorityData);
        XLSX.utils.book_append_sheet(
            workbook,
            prioritySheet,
            'Priority Issues'
        );

        // Generate and download Excel file
        const fileName = `feedback-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success('Success', 'Excel report generated successfully!');
    };

    const generateCSVReport = () => {
        const headers = [
            'ID',
            'Customer Name',
            'Email',
            'Branch',
            'Product',
            'Type',
            'Rating',
            'Priority',
            'Status',
            'Title',
            'Review Text',
            'Response Text',
            'Created At',
        ];

        const rows = filteredData.map((feedback) => [
            feedback.id,
            feedback.customerName,
            feedback.customerEmail,
            feedback.branchName || '',
            feedback.productName || '',
            feedback.feedbackType,
            feedback.overallRating,
            feedback.priority,
            feedback.feedbackStatus,
            `"${feedback.title.replace(/"/g, '""')}"`,
            `"${feedback.reviewText.replace(/"/g, '""')}"`,
            `"${(feedback.responseText || '').replace(/"/g, '""')}"`,
            format(new Date(feedback.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `feedback-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
        );
        link.click();

        toast.success('Success', 'CSV report generated successfully!');
    };

    const generateJSONReport = () => {
        const reportContent = {
            metadata: {
                title: 'Feedback Report',
                dateRange: `Last ${reportConfig.dateRange} days`,
                branch:
                    reportConfig.branch === 'ALL'
                        ? 'All Branches'
                        : branchesData?.find(
                              (b) => b.id.toString() === reportConfig.branch
                          )?.name,
                type:
                    reportConfig.type === 'ALL'
                        ? 'All Types'
                        : reportConfig.type,
                generatedAt: new Date().toISOString(),
                generatedBy: 'Manager', // Would be actual user
            },
            summary: reportData.summary,
            data: filteredData,
        };

        const dataStr = JSON.stringify(reportContent, null, 2);
        const dataUri =
            'data:application/json;charset=utf-8,' +
            encodeURIComponent(dataStr);

        const exportFileDefaultName = `feedback-report-${format(new Date(), 'yyyy-MM-dd')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success('Success', 'JSON report generated successfully!');
    };

    const handleRefreshData = async () => {
        setLoading(true);
        try {
            const response = await managerFeedbackAPI.getAllFeedback({
                page: 0,
                size: 1000,
            });
            setFeedbackData(response.data);
        } catch (error) {
            console.error('Failed to refresh feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || branchesLoading) {
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
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageTitle icon={BarChart3} title="Feedback Reports" />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshData}
                        disabled={loading}
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Report Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Report Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure your report parameters and download options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Date Range
                            </label>
                            <Select
                                value={reportConfig.dateRange}
                                onValueChange={(value) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        dateRange: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="30">
                                        Last 30 days
                                    </SelectItem>
                                    <SelectItem value="90">
                                        Last 3 months
                                    </SelectItem>
                                    <SelectItem value="365">
                                        Last year
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Branch
                            </label>
                            <Select
                                value={reportConfig.branch}
                                onValueChange={(value) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        branch: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        All Branches
                                    </SelectItem>
                                    {branchesData?.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id.toString()}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Feedback Type
                            </label>
                            <Select
                                value={reportConfig.type}
                                onValueChange={(value) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        type: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="RESTAURANT">
                                        Restaurant
                                    </SelectItem>
                                    <SelectItem value="PRODUCT">
                                        Product
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Format
                            </label>
                            <Select
                                value={reportConfig.format}
                                onValueChange={(value) =>
                                    setReportConfig({
                                        ...reportConfig,
                                        format: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXCEL">
                                        Excel (.xlsx)
                                    </SelectItem>
                                    <SelectItem value="CSV">
                                        CSV (.csv)
                                    </SelectItem>
                                    <SelectItem value="PDF">
                                        PDF (.pdf)
                                    </SelectItem>
                                    <SelectItem value="JSON">
                                        JSON (.json)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="flex items-center gap-2"
                        >
                            {generating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {generating ? 'Generating...' : 'Generate Report'}
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Feedback
                        </CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportData.summary.totalFeedback}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {trendChange > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            {Math.abs(trendPercentage).toFixed(1)}% from last
                            period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportData.summary.averageRating.toFixed(1)}
                        </div>
                        <div className="flex mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={14}
                                    className={
                                        star <=
                                        Math.round(
                                            reportData.summary.averageRating
                                        )
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Response Rate
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportData.summary.responseRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Responses handled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Satisfaction
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {reportData.summary.positiveCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Positive reviews (4-5★)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            Performance by Branch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reportData.byBranch
                                .sort((a, b) => b.avgRating - a.avgRating)
                                .slice(0, 5)
                                .map((branch, index) => (
                                    <div
                                        key={branch.name}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        index === 0
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    #{index + 1}
                                                </Badge>
                                                <span className="font-medium">
                                                    {branch.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <Star
                                                                key={star}
                                                                size={12}
                                                                className={
                                                                    star <=
                                                                    Math.round(
                                                                        branch.avgRating
                                                                    )
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <span>
                                                    {branch.avgRating.toFixed(
                                                        1
                                                    )}{' '}
                                                    avg
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {branch.count} reviews
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            Priority Issues
                        </CardTitle>
                        <CardDescription>
                            Low-rated feedback requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reportData.topIssues.slice(0, 5).map((issue) => (
                                <div
                                    key={issue.id}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                >
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={12}
                                                className={
                                                    star <= issue.overallRating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium text-sm">
                                            {issue.title}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {issue.reviewText}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{issue.customerName}</span>
                                            <span>•</span>
                                            <span>
                                                {format(
                                                    new Date(issue.createdAt),
                                                    'MMM dd'
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span>{issue.branchName}</span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            issue.feedbackStatus === 'PENDING'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        className="text-xs"
                                    >
                                        {issue.feedbackStatus}
                                    </Badge>
                                </div>
                            ))}

                            {reportData.topIssues.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                    <p>No low-rated feedback in this period!</p>
                                    <p className="text-sm">
                                        Great job maintaining quality service.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common report types and exports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div className="text-center">
                                <div className="font-medium">
                                    Monthly Report
                                </div>
                                <div className="text-xs text-gray-500">
                                    Last 30 days summary
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            <div className="text-center">
                                <div className="font-medium">
                                    Trend Analysis
                                </div>
                                <div className="text-xs text-gray-500">
                                    Performance trends
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <Building2 className="h-6 w-6 text-purple-500" />
                            <div className="text-center">
                                <div className="font-medium">
                                    Branch Comparison
                                </div>
                                <div className="text-xs text-gray-500">
                                    Cross-branch analysis
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <Users className="h-6 w-6 text-orange-500" />
                            <div className="text-center">
                                <div className="font-medium">
                                    Customer Insights
                                </div>
                                <div className="text-xs text-gray-500">
                                    Behavioral patterns
                                </div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}
