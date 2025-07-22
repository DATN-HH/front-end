'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Header } from '@tanstack/react-table';
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    PinIcon,
    ChevronDown,
} from 'lucide-react';
import { type ReactNode } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DraggableColumnHeaderProps {
    header: Header<any, unknown>;
    columnId: string;
    children: ReactNode;
    onPinColumn?: (
        columnId: string,
        position: 'left' | 'right' | false
    ) => void;
    isPinned: 'left' | 'right' | false;
    sorting?: string;
    enableSorting?: boolean;
    enableDragAndDrop?: boolean;
}

export function DraggableColumnHeader({
    header,
    columnId,
    children,
    onPinColumn,
    isPinned,
    sorting,
    enableSorting = true,
    enableDragAndDrop = true,
}: DraggableColumnHeaderProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: columnId,
        disabled: !enableDragAndDrop,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSortable = header.column.getCanSort();
    const canPin = header.column.getCanPin();

    // Parse sorting prop to get current sort state
    const getCurrentSortState = () => {
        if (!sorting) return null;

        const [sortColumn, sortDirection] = sorting.split(':');
        if (sortColumn === columnId) {
            return sortDirection === 'asc' ? 'asc' : 'desc';
        }
        return null;
    };

    const currentSortDirection = getCurrentSortState();

    // Function to handle cycling through sort states
    const handleSortToggle = () => {
        if (currentSortDirection === 'asc') {
            header.column.toggleSorting(true); // Sort descending
        } else if (currentSortDirection === 'desc') {
            header.column.clearSorting(); // Clear sorting
        } else {
            header.column.toggleSorting(false); // Sort ascending
        }
    };

    // Function to render the appropriate sort icon
    const renderSortIcon = () => {
        if (currentSortDirection === 'asc') {
            return <ArrowUp className="h-4 w-4 text-primary" />;
        } else if (currentSortDirection === 'desc') {
            return <ArrowDown className="h-4 w-4 text-primary" />;
        } else {
            return (
                <ArrowUpDown className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            );
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex flex-col gap-1 select-none relative w-full',
                isDragging ? 'opacity-50 z-50' : '',
                'transition-opacity duration-200'
            )}
        >
            {/* Main header content */}
            <div className="flex items-center gap-1 w-full">
                <div className="flex-1 flex items-center justify-between">
                    <div
                        className={cn(
                            'flex items-center gap-2 flex-1',
                            enableDragAndDrop &&
                                'cursor-grab active:cursor-grabbing'
                        )}
                        {...(enableDragAndDrop ? attributes : {})}
                        {...(enableDragAndDrop ? listeners : {})}
                    >
                        {children}

                        {/* Pin indicator - visible inline when pinned */}
                        {isPinned && (
                            <PinIcon
                                className={cn(
                                    'h-3 w-3 text-primary flex-shrink-0',
                                    isPinned === 'right' && 'rotate-180'
                                )}
                                // title={`Pinned to ${isPinned}`}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {enableSorting && isSortable && (
                            <div
                                className="flex items-center cursor-pointer p-1 hover:bg-accent rounded"
                                onClick={handleSortToggle}
                                title="Click to sort"
                            >
                                {renderSortIcon()}
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 hover:bg-accent rounded focus:outline-none flex-shrink-0">
                                <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-popover border-primary/20 shadow-md rounded-md min-w-[140px]"
                            >
                                {enableSorting && isSortable && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                header.column.toggleSorting(
                                                    false
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                                currentSortDirection ===
                                                    'asc' &&
                                                    'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <ArrowUp className="h-4 w-4 mr-2" />
                                            Sort A-Z
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                header.column.toggleSorting(
                                                    true
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                                currentSortDirection ===
                                                    'desc' &&
                                                    'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <ArrowDown className="h-4 w-4 mr-2" />
                                            Sort Z-A
                                        </DropdownMenuItem>
                                        {currentSortDirection && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    header.column.clearSorting()
                                                }
                                                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                            >
                                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                                Clear sorting
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="bg-primary/10" />
                                    </>
                                )}

                                {onPinColumn && canPin && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onPinColumn(columnId, 'left')
                                            }
                                            disabled={isPinned === 'left'}
                                            className={cn(
                                                'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                                isPinned === 'left' &&
                                                    'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <PinIcon className="h-4 w-4 mr-2" />
                                            Pin to left
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onPinColumn(columnId, 'right')
                                            }
                                            disabled={isPinned === 'right'}
                                            className={cn(
                                                'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                                isPinned === 'right' &&
                                                    'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <PinIcon className="h-4 w-4 mr-2 rotate-180" />
                                            Pin to right
                                        </DropdownMenuItem>
                                        {isPinned && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onPinColumn(columnId, false)
                                                }
                                                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                            >
                                                <PinIcon className="h-4 w-4 mr-2 opacity-50" />
                                                Unpin
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="bg-primary/10" />
                                    </>
                                )}

                                <DropdownMenuItem
                                    onClick={() =>
                                        header.column.toggleVisibility(false)
                                    }
                                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                >
                                    Hide column
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
