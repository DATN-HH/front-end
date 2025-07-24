'use client';

import {
    ChevronDown,
    ChevronRight,
    Check,
    FolderOpen,
    Folder,
    Package,
} from 'lucide-react';
import { useState } from 'react';

import { CategoryResponse } from '@/api/v1/menu/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
    categories: CategoryResponse[];
    value?: number;
    onValueChange: (value: number | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

interface CategoryItemProps {
    category: CategoryResponse;
    level: number;
    selectedValue?: number;
    onSelect: (value: number) => void;
    searchTerm: string;
}

function CategoryItem({ category, level, selectedValue, onSelect, searchTerm }: CategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;
    const indentLevel = level * 16; // 16px per level
    const isSelected = selectedValue === category.id;

    // Check if this category or any of its children match the search
    const matchesSearch = (cat: CategoryResponse, term: string): boolean => {
        if (!term) return true;
        const lowerTerm = term.toLowerCase();
        const nameMatch = cat.name.toLowerCase().includes(lowerTerm);
        const codeMatch = cat.code?.toLowerCase().includes(lowerTerm);
        const childMatch = cat.children?.some(child => matchesSearch(child, term));
        return nameMatch || !!codeMatch || !!childMatch;
    };

    const shouldShow = matchesSearch(category, searchTerm);

    if (!shouldShow) return null;

    return (
        <div>
            <CommandItem
                value={category.id.toString()}
                onSelect={() => onSelect(category.id)}
                className={cn(
                    "flex items-center justify-between cursor-pointer",
                    isSelected && "bg-accent"
                )}
                style={{ paddingLeft: `${indentLevel + 8}px` }}
            >
                <div className="flex items-center space-x-2 flex-1">
                    {/* Expand/Collapse Button */}
                    <div className="w-4 flex justify-center">
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </Button>
                        ) : (
                            <div className="h-4 w-4" />
                        )}
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {hasChildren ? (
                            isExpanded ? (
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                            ) : (
                                <Folder className="h-4 w-4 text-blue-500" />
                            )
                        ) : (
                            <Package className="h-4 w-4 text-gray-500" />
                        )}
                    </div>

                    {/* Category Info */}
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="truncate">{category.name}</span>
                        
                        {/* Badges */}
                        <div className="flex items-center space-x-1">
                            {category.code && (
                                <Badge variant="outline" className="text-xs">
                                    {category.code}
                                </Badge>
                            )}
                            {category.migrationSource === 'POS_CATEGORY' && (
                                <Badge variant="secondary" className="text-xs">
                                    Migrated
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                    )}
                </div>
            </CommandItem>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {category.children!.map((child) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                            selectedValue={selectedValue}
                            onSelect={onSelect}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategorySelector({
    categories,
    value,
    onValueChange,
    placeholder = "Select category...",
    className,
    disabled = false,
}: CategorySelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Find selected category for display
    const findCategoryById = (cats: CategoryResponse[], id: number): CategoryResponse | null => {
        for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.children) {
                const found = findCategoryById(cat.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedCategory = value ? findCategoryById(categories, value) : null;

    // Flatten categories for the "No Parent" option
    const flattenCategories = (cats: CategoryResponse[]): CategoryResponse[] => {
        const result: CategoryResponse[] = [];
        for (const cat of cats) {
            result.push(cat);
            if (cat.children) {
                result.push(...flattenCategories(cat.children));
            }
        }
        return result;
    };

    const allCategories = flattenCategories(categories);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    <div className="flex items-center space-x-2">
                        {selectedCategory ? (
                            <>
                                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                                    <FolderOpen className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <Package className="h-4 w-4 text-gray-500" />
                                )}
                                <span>{selectedCategory.name}</span>
                                {selectedCategory.code && (
                                    <Badge variant="outline" className="text-xs">
                                        {selectedCategory.code}
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search categories..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                            {/* No Category Option */}
                            <CommandItem
                                value="none"
                                onSelect={() => {
                                    onValueChange(undefined);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex items-center justify-between cursor-pointer",
                                    !value && "bg-accent"
                                )}
                            >
                                <div className="flex items-center space-x-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <span className="text-muted-foreground">No Category</span>
                                </div>
                                {!value && <Check className="h-4 w-4 text-primary" />}
                            </CommandItem>

                            {/* Hierarchical Categories */}
                            {categories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    level={0}
                                    selectedValue={value}
                                    onSelect={(categoryId) => {
                                        onValueChange(categoryId);
                                        setOpen(false);
                                    }}
                                    searchTerm={searchTerm}
                                />
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default CategorySelector;
