'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    CheckCheck,
    Clock,
    Calendar,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import {
    useMyNotifications,
    useUnreadCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    Notification,
    NotificationType
} from '@/api/v1/notifications';
import { useCustomToast } from '@/lib/show-toast';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { PageTitle } from '@/components/layouts/app-section/page-title';



const getNotificationColor = (type: NotificationType) => {
    switch (type) {
        case NotificationType.SHIFT_ASSIGNED:
        case NotificationType.SHIFT_PUBLISHED:
        case NotificationType.SCHEDULE_PUBLISHED:
            return 'border-primary/20 bg-primary/5';
        case NotificationType.SHIFT_CANCELLED:
        case NotificationType.EMERGENCY_SHIFT:
            return 'border-destructive/20 bg-destructive/5';
        case NotificationType.SHIFT_FEEDBACK:
        case NotificationType.SHIFT_REPLACEMENT:
            return 'border-secondary/20 bg-secondary/5';
        case NotificationType.LEAVE_APPROVED:
            return 'border-accent/20 bg-accent/5';
        case NotificationType.SWAP_REQUEST:
            return 'border-gold-200 bg-gold-50';
        default:
            return 'border-muted/20 bg-muted/5';
    }
};

const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
        case NotificationType.SHIFT_ASSIGNED:
            return 'Shift Assigned';
        case NotificationType.SHIFT_PUBLISHED:
            return 'Shift Published';
        case NotificationType.SHIFT_CANCELLED:
            return 'Shift Cancelled';
        case NotificationType.SHIFT_FEEDBACK:
            return 'Shift Feedback';
        case NotificationType.SHIFT_REPLACEMENT:
            return 'Shift Replacement';
        case NotificationType.LEAVE_APPROVED:
            return 'Leave Approved';
        case NotificationType.SWAP_REQUEST:
            return 'Swap Request';
        case NotificationType.EMERGENCY_SHIFT:
            return 'Emergency Shift';
        case NotificationType.SCHEDULE_PUBLISHED:
            return 'Schedule Published';
        default:
            return 'Notification';
    }
};

export default function NotificationsPage() {
    const { success, error } = useCustomToast();
    const [activeTab, setActiveTab] = useState('all');

    const { data: notifications = [], isLoading, refetch } = useMyNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.isRead) return;

        try {
            await markAsReadMutation.mutateAsync(notification.id);
            refetch();
        } catch (err: any) {
            error('Error', 'Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsReadMutation.mutateAsync();
            success('Success', 'All notifications marked as read');
            refetch();
        } catch (err: any) {
            error('Error', 'Failed to mark all notifications as read');
        }
    };

    // Filter notifications based on active tab only
    const displayNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.isRead;
        if (activeTab === 'read') return notification.isRead;
        return true;
    });

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <PageTitle
                icon={Bell}
                title="Notifications"
                left={
                    unreadCount > 0 && (
                        <div className="flex items-center gap-3">
                            <Badge variant="destructive" className="px-2">
                                {unreadCount} unread
                            </Badge>
                            <Button
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                                className="gap-2"
                            >
                                {markAllAsReadMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCheck className="h-4 w-4" />
                                )}
                                Mark All Read
                            </Button>
                        </div>
                    )
                }
            />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="gap-2">
                        <Bell className="h-4 w-4" />
                        All ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Unread ({unreadNotifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="read" className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Read ({readNotifications.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-3 text-muted-foreground">Loading notifications...</span>
                        </div>
                    ) : displayNotifications.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Bell className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                                    <p className="text-muted-foreground">
                                        {activeTab === 'all'
                                            ? 'You\'ll see notifications here when they arrive'
                                            : `No ${activeTab} notifications found`
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {displayNotifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`cursor-pointer hover:shadow-md transition-all ${!notification.isRead ? getNotificationColor(notification.type) : 'border-muted/50'
                                        }`}
                                    onClick={() => handleMarkAsRead(notification)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                                                                {notification.title}
                                                            </h3>
                                                            {!notification.isRead && (
                                                                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
                                                            )}
                                                        </div>

                                                        <Badge variant="secondary" className="mb-3">
                                                            {getNotificationTypeLabel(notification.type)}
                                                        </Badge>

                                                        <p className="text-muted-foreground mb-4 leading-relaxed">
                                                            {notification.content}
                                                        </p>

                                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>{format(parseISO(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                                                </div>
                                                            </div>

                                                            {notification.isRead && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Read
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 