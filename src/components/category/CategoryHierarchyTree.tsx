'use client';

import {
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Plus,
    FolderOpen,
    Folder,
    Package,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { CategoryResponse } from '@/api/v1/menu/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CategoryHierarchyTreeProps {
    categories: CategoryResponse[];
    onEdit?: (category: CategoryResponse) => void;
    onDelete?: (category: CategoryResponse) => void;
    onAddChild?: (parentCategory: CategoryResponse) => void;
    className?: string;
}

interface CategoryNodeProps {
    category: CategoryResponse;
    level: number;
    onEdit?: (category: CategoryResponse) => void;
    onDelete?: (category: CategoryResponse) => void;
    onAddChild?: (parentCategory: CategoryResponse) => void;
}

function CategoryNode({
    category,
    level,
    onEdit,
    onDelete,
    onAddChild,
}: CategoryNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;
    const indentLevel = level * 24; // 24px per level

    return (
        <div className="w-full">
            {/* Category Row */}
            <div
                className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100"
                style={{ paddingLeft: `${indentLevel + 12}px` }}
            >
                <div className="flex items-center space-x-3 flex-1">
                    {/* Expand/Collapse Button */}
                    <div className="w-6 flex justify-center">
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <div className="h-6 w-6" />
                        )}
                    </div>

                    {/* Folder Icon */}
                    <div className="flex-shrink-0">
                        {hasChildren ? (
                            isExpanded ? (
                                <FolderOpen className="h-5 w-5 text-blue-500" />
                            ) : (
                                <Folder className="h-5 w-5 text-blue-500" />
                            )
                        ) : (
                            <Package className="h-5 w-5 text-gray-500" />
                        )}
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                                {category.name}
                            </h3>

                            {/* Badges */}
                            <div className="flex items-center space-x-1">
                                {category.code && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {category.code}
                                    </Badge>
                                )}
                                {category.migrationSource ===
                                    'POS_CATEGORY' && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        Migrated
                                    </Badge>
                                )}
                                {level === 0 && (
                                    <Badge
                                        variant="default"
                                        className="text-xs"
                                    >
                                        Root
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {category.description && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                                {category.description}
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {category.productsCount !== undefined && (
                            <span className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                {category.productsCount}
                            </span>
                        )}
                        {category.childrenCount !== undefined &&
                            category.childrenCount > 0 && (
                                <span className="flex items-center">
                                    <Folder className="h-4 w-4 mr-1" />
                                    {category.childrenCount}
                                </span>
                            )}
                        {category.sequence !== undefined && (
                            <span className="text-xs">
                                #{category.sequence}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                            <Link
                                href={`/app/menu/categories/${category.id}/detail`}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Link>
                        </DropdownMenuItem>

                        {onAddChild && (
                            <DropdownMenuItem
                                onClick={() => onAddChild(category)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Child Category
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {category.children!.map((child) => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategoryHierarchyTree({
    categories,
    onEdit,
    onDelete,
    onAddChild,
    className,
}: CategoryHierarchyTreeProps) {
    if (categories.length === 0) {
        return (
            <div className={cn('text-center py-8', className)}>
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400">
                    Create your first category to get started
                </p>
            </div>
        );
    }

    return (
        <div className={cn('border rounded-lg bg-white', className)}>
            <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                    <CategoryNode
                        key={category.id}
                        category={category}
                        level={0}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddChild={onAddChild}
                    />
                ))}
            </div>
        </div>
    );
}

export default CategoryHierarchyTree;
