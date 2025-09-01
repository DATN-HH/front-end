'use client';

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';

import { TableResponse } from '@/api/v1/tables';
import { TableElement } from '@/features/booking/components/floor-management/[floorId]/TableElement';

interface FloorCanvasProps {
    floor: {
        id: number;
        name: string;
        imageUrl: string;
        order: number;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    tables: TableResponse[];
    selectedTables: TableResponse[];
    onTableSelect: (tables: TableResponse[]) => void;
    selectableTables?: number[]; // Array of table IDs that can be selected
    onTableAvailabilityClick?: (table: TableResponse) => void; // New prop for availability modal
}

export function MultiSelectFloorCanvas({
    floor,
    tables,
    selectedTables,
    onTableSelect,
    selectableTables,
    onTableAvailabilityClick,
}: FloorCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [imageSize, setImageSize] = useState({
        width: 800,
        height: 600,
        offsetX: 0,
        offsetY: 0,
    });

    // Calculate image size and offset for bg-contain
    const calculateImageSize = (
        containerWidth: number,
        containerHeight: number,
        imageWidth: number,
        imageHeight: number
    ) => {
        const containerAspect = containerWidth / containerHeight;
        const imageAspect = imageWidth / imageHeight;

        let scaledWidth, scaledHeight, offsetX, offsetY;

        if (imageAspect > containerAspect) {
            // Image is wider than container - fit to width
            scaledWidth = containerWidth;
            scaledHeight = containerWidth / imageAspect;
            offsetX = 0;
            offsetY = (containerHeight - scaledHeight) / 2;
        } else {
            // Image is taller than container - fit to height
            scaledWidth = containerHeight * imageAspect;
            scaledHeight = containerHeight;
            offsetX = (containerWidth - scaledWidth) / 2;
            offsetY = 0;
        }

        return {
            width: scaledWidth,
            height: scaledHeight,
            offsetX,
            offsetY,
        };
    };

    // Update canvas size and calculate image size
    useEffect(() => {
        const updateSize = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: rect.width,
                    height: rect.height,
                });

                // Load image to get natural dimensions
                if (floor.imageUrl) {
                    const img = new Image();
                    img.onload = () => {
                        const calculatedSize = calculateImageSize(
                            rect.width,
                            rect.height,
                            img.naturalWidth,
                            img.naturalHeight
                        );
                        setImageSize(calculatedSize);
                    };
                    img.src = floor.imageUrl;
                } else {
                    // No image - use full canvas size
                    setImageSize({
                        width: rect.width,
                        height: rect.height,
                        offsetX: 0,
                        offsetY: 0,
                    });
                }
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [floor.imageUrl]);

    // Convert ratio to pixels for position (based on actual image size)
    const ratioToPixelsPosition = (
        ratio: number,
        dimension: 'width' | 'height'
    ) => {
        const size = dimension === 'width' ? imageSize.width : imageSize.height;
        const offset =
            dimension === 'width' ? imageSize.offsetX : imageSize.offsetY;
        return Math.round(ratio * size + offset);
    };

    // Convert ratio to pixels for size (based on actual image size)
    const ratioToPixelsSize = (
        ratio: number,
        dimension: 'width' | 'height'
    ) => {
        const size = dimension === 'width' ? imageSize.width : imageSize.height;
        return Math.round(ratio * size);
    };

    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const [lastClickedTableId, setLastClickedTableId] = useState<number | null>(
        null
    );

    const handleTableClick = (
        table: TableResponse,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();

        const isSelectable = selectableTables
            ? selectableTables.includes(table.id)
            : true;

        // If table is not selectable, do nothing on regular click
        if (!isSelectable) {
            return;
        }

        const isSelected = selectedTables.some((t) => t.id === table.id);

        // Single click on selectable table - toggle selection
        if (isSelected) {
            // Remove from selection
            onTableSelect(selectedTables.filter((t) => t.id !== table.id));
        } else {
            // Add to selection
            onTableSelect([...selectedTables, table]);
        }
    };

    const handleCanvasClick = () => {
        // Clear all selections when clicking on empty canvas
        onTableSelect([]);
    };

    return (
        <div className="relative w-full h-full bg-white border rounded-lg overflow-hidden">
            {/* Background Image */}
            {floor.imageUrl && (
                <div
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
                    style={{ backgroundImage: `url(${floor.imageUrl})` }}
                />
            )}

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="relative w-full h-full cursor-pointer"
                onClick={handleCanvasClick}
                style={{ minHeight: '600px' }}
            >
                {/* Tables */}
                {Array.isArray(tables) &&
                    tables.map((table) => {
                        const xRatio = table.xRatio ?? table.xratio ?? 0.5;
                        const yRatio = table.yRatio ?? table.yratio ?? 0.5;
                        const x = ratioToPixelsPosition(xRatio, 'width');
                        const y = ratioToPixelsPosition(yRatio, 'height');
                        const width = ratioToPixelsSize(
                            table.widthRatio,
                            'width'
                        );
                        const height = ratioToPixelsSize(
                            table.heightRatio,
                            'height'
                        );

                        const isSelected = selectedTables.some(
                            (t) => t.id === table.id
                        );
                        const isSelectable = selectableTables
                            ? selectableTables.includes(table.id)
                            : true;

                        return (
                            <Rnd
                                key={table.id}
                                size={{ width, height }}
                                position={{ x, y }}
                                disableDragging={true}
                                enableResizing={false}
                                bounds="parent"
                                className={`
                                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                                    z-10 cursor-pointer
                                `}
                            >
                                <TableElement
                                    table={table}
                                    isSelected={isSelected}
                                    onClick={(e) => handleTableClick(table, e)}
                                    isDragging={false}
                                    unable={!isSelectable}
                                    modeView="booking"
                                    isSelectable={isSelectable}
                                    onAvailabilityClick={(e) => {
                                        e.stopPropagation();
                                        if (onTableAvailabilityClick) {
                                            onTableAvailabilityClick(table);
                                        }
                                    }}
                                />
                            </Rnd>
                        );
                    })}

                {/* Show message when no tables available */}
                {(!Array.isArray(tables) || tables.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <p className="text-lg font-medium">
                                No tables available
                            </p>
                            <p className="text-sm">
                                Please select a different floor or time
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Selection info */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-56">
                {selectedTables.length > 0 ? (
                    <>
                        {selectedTables.length} table
                        {selectedTables.length > 1 ? 's' : ''} selected
                        <br />
                    </>
                ) : null}
                <span className="opacity-75">
                    Click available tables to select
                    <br />
                    Click purple eye icon (top-right) for availability
                </span>
            </div>
        </div>
    );
}
