'use client';

import { type ReactNode, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Header } from '@tanstack/react-table';
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    PinIcon,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DraggableColumnHeaderProps {
    header: Header<any, unknown>;
    columnId: string;
    children: ReactNode;
    onColumnReorder: (draggedColumnId: string, targetColumnId: string) => void;
    onPinColumn?: (
        columnId: string,
        position: 'left' | 'right' | false
    ) => void;
    isPinned: 'left' | 'right' | false;
    sorting?: string;
    enableSorting?: boolean;
}

type DragItem = {
    id: string;
    type: string;
};

export function DraggableColumnHeader({
    header,
    columnId,
    children,
    onColumnReorder,
    onPinColumn,
    isPinned,
    sorting,
    enableSorting = true,
}: DraggableColumnHeaderProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Drag and drop logic
    const [{ isOver }, drop] = useDrop({
        accept: 'column',
        drop: (draggedItem: DragItem) => {
            if (draggedItem.id !== columnId) {
                onColumnReorder(draggedItem.id, columnId);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'column',
        item: { id: columnId, type: 'column' },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // Connect drag and drop refs
    drag(drop(ref));

    const isSortable = header.column.getCanSort();

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
            ref={ref}
            className={cn(
                'flex items-center gap-1 select-none cursor-grab relative',
                isDragging ? 'opacity-50' : '',
                isOver ? 'bg-primary/10' : ''
            )}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {isPinned && (
                <PinIcon
                    className={cn(
                        'h-3 w-3 absolute top-1/2 transform -translate-y-1/2',
                        'text-primary'
                    )}
                    style={{
                        left: isPinned === 'left' ? 0 : 'auto',
                        right: isPinned === 'right' ? 0 : 'auto',
                    }}
                />
            )}

            <div className="flex flex-1 items-center">
                {children}

                <DropdownMenu>
                    <DropdownMenuTrigger className="ml-1 focus:outline-none">
                        <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="bg-popover border-primary/20 shadow-md rounded-md"
                    >
                        {enableSorting && isSortable && (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        header.column.toggleSorting(false)
                                    }
                                    className={cn(
                                        'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                        currentSortDirection === 'asc' &&
                                            'bg-primary/10 text-primary'
                                    )}
                                >
                                    <ArrowUp className="h-4 w-4 mr-2" />
                                    Sort A-Z
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        header.column.toggleSorting(true)
                                    }
                                    className={cn(
                                        'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary',
                                        currentSortDirection === 'desc' &&
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

                        {onPinColumn && (
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
                                    Pin to right
                                </DropdownMenuItem>
                                {isPinned && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            onPinColumn(columnId, false)
                                        }
                                        className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                    >
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

                {enableSorting && isSortable && (
                    <div
                        className="ml-2 flex items-center cursor-pointer"
                        onClick={handleSortToggle}
                    >
                        {renderSortIcon()}
                    </div>
                )}
            </div>
        </div>
    );
}
