'use client';

import {
    CheckCircle,
    ArrowRight,
    Layers,
    Package,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MigrationSummaryCardProps {
    migrationStats?: {
        totalCategories: number;
        migratedCategories: number;
        totalProducts: number;
        productsWithMigratedCategories: number;
    };
    className?: string;
}

export function MigrationSummaryCard({
    migrationStats,
    className,
}: MigrationSummaryCardProps) {
    // Mock data if not provided
    const stats = migrationStats || {
        totalCategories: 15,
        migratedCategories: 8,
        totalProducts: 120,
        productsWithMigratedCategories: 45,
    };

    const migrationProgress = stats.totalCategories > 0 
        ? (stats.migratedCategories / stats.totalCategories) * 100 
        : 0;

    const isComplete = stats.migratedCategories > 0;

    if (!isComplete) return null; // Only show if migration has occurred

    return (
        <Card className={`border-green-200 bg-green-50 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                            <CardTitle className="text-lg text-green-900">
                                Migration Complete
                            </CardTitle>
                            <p className="text-sm text-green-700">
                                Category system has been unified successfully
                            </p>
                        </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                        Completed
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-green-700">Migration Progress</span>
                        <span className="font-medium text-green-900">
                            {Math.round(migrationProgress)}%
                        </span>
                    </div>
                    <Progress value={migrationProgress} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center justify-center mb-2">
                            <Layers className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-xl font-bold text-green-900">
                            {stats.migratedCategories}
                        </div>
                        <div className="text-xs text-green-600">
                            Categories Migrated
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center justify-center mb-2">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-xl font-bold text-green-900">
                            {stats.productsWithMigratedCategories}
                        </div>
                        <div className="text-xs text-green-600">
                            Products Updated
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-white p-3 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        New Features Available
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                        <li>• Hierarchical category structure</li>
                        <li>• Unified management interface</li>
                        <li>• Enhanced product organization</li>
                        <li>• Improved navigation and search</li>
                    </ul>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full">
                    <Link href="/app/menu/categories/unified">
                        <Layers className="h-4 w-4 mr-2" />
                        Explore Unified Categories
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default MigrationSummaryCard;
