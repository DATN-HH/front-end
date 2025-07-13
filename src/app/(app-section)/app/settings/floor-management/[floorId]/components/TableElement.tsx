'use client';

import { TableResponse, TableShape, getTableColor, getTableIcon } from '@/api/v1/tables';
import { Users } from 'lucide-react';
import { getIconByName } from '@/lib/icon-utils';

interface TableElementProps {
    table: TableResponse;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    isDragging: boolean;
}

export function TableElement({ table, isSelected, onClick, isDragging }: TableElementProps) {
    const getTableTypeDisplay = (tableType: any) => {
        if (typeof tableType === 'object' && tableType) {
            return {
                color: tableType.color,
                icon: tableType.icon
            };
        }
        // Legacy fallback for old enum values
        return {
            color: getTableColor(tableType),
            icon: getTableIcon(tableType)
        };
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent size={16} className="text-white" />;
    };

    const renderTableShape = () => {
        const tableTypeInfo = getTableTypeDisplay(table.tableType);
        const color = tableTypeInfo.color;
        const icon = renderIcon(tableTypeInfo.icon);

        const commonClasses = `
            w-full h-full flex flex-col items-center justify-center
            text-white font-medium cursor-pointer
            transition-all duration-200
            ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
            ${isDragging ? 'opacity-80' : 'hover:opacity-90'}
        `;

        const content = (
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    {icon}
                    <span className="text-xs font-semibold truncate px-1">
                        {table.tableName}
                    </span>
                </div>
                <div className="text-xs opacity-90">
                    {table.capacity} seats
                </div>
            </div>
        );

        switch (table.tableShape) {
            case TableShape.SQUARE:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={onClick}
                    >
                        {content}
                    </div>
                );

            case TableShape.RECTANGLE:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={onClick}
                    >
                        {content}
                    </div>
                );

            case TableShape.ROUND:
                return (
                    <div
                        className={`${commonClasses} rounded-full border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={onClick}
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
                            borderRadius: '50%'
                        }}
                        onClick={onClick}
                    >
                        {content}
                    </div>
                );

            default:
                return (
                    <div
                        className={`${commonClasses} rounded-lg border-2 border-white/20`}
                        style={{ backgroundColor: color }}
                        onClick={onClick}
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