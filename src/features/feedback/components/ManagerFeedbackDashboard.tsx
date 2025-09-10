'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MessageSquare,
    Star,
    Clock,
    Send,
    Filter,
    Search,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Reply,
    Eye,
    Calendar,
    Building,
    User,
    Zap
} from 'lucide-react';
import { FeedbackResponseDto, managerFeedbackAPI } from '@/api/v1/feedback';
import { useCustomToast } from '@/lib/show-toast';
import { format } from 'date-fns';

interface ManagerFeedbackDashboardProps {
    branches: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string; category: string }>;
    feedbackData: FeedbackResponseDto[];
    onFeedbackUpdate: (data: FeedbackResponseDto[]) => void;
}

// Quick response templates
const responseTemplates = [
    {
        id: 'thank_positive',
        title: 'Thank You (Positive)',
        template: 'Thank you so much for your wonderful feedback! We\'re thrilled to hear about your positive experience. We look forward to serving you again soon!'
    },
    {
        id: 'apologize_service',
        title: 'Apologize (Service)',
        template: 'We sincerely apologize for the service issues you experienced. This does not meet our standards, and we are taking immediate action to improve. Please give us another chance to serve you better.'
    },
    {
        id: 'apologize_food',
        title: 'Apologize (Food Quality)',
        template: 'We apologize for the food quality issues. Your feedback is valuable to us, and we are working with our kitchen team to ensure this doesn\'t happen again. We\'d love to invite you back for a better experience.'
    },
    {
        id: 'follow_up',
        title: 'Follow Up',
        template: 'Thank you for your feedback. We have reviewed your concerns with our team and implemented improvements. Please feel free to contact us directly if you have any other concerns.'
    }
];

