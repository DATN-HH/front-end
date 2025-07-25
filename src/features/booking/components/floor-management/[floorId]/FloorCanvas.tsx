'use client';

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';

import { TableResponse, useDebounce } from '@/api/v1/tables';

import { TableElement } from './TableElement';

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
    selectedTable: TableResponse | null;
    onTableSelect: (table: TableResponse | null) => void;
    onTableDrop: (
        tableId: number,
        newPosition: { x: number; y: number },
        imageSize?: {
            width: number;
            height: number;
            offsetX: number;
            offsetY: number;
        }
    ) => void;
    onTableResize: (
        tableId: number,
        newSize: { width: number; height: number },
        imageSize?: {
            width: number;
            height: number;
            offsetX: number;
            offsetY: number;
        }
    ) => void;
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    modeView?: 'edit' | 'booking'; // New prop for view mode
    selectableTables?: number[]; // Array of table IDs that can be selected. If not provided, all tables are selectable
}

export function FloorCanvas({
    floor,
    tables,
    selectedTable,
    onTableSelect,
    onTableDrop,
    onTableResize,
    isDragging,
    onDragStart,
    onDragEnd,
    modeView = 'edit',
    selectableTables,
}: FloorCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [imageSize, setImageSize] = useState({
        width: 800,
        height: 600,
        offsetX: 0,
        offsetY: 0,
    });
    const [pendingUpdates, setPendingUpdates] = useState<
        Record<
            number,
            { x?: number; y?: number; width?: number; height?: number }
        >
    >({});
    const processedUpdatesRef = useRef<
        Record<
            number,
            { x?: number; y?: number; width?: number; height?: number }
        >
    >({});

    // Debounce pending updates
    const debouncedUpdates = useDebounce(pendingUpdates, 300);

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

    // Handle debounced updates
    useEffect(() => {
        if (Object.keys(debouncedUpdates).length === 0) return;

        // Check if we've already processed these updates
        const hasChanges = Object.entries(debouncedUpdates).some(
            ([tableId, update]) => {
                const processed =
                    processedUpdatesRef.current[parseInt(tableId)];
                return (
                    !processed ||
                    processed.x !== update.x ||
                    processed.y !== update.y ||
                    processed.width !== update.width ||
                    processed.height !== update.height
                );
            }
        );

        if (!hasChanges) return;

        Object.entries(debouncedUpdates).forEach(([tableId, update]) => {
            if (update.x !== undefined && update.y !== undefined) {
                onTableDrop(
                    parseInt(tableId),
                    { x: update.x, y: update.y },
                    imageSize
                );
            }
            if (update.width !== undefined && update.height !== undefined) {
                onTableResize(
                    parseInt(tableId),
                    { width: update.width, height: update.height },
                    imageSize
                );
            }
        });

        // Store processed updates to avoid reprocessing
        processedUpdatesRef.current = { ...debouncedUpdates };
    }, [debouncedUpdates, onTableDrop, onTableResize, imageSize]);

    // Clear pending updates when tables data is updated from API
    useEffect(() => {
        // Clear pending updates for tables that have been updated
        setPendingUpdates((prev) => {
            const newPending = { ...prev };
            let hasChanges = false;

            Object.keys(newPending).forEach((tableIdStr) => {
                const tableId = parseInt(tableIdStr);
                const table = tables.find((t) => t.id === tableId);
                const pending = newPending[tableId];

                if (table && pending) {
                    const currentX = ratioToPixelsPosition(
                        table.xRatio ?? table.xratio ?? 0.5,
                        'width'
                    );
                    const currentY = ratioToPixelsPosition(
                        table.yRatio ?? table.yratio ?? 0.5,
                        'height'
                    );
                    const currentWidth = ratioToPixelsSize(
                        table.widthRatio,
                        'width'
                    );
                    const currentHeight = ratioToPixelsSize(
                        table.heightRatio,
                        'height'
                    );

                    // If the server data matches our pending update (within a small tolerance), clear it
                    const tolerance = 2; // pixels
                    const positionMatches =
                        pending.x !== undefined &&
                        pending.y !== undefined &&
                        Math.abs(currentX - pending.x) <= tolerance &&
                        Math.abs(currentY - pending.y) <= tolerance;
                    const sizeMatches =
                        pending.width !== undefined &&
                        pending.height !== undefined &&
                        Math.abs(currentWidth - pending.width) <= tolerance &&
                        Math.abs(currentHeight - pending.height) <= tolerance;

                    if (positionMatches || sizeMatches) {
                        delete newPending[tableId];
                        hasChanges = true;
                    }
                }
            });

            return hasChanges ? newPending : prev;
        });
    }, [tables, imageSize]);

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

    // Convert pixels to ratio (based on actual image size)
    const pixelsToRatio = (pixels: number, dimension: 'width' | 'height') => {
        const size = dimension === 'width' ? imageSize.width : imageSize.height;
        const offset =
            dimension === 'width' ? imageSize.offsetX : imageSize.offsetY;
        return Math.max(0, Math.min(1, (pixels - offset) / size));
    };

    const handleTableClick = (
        table: TableResponse,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        if (table && table.id) {
            onTableSelect(table);
        }
    };

    const handleCanvasClick = () => {
        // Only allow deselection in edit mode to prevent accidental deselection in booking mode
        if (modeView === 'edit') {
            onTableSelect(null);
        }
    };

    return (
        <div className="relative w-full h-full bg-white border rounded-lg overflow-hidden">
            {/* Background Image */}
            {floor.imageUrl && (
                <div
                    className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${
                        modeView === 'booking' ? 'opacity-60' : 'opacity-30'
                    }`}
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
                {/* Grid overlay - only show in edit mode */}
                {modeView === 'edit' && (
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern
                                    id="grid"
                                    width="20"
                                    height="20"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <path
                                        d="M 20 0 L 0 0 0 20"
                                        fill="none"
                                        stroke="gray"
                                        strokeWidth="1"
                                    />
                                </pattern>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#grid)"
                            />
                        </svg>
                    </div>
                )}

                {/* Tables */}
                {tables.map((table) => {
                    const xRatio = table.xRatio ?? table.xratio ?? 0.5;
                    const yRatio = table.yRatio ?? table.yratio ?? 0.5;
                    const x = ratioToPixelsPosition(xRatio, 'width');
                    const y = ratioToPixelsPosition(yRatio, 'height');
                    const width = ratioToPixelsSize(table.widthRatio, 'width');
                    const height = ratioToPixelsSize(
                        table.heightRatio,
                        'height'
                    );

                    const isBookingMode = modeView === 'booking';

                    return (
                        <Rnd
                            key={table.id}
                            size={{
                                width: pendingUpdates[table.id]?.width ?? width,
                                height:
                                    pendingUpdates[table.id]?.height ?? height,
                            }}
                            position={{
                                x: pendingUpdates[table.id]?.x ?? x,
                                y: pendingUpdates[table.id]?.y ?? y,
                            }}
                            // Completely disable drag/resize in booking mode
                            onDragStart={isBookingMode ? () => {} : onDragStart}
                            onDragStop={
                                isBookingMode
                                    ? () => {}
                                    : (e, d) => {
                                          onDragEnd();
                                          const newPosition = {
                                              x: Math.max(
                                                  imageSize.offsetX,
                                                  Math.min(
                                                      imageSize.offsetX +
                                                          imageSize.width -
                                                          width,
                                                      d.x
                                                  )
                                              ),
                                              y: Math.max(
                                                  imageSize.offsetY,
                                                  Math.min(
                                                      imageSize.offsetY +
                                                          imageSize.height -
                                                          height,
                                                      d.y
                                                  )
                                              ),
                                          };
                                          setPendingUpdates((prev) => ({
                                              ...prev,
                                              [table.id]: {
                                                  ...prev[table.id],
                                                  x: newPosition.x,
                                                  y: newPosition.y,
                                              },
                                          }));
                                      }
                            }
                            onResizeStart={
                                isBookingMode ? () => {} : onDragStart
                            }
                            onResizeStop={
                                isBookingMode
                                    ? () => {}
                                    : (e, direction, ref, delta, position) => {
                                          onDragEnd();
                                          const newSize = {
                                              width: ref.offsetWidth,
                                              height: ref.offsetHeight,
                                          };
                                          setPendingUpdates((prev) => ({
                                              ...prev,
                                              [table.id]: {
                                                  ...prev[table.id],
                                                  width: newSize.width,
                                                  height: newSize.height,
                                              },
                                          }));
                                      }
                            }
                            bounds="parent"
                            disableDragging={isBookingMode}
                            enableResizing={
                                isBookingMode
                                    ? false
                                    : {
                                          top: true,
                                          right: true,
                                          bottom: true,
                                          left: true,
                                          topRight: true,
                                          bottomRight: true,
                                          bottomLeft: true,
                                          topLeft: true,
                                      }
                            }
                            resizeHandleStyles={
                                isBookingMode
                                    ? {}
                                    : {
                                          topRight: {
                                              width: '10px',
                                              height: '10px',
                                              background: '#3b82f6',
                                              border: '2px solid white',
                                              borderRadius: '50%',
                                              right: '-5px',
                                              top: '-5px',
                                          },
                                          bottomRight: {
                                              width: '10px',
                                              height: '10px',
                                              background: '#3b82f6',
                                              border: '2px solid white',
                                              borderRadius: '50%',
                                              right: '-5px',
                                              bottom: '-5px',
                                          },
                                          bottomLeft: {
                                              width: '10px',
                                              height: '10px',
                                              background: '#3b82f6',
                                              border: '2px solid white',
                                              borderRadius: '50%',
                                              left: '-5px',
                                              bottom: '-5px',
                                          },
                                          topLeft: {
                                              width: '10px',
                                              height: '10px',
                                              background: '#3b82f6',
                                              border: '2px solid white',
                                              borderRadius: '50%',
                                              left: '-5px',
                                              top: '-5px',
                                          },
                                      }
                            }
                            className={`
                                ${selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''}
                                ${isDragging ? 'z-50' : 'z-10'}
                                ${isBookingMode ? 'cursor-pointer' : 'cursor-move'}
                            `}
                        >
                            <TableElement
                                table={table}
                                isSelected={selectedTable?.id === table.id}
                                onClick={(e) => handleTableClick(table, e)}
                                isDragging={isDragging}
                                unable={
                                    selectableTables
                                        ? !selectableTables.includes(table.id)
                                        : (table as any).unable
                                }
                            />
                        </Rnd>
                    );
                })}

                {/* Instructions overlay when no tables */}
                {tables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 bg-white/80 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {modeView === 'booking'
                                    ? 'No tables available'
                                    : 'No tables yet'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {modeView === 'booking'
                                    ? 'This floor has no tables available for booking'
                                    : 'Click "Add Table" to create the first table for this floor'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Canvas Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                    <span>
                        Size: {canvasSize.width}×{canvasSize.height}
                    </span>
                    <span>Number of tables: {tables.length}</span>
                </div>
            </div>

            {/* Instructions - only show in edit mode */}
            {modeView === 'edit' && (
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-lg text-sm text-gray-600">
                    <div className="space-y-1">
                        <div>• Drag to move table</div>
                        <div>• Drag corner to resize</div>
                        <div>• Click to select table</div>
                    </div>
                </div>
            )}
        </div>
    );
}
