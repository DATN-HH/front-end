'use client';

import {
    LayoutGrid,
    Clock,
    ChefHat,
    CheckCircle,
    RefreshCw,
    ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useKdsItems, useKdsStatistics } from '@/api/v1/kds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { KdsItemStatus, KDS_TABS } from '@/types/kds';

import { KDSCardView } from './KDSCardView';
import { KDSKanbanView } from './KDSKanbanView';

export function KDSDashboard() {
    const router = useRouter();
    const { user, getDefaultRedirectByRole } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch all items for statistics and overview
    const {
        data: allItemsData,
        isLoading,
        error,
        refetch,
    } = useKdsItems({
        includeCompleted: true,
        sortByPriority: true,
    });

    const { data: statisticsData } = useKdsStatistics();

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
        refetch();
    };

    const handleBackToApp = () => {
        if (user?.userRoles && user.userRoles.length > 0) {
            const defaultRoute = getDefaultRedirectByRole(
                user.userRoles[0].role
            );
            router.push(defaultRoute);
        } else {
            router.push('/app');
        }
    };

    const getTabIcon = (iconName: string) => {
        switch (iconName) {
            case 'LayoutGrid':
                return <LayoutGrid className="h-4 w-4" />;
            case 'Clock':
                return <Clock className="h-4 w-4" />;
            case 'ChefHat':
                return <ChefHat className="h-4 w-4" />;
            case 'CheckCircle':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getItemCountByStatus = (status?: KdsItemStatus): number => {
        if (!allItemsData?.items) return 0;
        if (!status) return allItemsData.items.length;
        return allItemsData.items.filter((item) => item.itemStatus === status)
            .length;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">
                                Unable to load KDS data
                            </p>
                            <Button onClick={handleRefresh}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ChefHat className="h-6 w-6 text-blue-600" />
                            Kitchen Display System
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button size="sm" onClick={handleBackToApp}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to App
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics
            <div className="px-6 py-4 flex-shrink-0">
                <KDSStatistics
                    statistics={statisticsData || allItemsData?.statistics}
                    isLoading={isLoading}
                />
            </div> */}

            {/* Main Content */}
            <div className="px-6 p-6 flex-1 flex flex-col">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full h-full flex flex-col"
                >
                    <TabsList className="grid w-full grid-cols-4 mb-6 flex-shrink-0">
                        {KDS_TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex items-center gap-2"
                            >
                                {tab.icon && getTabIcon(tab.icon)}
                                <span>{tab.label}</span>
                                <Badge variant="secondary" className="ml-1">
                                    {getItemCountByStatus(tab.status)}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* All Tab - Kanban View */}
                    <TabsContent value="all" className="mt-0 flex-1 min-h-0">
                        <KDSKanbanView
                            items={allItemsData?.items || []}
                            isLoading={isLoading}
                            refreshKey={refreshKey}
                        />
                    </TabsContent>

                    {/* Individual Status Tabs - Card View */}
                    {KDS_TABS.slice(1).map((tab) => (
                        <TabsContent
                            key={tab.id}
                            value={tab.id}
                            className="mt-0 flex-1 min-h-0"
                        >
                            <KDSCardView
                                status={tab.status!}
                                title={tab.label}
                                refreshKey={refreshKey}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