export function ManagerFeedbackDashboard({ branches, products, feedbackData, onFeedbackUpdate }: ManagerFeedbackDashboardProps) {
    const toast = useCustomToast();
    const [loading, setLoading] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponseDto | null>(null);
    const [responseText, setResponseText] = useState('');
    const [isReplying, setIsReplying] = useState<number | null>(null);
    
    // Filters and pagination
    const [filters, setFilters] = useState({
        status: 'ALL',
        priority: 'ALL',
        branch: 'ALL',
        search: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Filter feedback based on current filters
    const filteredFeedback = feedbackData.filter(feedback => {
        const matchesStatus = filters.status === 'ALL' || feedback.feedbackStatus === filters.status;
        const matchesPriority = filters.priority === 'ALL' || feedback.priority === filters.priority;
        const matchesBranch = filters.branch === 'ALL' || feedback.branchId.toString() === filters.branch;
        const matchesSearch = filters.search === '' || 
            feedback.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            feedback.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
            feedback.reviewText.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesStatus && matchesPriority && matchesBranch && matchesSearch;
    });

    // Sort by priority and date
    const sortedFeedback = [...filteredFeedback].sort((a, b) => {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Pagination
    const totalPages = Math.ceil(sortedFeedback.length / itemsPerPage);
    const paginatedFeedback = sortedFeedback.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: feedbackData.length,
        pending: feedbackData.filter(f => f.feedbackStatus === 'PENDING').length,
        responded: feedbackData.filter(f => f.feedbackStatus === 'RESPONDED').length,
        urgent: feedbackData.filter(f => f.priority === 'URGENT' && f.feedbackStatus === 'PENDING').length,
        avgRating: feedbackData.length > 0 ? 
            feedbackData.reduce((sum, f) => sum + f.overallRating, 0) / feedbackData.length : 0
    };

    const handleReply = async (feedbackId: number, response: string) => {
        if (!response.trim()) {
            toast.error('Error', 'Please enter a response');
            return;
        }

        setLoading(true);
        try {
            // Use the real API to respond to feedback
            const updatedFeedback = await managerFeedbackAPI.respondToFeedback(feedbackId, {
                responseText: response
            });
            
            // Update the feedback data with the response from API
            const updatedData = feedbackData.map(feedback => 
                feedback.id === feedbackId ? updatedFeedback : feedback
            );
            onFeedbackUpdate(updatedData);
            
            setResponseText('');
            setIsReplying(null);
            toast.success('Success', 'Response sent successfully!');
        } catch (error) {
            console.error('Failed to send response:', error);
            toast.error('Error', 'Failed to send response');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityChange = async (feedbackId: number, newPriority: string) => {
        try {
            // Use the real API to update feedback priority
            const updatedFeedback = await managerFeedbackAPI.updateFeedbackPriority(feedbackId, newPriority);
            
            // Update the feedback data with the updated priority
            const updatedData = feedbackData.map(feedback => 
                feedback.id === feedbackId ? updatedFeedback : feedback
            );
            onFeedbackUpdate(updatedData);
            
            toast.success('Success', `Priority updated to ${newPriority}!`);
        } catch (error) {
            console.error('Failed to update priority:', error);
            toast.error('Error', 'Failed to update priority');
        }
    };

    const handleTemplateUse = (template: string) => {
        setResponseText(template);
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
            case 'URGENT': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Feedback Management
                    </h1>
                    <p className="text-muted-foreground">
                        Reply to customer feedback quickly and efficiently
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Feedback</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending Reply</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
                        <div className="text-sm text-muted-foreground">Responded</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                        <div className="text-sm text-muted-foreground">Urgent</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.avgRating.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="RESPONDED">Responded</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.branch} onValueChange={(value) => setFilters({...filters, branch: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Branches</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search feedback..."
                                    className="pl-10"
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="grid grid-cols-1 gap-4">
                {paginatedFeedback.map((feedback) => (
                    <Card key={feedback.id} className="relative">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                {/* Avatar */}
                                <Avatar className="h-12 w-12 flex-shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        {feedback.customerName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900">{feedback.customerName}</h4>
                                                <StarRating rating={feedback.overallRating} />
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm')}
                                                <Building size={14} className="ml-2" />
                                                {feedback.branchName}
                                                {feedback.productName && (
                                                    <>
                                                        <span>•</span>
                                                        {feedback.productName}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Select 
                                                value={feedback.priority} 
                                                onValueChange={(value) => handlePriorityChange(feedback.id, value)}
                                            >
                                                <SelectTrigger className="w-24 h-7">
                                                    <Badge className={getPriorityColor(feedback.priority)}>
                                                        {feedback.priority}
                                                    </Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">
                                                        <Badge className="bg-green-100 text-green-800">LOW</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="MEDIUM">
                                                        <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="HIGH">
                                                        <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="URGENT">
                                                        <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Badge className={getStatusColor(feedback.feedbackStatus)}>
                                                {feedback.feedbackStatus}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Feedback Content */}
                                    <div className="mb-4">
                                        <h5 className="font-medium text-gray-900 mb-2">{feedback.title}</h5>
                                        <p className="text-gray-700 text-sm">{feedback.reviewText}</p>
                                    </div>

                                    {/* Existing Response */}
                                    {feedback.responseText && (
                                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User size={16} className="text-blue-600" />
                                                <span className="font-medium text-blue-900">Your Response</span>
                                                <span className="text-sm text-blue-600">
                                                    • {format(new Date(feedback.responseDate!), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-blue-800 text-sm">{feedback.responseText}</p>
                                        </div>
                                    )}

                                    {/* Reply Section */}
                                    {feedback.feedbackStatus === 'PENDING' && (
                                        <div className="space-y-4">
                                            {isReplying === feedback.id ? (
                                                <div className="space-y-4">
                                                    {/* Quick Templates */}
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-gray-700">Quick Templates:</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {responseTemplates.map((template) => (
                                                                <Button
                                                                    key={template.id}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleTemplateUse(template.template)}
                                                                    className="text-xs"
                                                                >
                                                                    <Zap size={12} className="mr-1" />
                                                                    {template.title}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Response Textarea */}
                                                    <Textarea
                                                        placeholder="Write your response to the customer..."
                                                        value={responseText}
                                                        onChange={(e) => setResponseText(e.target.value)}
                                                        className="min-h-[100px]"
                                                    />

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleReply(feedback.id, responseText)}
                                                            disabled={!responseText.trim() || loading}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Send size={16} />
                                                            {loading ? 'Sending...' : 'Send Response'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsReplying(null);
                                                                setResponseText('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => setIsReplying(feedback.id)}
                                                    className="flex items-center gap-2"
                                                    variant="outline"
                                                >
                                                    <Reply size={16} />
                                                    Reply to Customer
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedFeedback.length)} of {sortedFeedback.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {paginatedFeedback.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No feedback found
                        </h3>
                        <p className="text-gray-500">
                            {filters.status !== 'ALL' || filters.priority !== 'ALL' || filters.branch !== 'ALL' || filters.search 
                                ? 'Try adjusting your filters to see more results.'
                                : 'No customer feedback available at the moment.'
                            }
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}