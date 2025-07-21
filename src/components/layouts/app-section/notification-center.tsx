'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, BellRing, CheckCheck, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    useMyNotifications,
    useUnreadCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    Notification,
    NotificationType,
} from '@/api/v1/notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

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
        default:
            return 'border-muted/20 bg-muted/5';
    }
};

export function NotificationCenter() {
    const { success, error } = useCustomToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: notifications = [],
        isLoading,
        refetch,
    } = useMyNotifications();
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

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const readNotifications = notifications.filter((n) => n.isRead);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-semibold text-foreground">
                            Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
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
                    )}
                </div>

                <ScrollArea className="h-96">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                                Loading notifications...
                            </span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                                You'll see notifications here when they arrive
                            </p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {/* Unread Notifications */}
                            {unreadNotifications.length > 0 && (
                                <>
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Unread ({unreadNotifications.length})
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {unreadNotifications.map(
                                            (notification) => (
                                                <Card
                                                    key={notification.id}
                                                    className={`border cursor-pointer hover:shadow-sm transition-all ${getNotificationColor(notification.type)}`}
                                                    onClick={() =>
                                                        handleMarkAsRead(
                                                            notification
                                                        )
                                                    }
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </h4>
                                                                    {!notification.isRead && (
                                                                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                    {
                                                                        notification.content
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-2">
                                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(
                                                                            parseISO(
                                                                                notification.createdAt
                                                                            ),
                                                                            {
                                                                                addSuffix:
                                                                                    true,
                                                                            }
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Read Notifications */}
                            {readNotifications.length > 0 && (
                                <>
                                    {unreadNotifications.length > 0 && (
                                        <Separator className="my-2" />
                                    )}
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Read
                                    </div>
                                    <div className="space-y-2">
                                        {readNotifications
                                            .slice(0, 10)
                                            .map((notification) => (
                                                <Card
                                                    key={notification.id}
                                                    className="border border-muted/50 opacity-75 hover:opacity-100 transition-opacity"
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-muted-foreground line-clamp-1">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                    {
                                                                        notification.content
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-2">
                                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(
                                                                            parseISO(
                                                                                notification.createdAt
                                                                            ),
                                                                            {
                                                                                addSuffix:
                                                                                    true,
                                                                            }
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {readNotifications.length > 10 && (
                                            <div className="text-center py-2">
                                                <span className="text-xs text-muted-foreground">
                                                    And{' '}
                                                    {readNotifications.length -
                                                        10}{' '}
                                                    more...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-center text-sm"
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/app/notifications');
                                }}
                            >
                                View All Notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
