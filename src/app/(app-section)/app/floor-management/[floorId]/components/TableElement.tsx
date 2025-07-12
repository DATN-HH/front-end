'use client';

import { TableResponse, TableShape, TableType, getTableColor, getTableTypeLabel } from '@/api/v1/tables';
import { Users, Crown, Leaf, Home, Heart, Building, Cigarette, CigaretteOff, Accessibility } from 'lucide-react';

interface TableElementProps {
    table: TableResponse;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    isDragging: boolean;
}

export function TableElement({ table, isSelected, onClick, isDragging }: TableElementProps) {
    const getTableIcon = (tableType: TableType) => {
        const iconProps = { size: 16, className: "text-white" };

        switch (tableType) {
            case TableType.VIP:
                return <Crown {...iconProps} />;
            case TableType.OUTDOOR:
                return <Leaf {...iconProps} />;
            case TableType.PRIVATE:
                return <Home {...iconProps} />;
            case TableType.COUPLE:
                return <Heart {...iconProps} />;
            case TableType.FAMILY:
                return <Users {...iconProps} />;
            case TableType.BUSINESS:
                return <Building {...iconProps} />;
            case TableType.SMOKING:
                return <Cigarette {...iconProps} />;
            case TableType.NON_SMOKING:
                return <CigaretteOff {...iconProps} />;
            case TableType.WHEELCHAIR_ACCESSIBLE:
                return <Accessibility {...iconProps} />;
            default:
                return <Users {...iconProps} />;
        }
    };

    const renderTableShape = () => {
        const color = getTableColor(table.tableType);
        const icon = getTableIcon(table.tableType);

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