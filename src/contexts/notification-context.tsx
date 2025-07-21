'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useUnreadCount } from '@/api/v1/notifications';

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: unreadCount = 0, refetch } = useUnreadCount();
    const [refreshInterval, setRefreshInterval] =
        useState<NodeJS.Timeout | null>(null);

    // Auto-refresh unread count every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000); // 30 seconds

        setRefreshInterval(interval);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [refetch]);

    const refreshUnreadCount = () => {
        refetch();
    };

    return (
        <NotificationContext.Provider
            value={{ unreadCount, refreshUnreadCount }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            'useNotificationContext must be used within a NotificationProvider'
        );
    }
    return context;
}
