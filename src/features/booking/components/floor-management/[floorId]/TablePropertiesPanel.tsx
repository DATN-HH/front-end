'use client';

import { format } from 'date-fns';
import { Edit, Trash2, Users, MapPin } from 'lucide-react';

import { formatCurrency } from '@/api/v1/table-types';
import {
  TableResponse,
  getTableShapeLabel,
  getTableIcon,
  getTableColor,
} from '@/api/v1/tables';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconByName } from '@/lib/icon-utils';

interface TablePropertiesPanelProps {
  selectedTable: TableResponse | null;
  onEdit: (table: TableResponse) => void;
  onDelete: (table: TableResponse) => void;
}

export function TablePropertiesPanel({
  selectedTable,
  onEdit,
  onDelete,
}: TablePropertiesPanelProps) {
  const renderIcon = (iconName: string) => {
    const IconComponent = getIconByName(iconName);
    return <IconComponent className="w-4 h-4" />;
  };

  const getTableTypeDisplay = (tableType: any) => {
    if (typeof tableType === 'object' && tableType) {
      return {
        name: tableType.tableType,
        color: tableType.color,
        icon: tableType.icon,
        deposit: tableType.depositForBooking,
      };
    }
    // Legacy fallback for old enum values
    return {
      name: typeof tableType === 'string' ? tableType : 'Unknown',
      color: getTableColor(tableType),
      icon: getTableIcon(tableType),
      deposit: 0,
    };
  };

  if (!selectedTable) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No table selected
          </h3>
          <p className="text-gray-600 text-sm">
            Click on a table to view detailed information
          </p>
        </div>
      </div>
    );
  }

  const tableTypeInfo = getTableTypeDisplay(selectedTable.tableType);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Table Information
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="break-words">{selectedTable.tableName}</span>
              <Badge
                variant={
                  selectedTable.status === 'ACTIVE' ? 'default' : 'secondary'
                }
              >
                {selectedTable.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ID</span>
                <p className="text-sm">{selectedTable.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Capacity
                </span>
                <p className="text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedTable.capacity} people
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Shape</span>
                <p className="text-sm">
                  {getTableShapeLabel(selectedTable.tableShape)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      backgroundColor: tableTypeInfo.color,
                    }}
                  >
                    {renderIcon(tableTypeInfo.icon)}
                  </div>
                  <span className="text-sm break-words">
                    {tableTypeInfo.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit information */}
            {tableTypeInfo.deposit > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Booking Deposit
                </span>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(tableTypeInfo.deposit)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Position & Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Position & Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  X Position
                </span>
                <p className="text-sm">
                  {(
                    (selectedTable.xRatio ?? selectedTable.xratio ?? 0.5) * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Y Position
                </span>
                <p className="text-sm">
                  {(
                    (selectedTable.yRatio ?? selectedTable.yratio ?? 0.5) * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Width</span>
                <p className="text-sm">
                  {(selectedTable.widthRatio * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Height
                </span>
                <p className="text-sm">
                  {(selectedTable.heightRatio * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Created</span>
              <p className="text-sm">
                {format(new Date(selectedTable.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Last Updated
              </span>
              <p className="text-sm">
                {format(new Date(selectedTable.updatedAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Usage Instructions
            </h4>
            <div className="space-y-1 text-xs text-blue-800">
              <p>• Drag to move table</p>
              <p>• Drag corners to resize</p>
              <p>• Double click to edit information</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="border-t p-4 space-y-2">
        <Button onClick={() => onEdit(selectedTable)} className="w-full gap-2">
          <Edit className="w-4 h-4" />
          Edit Table
        </Button>
        <Button
          variant="outline"
          onClick={() => onDelete(selectedTable)}
          className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          Delete Table
        </Button>
      </div>
    </div>
  );
}
