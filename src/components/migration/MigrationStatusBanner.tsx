'use client';

import {
    CheckCircle,
    Info,
    X,
    ArrowRight,
    Database,
    Layers,
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MigrationStatusBannerProps {
    migrationStats?: {
        totalCategories: number;
        migratedCategories: number;
        totalProducts: number;
        productsWithMigratedCategories: number;
    };
    onDismiss?: () => void;
    className?: string;
}

export function MigrationStatusBanner({
    migrationStats,
    onDismiss,
    className,
}: MigrationStatusBannerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    // Mock data if not provided
    const stats = migrationStats || {
        totalCategories: 15,
        migratedCategories: 8,
        totalProducts: 120,
        productsWithMigratedCategories: 45,
    };

    const migrationComplete = stats.migratedCategories > 0;

    return (
        <Card className={`border-blue-200 bg-blue-50 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            {migrationComplete ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <Info className="h-6 w-6 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg text-blue-900">
                                Category System Migration
                            </CardTitle>
                            <p className="text-sm text-blue-700">
                                {migrationComplete
                                    ? 'POS Categories have been successfully migrated to the unified system'
                                    : 'Category system migration is ready to begin'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant={migrationComplete ? 'default' : 'secondary'}>
                            {migrationComplete ? 'Completed' : 'Pending'}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                            {stats.totalCategories}
                        </div>
                        <div className="text-xs text-blue-600">Total Categories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.migratedCategories}
                        </div>
                        <div className="text-xs text-blue-600">Migrated</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                            {stats.totalProducts}
                        </div>
                        <div className="text-xs text-blue-600">Total Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {stats.productsWithMigratedCategories}
                        </div>
                        <div className="text-xs text-blue-600">Using Migrated Categories</div>
                    </div>
                </div>

                {/* Expandable Details */}
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                            {isExpanded ? 'Hide Details' : 'Show Migration Details'}
                            <ArrowRight
                                className={`ml-2 h-4 w-4 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                }`}
                            />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                        {/* What Changed */}
                        <Alert>
                            <Database className="h-4 w-4" />
                            <AlertTitle>What Changed?</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>
                                        POS Categories have been merged into the main Categories system
                                    </li>
                                    <li>
                                        All category data has been preserved with hierarchy support
                                    </li>
                                    <li>
                                        Products maintain their category associations
                                    </li>
                                    <li>
                                        New unified interface provides better organization
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {/* Benefits */}
                        <Alert>
                            <Layers className="h-4 w-4" />
                            <AlertTitle>Benefits of the Unified System</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>
                                        <strong>Hierarchical Organization:</strong> Create parent-child category relationships
                                    </li>
                                    <li>
                                        <strong>Simplified Management:</strong> One interface for all categories
                                    </li>
                                    <li>
                                        <strong>Better Product Organization:</strong> Enhanced categorization options
                                    </li>
                                    <li>
                                        <strong>Backward Compatibility:</strong> All existing functionality preserved
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {/* Migration Status */}
                        {migrationComplete && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Migration Complete</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-2 mt-2">
                                        <p>
                                            Your POS Categories have been successfully migrated to the unified system.
                                            All data has been preserved and enhanced with new features.
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline">
                                                {stats.migratedCategories} categories migrated
                                            </Badge>
                                            <Badge variant="outline">
                                                {stats.productsWithMigratedCategories} products updated
                                            </Badge>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" asChild>
                                <a href="/app/menu/categories/unified">
                                    View Unified Categories
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href="/app/menu/products">
                                    Manage Products
                                </a>
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}

export default MigrationStatusBanner;
