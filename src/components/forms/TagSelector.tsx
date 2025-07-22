'use client';

import { ChevronsUpDown, Tag, X, Plus } from 'lucide-react';
import { useState } from 'react';

import {
    useAllTags,
    useSearchTags,
    ProductTagResponse,
} from '@/api/v1/menu/product-tags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
    selectedTags: ProductTagResponse[];
    onTagsChange: (tags: ProductTagResponse[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function TagSelector({
    selectedTags,
    onTagsChange,
    placeholder = 'Select tags...',
    disabled = false,
    className,
}: TagSelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Get all tags for initial load
    const { data: allTags = [] } = useAllTags();

    // Search tags when user types
    const { data: searchResults = [] } = useSearchTags(searchValue);

    // Use search results if searching, otherwise use all tags
    const availableTags = searchValue ? searchResults : allTags;

    // Filter out already selected tags
    const unselectedTags = availableTags.filter(
        (tag) => !selectedTags.some((selected) => selected.id === tag.id)
    );

    const handleTagSelect = (tag: ProductTagResponse) => {
        const newTags = [...selectedTags, tag];
        onTagsChange(newTags);
        setSearchValue('');
    };

    const handleTagRemove = (tagId: number) => {
        const newTags = selectedTags.filter((tag) => tag.id !== tagId);
        onTagsChange(newTags);
    };

    const getTagDisplay = (tag: ProductTagResponse) => (
        <div className="flex items-center space-x-2">
            {tag.color && (
                <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: tag.color }}
                />
            )}
            <span>{tag.name}</span>
        </div>
    );

    return (
        <div className={cn('space-y-3', className)}>
            <Label className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
            </Label>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="flex items-center space-x-1 pr-1"
                            style={{
                                borderColor: tag.color || undefined,
                                backgroundColor: tag.color
                                    ? `${tag.color}15`
                                    : undefined,
                            }}
                        >
                            {tag.color && (
                                <div
                                    className="w-2 h-2 rounded"
                                    style={{ backgroundColor: tag.color }}
                                />
                            )}
                            <span>{tag.name}</span>
                            {!disabled && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleTagRemove(tag.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Tag Selector */}
            {!disabled && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            <div className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>{placeholder}</span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search tags..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                            />
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                                {unselectedTags.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        onSelect={() => {
                                            handleTagSelect(tag);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {getTagDisplay(tag)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {/* Empty State */}
            {selectedTags.length === 0 && disabled && (
                <div className="text-sm text-gray-500 italic">
                    No tags assigned
                </div>
            )}
        </div>
    );
}
