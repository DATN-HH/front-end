'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Edit3, Trash2, Eye, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { FloorResponse } from '@/api/v1/floors';
import { useRouter } from 'next/navigation';

interface FloorCardProps {
    floor: FloorResponse;
    onEdit: (floor: FloorResponse) => void;
    onDelete: (floor: FloorResponse) => void;
    onViewImage: (floor: FloorResponse) => void;
}

export function FloorCard({ floor, onEdit, onDelete, onViewImage }: FloorCardProps) {
    const router = useRouter();

    const handleManageTables = () => {
        router.push(`/app/settings/floor-management/${floor.id}`);
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Left side - Image */}
                    <div className="w-full lg:w-1/2 h-64 lg:h-80 bg-gray-50 relative group">
                        {floor.imageUrl ? (
                            <div className="w-full h-full relative overflow-hidden">
                                <img
                                    src={floor.imageUrl}
                                    alt={floor.name}
                                    className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                                    onClick={() => onViewImage(floor)}
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onViewImage(floor)}
                                        className="gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Full
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => onEdit(floor)}
                            >
                                <Building2 className="w-16 h-16 mb-4" />
                                <p className="text-sm font-medium">No Layout Image</p>
                                <p className="text-xs">Click to add image</p>
                            </div>
                        )}
                    </div>

                    {/* Right side - Information & Actions */}
                    <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between">
                        {/* Floor Info */}
                        <div className="space-y-4 flex-1">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                                        {floor.name}
                                    </h3>
                                    <Badge
                                        variant={
                                            floor.status === 'ACTIVE' ? 'default' :
                                                floor.status === 'INACTIVE' ? 'secondary' : 'destructive'
                                        }
                                        className="ml-2 flex-shrink-0"
                                    >
                                        {floor.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Floor ID: {floor.id}
                                </p>
                                {/* 🆕 NEW: Display order field */}
                                {floor.order && (
                                    <p className="text-sm text-gray-500">
                                        Display Order: {floor.order}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created:</span>
                                    <span className="text-gray-900">
                                        {format(new Date(floor.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Updated:</span>
                                    <span className="text-gray-900">
                                        {format(new Date(floor.updatedAt), 'dd/MM/yyyy HH:mm')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Updated by:</span>
                                    <span className="text-gray-900 truncate ml-2">
                                        {floor.updatedUsername}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                    // variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(floor)}
                                    className="gap-2 justify-start"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Floor
                                </Button>

                                <Button
                                    // variant="outline"
                                    size="sm"
                                    onClick={handleManageTables}
                                    className="gap-2 justify-start"
                                >
                                    <Settings className="w-4 h-4" />
                                    Table Layout
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {floor.imageUrl && (
                                    <Button
                                        // variant="outline"
                                        size="sm"
                                        onClick={() => onViewImage(floor)}
                                        className="gap-2 justify-start"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Image
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(floor)}
                                    className="gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 