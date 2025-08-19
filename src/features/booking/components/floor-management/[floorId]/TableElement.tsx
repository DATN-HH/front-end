'use client';

import { POSTableStatus } from '@/api/v1/pos-table-status';
import { TableResponse, TableShape } from '@/api/v1/tables';
import { getIconByName } from '@/lib/icon-utils';

interface TableElementProps {
    table: TableResponse & {
        posStatus?: POSTableStatus;
        estimatedAvailableTime?: string;
        occupancyDetails?: any; // Add occupancy details
    };
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    isDragging: boolean;
    unable?: boolean; // New prop - if true, table appears disabled/unavailable
    modeView?: 'edit' | 'booking'; // Add mode view prop
    isSelectable?: boolean; // Add selectable prop
}

export function TableElement({
    table,
    isSelected,
    onClick,
    isDragging,
    unable = false,
    modeView = 'edit',
    isSelectable = true,
}: TableElementProps) {
    const getTableTypeDisplay = (tableType: any) => {
        if (typeof tableType === 'object' && tableType) {
            return {
                color: tableType.color,
                icon: tableType.icon,
            };
        }
        // Legacy fallback for old enum values
        return {
            color: tableType.color,
            icon: tableType.icon,
        };
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent size={16} className="text-white" />;
    };

    const renderTableShape = () => {
        const tableTypeInfo = getTableTypeDisplay(table.tableType);

        // In booking mode, allow clicking on booking tables (both current and upcoming) even if they appear occupied
        const isBookingTable =
            table.occupancyDetails?.occupationType === 'BOOKING_TABLE';
        const isUpcomingBooking =
            table.occupancyDetails?.occupationType === 'UPCOMING_BOOKING';
        const isAnyBooking = isBookingTable || isUpcomingBooking;

        // Force booking tables to be clickable in booking mode
        const shouldAllowClick =
            modeView === 'booking'
                ? isAnyBooking || (isSelectable && !unable)
                : isSelectable && !unable;

        // Keep original table type color, only gray out when unable and not a clickable booking
        const color =
            unable && !(modeView === 'booking' && isAnyBooking)
                ? '#9ca3af'
                : tableTypeInfo.color;
        const icon = renderIcon(tableTypeInfo.icon);

        const commonClasses = `
            w-full h-full flex flex-col items-center justify-center
            text-white font-medium transition-all duration-200
            ${shouldAllowClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
            ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
            ${isDragging ? 'opacity-80' : shouldAllowClick ? 'hover:opacity-90' : ''}
            ${unable && !(modeView === 'booking' && isAnyBooking) ? 'grayscale' : ''}
        `;

        const content = (
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="hidden sm:block">{icon}</span>
                    <span className="text-xs sm:text-xs md:text-sm lg:text-xs xl:text-sm font-semibold truncate px-1">
                        {table.tableName}
                    </span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-xs xl:text-sm opacity-90 hidden sm:block">
                    {table.capacity} seats
                </div>
            </div>
        );

        // Always allow click for any booking tables in booking mode, regardless of other conditions
        const handleClick =
            modeView === 'booking' && isAnyBooking
                ? onClick
                : shouldAllowClick
                  ? onClick
                  : undefined;

        switch (table.tableShape) {
            case TableShape.SQUARE:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={handleClick}
                    >
                        {content}
                    </div>
                );

            case TableShape.RECTANGLE:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={handleClick}
                    >
                        {content}
                    </div>
                );

            case TableShape.ROUND:
                return (
                    <div
                        className={`${commonClasses} rounded-full border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={handleClick}
                    >
                        {content}
                    </div>
                );

            case TableShape.OVAL:
                return (
                    <div
                        className={`${commonClasses} border-2 border-white/20`}
                        style={{
                            backgroundColor: color,
                            borderRadius: '50%',
                        }}
                        onClick={handleClick}
                    >
                        {content}
                    </div>
                );

            default:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={handleClick}
                    >
                        {content}
                    </div>
                );
        }
    };

    return (
        <div className="relative w-full h-full">
            {renderTableShape()}

            {/* Table status indicator */}
            {table.status !== 'ACTIVE' && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            )}

            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            )}
        </div>
    );
}
