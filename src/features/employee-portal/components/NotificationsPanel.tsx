'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Bell,
    BellRing,
    CheckCheck,
    Clock,
    Loader2,
    Eye
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
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';



const getNotificationColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return '';

    switch (type) {
        case NotificationType.SHIFT_ASSIGNED:
        case NotificationType.SHIFT_PUBLISHED:
        case NotificationType.SCHEDULE_PUBLISHED:
            return 'border-l-4 border-l-primary bg-primary/5';
        case NotificationType.SHIFT_CANCELLED:
        case NotificationType.EMERGENCY_SHIFT:
            return 'border-l-4 border-l-destructive bg-destructive/5';
        case NotificationType.SHIFT_FEEDBACK:
        case NotificationType.SHIFT_REPLACEMENT:
            return 'border-l-4 border-l-secondary bg-secondary/5';
        case NotificationType.LEAVE_APPROVED:
            return 'border-l-4 border-l-accent bg-accent/5';
        case NotificationType.SWAP_REQUEST:
            return 'border-l-4 border-l-gold-500 bg-gold-50';
        default:
            return 'border-l-4 border-l-muted bg-muted/5';
    }
};

const getPriorityFromType = (type: NotificationType): 'high' | 'medium' | 'low' => {
    switch (type) {
        case NotificationType.EMERGENCY_SHIFT:
        case NotificationType.SHIFT_CANCELLED:
            return 'high';
        case NotificationType.SHIFT_ASSIGNED:
        case NotificationType.LEAVE_APPROVED:
        case NotificationType.SWAP_REQUEST:
            return 'medium';
        default:
            return 'low';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'destructive';
        case 'medium': return 'default';
        case 'low': return 'outline';
        default: return 'outline';
    }
};

export function NotificationsPanel() {
    const { success, error } = useCustomToast();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // API hooks
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

    const handleViewAll = () => {
        router.push('/app/notifications');
    };

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);
    const displayNotifications = isExpanded ? notifications : notifications.slice(0, 5);

    return (
        <Card className="h-fit">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                            {unreadCount > 0 ? (
                                <BellRing className="h-4 w-4" />
                            ) : (
                                <Bell className="h-4 w-4" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <CardDescription>
                                {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
                            </CardDescription>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                                {unreadCount} new
                            </Badge>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                                className="h-8 px-2"
                            >
                                {markAllAsReadMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <CheckCheck className="h-3 w-3" />
                                )}
                                <span className="ml-1 text-xs">Mark all read</span>
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground mb-1">No notifications yet</p>
                        <p className="text-sm text-muted-foreground">You'll see important updates here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Unread Notifications Section */}
                        {unreadNotifications.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-sm font-medium text-foreground">Unread</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {unreadNotifications.length}
                                    </Badge>
                                </div>
                                <ScrollArea className="max-h-60">
                                    <div className="space-y-3">
                                        {unreadNotifications.slice(0, isExpanded ? undefined : 3).map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 border rounded-lg transition-colors hover:bg-gray-50 cursor-pointer ${getNotificationColor(notification.type, notification.isRead)}`}
                                                onClick={() => handleMarkAsRead(notification)}
                                            >
                                                <div className="flex items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                                                {notification.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={getPriorityColor(getPriorityFromType(notification.type))}
                                                                    className="text-xs"
                                                                >
                                                                    {getPriorityFromType(notification.type)}
                                                                </Badge>
                                                                {!notification.isRead && (
                                                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {notification.content}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Read Notifications Section */}
                        {readNotifications.length > 0 && (
                            <div>
                                {unreadNotifications.length > 0 && <Separator className="my-4" />}
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">Recent</h4>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {readNotifications.slice(0, isExpanded ? 10 : 3).map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="p-3 border rounded-lg opacity-75 hover:opacity-100 transition-opacity"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="text-sm font-medium text-muted-foreground line-clamp-1">
                                                            {notification.title}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs opacity-60"
                                                        >
                                                            {getPriorityFromType(notification.type)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.content}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            {notifications.length > 5 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex-1"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {isExpanded ? 'Show Less' : `View More (${notifications.length - 5})`}
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleViewAll}
                                    className="flex-1"
                                >
                                    View All Notifications
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 