'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';

interface MockNotification {
    id: string;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationTestButton() {
    const { success, error } = useCustomToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [mockNotifications, setMockNotifications] = useState<MockNotification[]>([]);

    const mockNotificationTemplates = [
        {
            title: 'New Shift Assigned',
            content: 'You have been assigned to work on Monday, Dec 16, 2024 from 9:00 AM to 5:00 PM.',
            type: 'SHIFT_ASSIGNED'
        },
        {
            title: 'Schedule Published',
            content: 'The schedule for next week has been published. Please review your assigned shifts.',
            type: 'SCHEDULE_PUBLISHED'
        },
        {
            title: 'Shift Cancelled',
            content: 'Your shift on Tuesday, Dec 17, 2024 has been cancelled due to low customer demand.',
            type: 'SHIFT_CANCELLED'
        },
        {
            title: 'Emergency Shift Available',
            content: 'An emergency shift is available today from 2:00 PM to 10:00 PM. Please respond if available.',
            type: 'EMERGENCY_SHIFT'
        },
        {
            title: 'Leave Request Approved',
            content: 'Your leave request for Dec 20-22, 2024 has been approved by your manager.',
            type: 'LEAVE_APPROVED'
        },
        {
            title: 'Shift Swap Request',
            content: 'John Doe has requested to swap shifts with you for Friday, Dec 20, 2024.',
            type: 'SWAP_REQUEST'
        },
        {
            title: 'Shift Feedback Required',
            content: 'Please provide feedback on your last shift performance. This helps us improve our service.',
            type: 'SHIFT_FEEDBACK'
        }
    ];

    const generateMockNotification = async () => {
        setIsGenerating(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const template = mockNotificationTemplates[Math.floor(Math.random() * mockNotificationTemplates.length)];
            const newNotification: MockNotification = {
                id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: template.title,
                content: template.content,
                type: template.type,
                isRead: Math.random() > 0.7, // 30% chance of being read
                createdAt: new Date().toISOString()
            };

            setMockNotifications(prev => [newNotification, ...prev]);
            success('Success', 'Mock notification generated successfully!');
        } catch (err) {
            error('Error', 'Failed to generate mock notification');
        } finally {
            setIsGenerating(false);
        }
    };

    const clearMockNotifications = () => {
        setMockNotifications([]);
        success('Success', 'All mock notifications cleared');
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Notification Testing
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button
                        onClick={generateMockNotification}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        Generate Mock Notification
                    </Button>

                    {mockNotifications.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={clearMockNotifications}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All ({mockNotifications.length})
                        </Button>
                    )}
                </div>

                {mockNotifications.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Generated Notifications:</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {mockNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-3 border rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="text-sm font-medium">{notification.title}</h5>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.content}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {notification.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    <p>• Click "Generate Mock Notification" to create test notifications</p>
                    <p>• Check the notification bell in the header to see them</p>
                    <p>• Visit the notifications page to see all notifications</p>
                </div>
            </CardContent>
        </Card>
    );
} 