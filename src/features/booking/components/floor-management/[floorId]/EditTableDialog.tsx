'use client';

import {
  Crown,
  Table,
  TreePalm,
  Lock,
  Heart,
  Users,
  Briefcase,
  Cigarette,
  Ban,
  Accessibility,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useActiveTableTypes } from '@/api/v1/table-types';
import {
  TableShape,
  TableResponse,
  TableUpdateRequest,
  getTableShapeLabel,
  validateTableData,
} from '@/api/v1/tables';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TableUpdateRequest) => Promise<void>;
  table: TableResponse | null;
  isLoading: boolean;
}

// Icon mapping for table types
const iconMap: Record<string, any> = {
  Crown,
  Table,
  TreePalm,
  Lock,
  Heart,
  Users,
  Briefcase,
  Cigarette,
  Ban,
  Accessibility,
  crown: Crown,
  table: Table,
  'tree-palm': TreePalm,
  lock: Lock,
  heart: Heart,
  users: Users,
  briefcase: Briefcase,
  cigarette: Cigarette,
  ban: Ban,
  accessibility: Accessibility,
};

export function EditTableDialog({
  isOpen,
  onClose,
  onSubmit,
  table,
  isLoading,
}: EditTableDialogProps) {
  const [formData, setFormData] = useState<TableUpdateRequest>({
    tableName: '',
    capacity: 4,
    xRatio: 0.5,
    yRatio: 0.5,
    widthRatio: 0.15,
    heightRatio: 0.1,
    tableShape: TableShape.SQUARE,
    tableTypeId: 0, // Changed from tableType to tableTypeId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch active table types
  const { data: tableTypes = [], isLoading: isLoadingTableTypes } =
    useActiveTableTypes();

  // Update form data when table changes
  useEffect(() => {
    if (table) {
      setFormData({
        tableName: table.tableName,
        capacity: table.capacity,
        xRatio: table.xRatio ?? table.xratio ?? 0.5,
        yRatio: table.yRatio ?? table.yratio ?? 0.5,
        widthRatio: table.widthRatio,
        heightRatio: table.heightRatio,
        tableShape: table.tableShape,
        tableTypeId:
          typeof table.tableType === 'object' ? table.tableType.id : 0, // Handle both old and new format
      });
    }
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTableData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Table;
    return <IconComponent className="w-4 h-4" />;
  };

  const selectedTableType = tableTypes.find(
    (type) => type.id === formData.tableTypeId
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="tableName" className="text-sm font-medium">
              Table Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tableName"
              value={formData.tableName}
              onChange={(e) => handleInputChange('tableName', e.target.value)}
              placeholder="e.g: Table 1, VIP Table A..."
              disabled={isLoading}
            />
            {errors.tableName && (
              <p className="text-sm text-red-500">{errors.tableName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium">
              Capacity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="50"
              value={formData.capacity}
              onChange={(e) =>
                handleInputChange('capacity', parseInt(e.target.value))
              }
              disabled={isLoading}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tableShape" className="text-sm font-medium">
                Table Shape <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tableShape}
                onValueChange={(value) =>
                  handleInputChange('tableShape', value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TableShape).map((shape) => (
                    <SelectItem key={shape} value={shape}>
                      {getTableShapeLabel(shape)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tableShape && (
                <p className="text-sm text-red-500">{errors.tableShape}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableTypeId" className="text-sm font-medium">
                Table Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tableTypeId.toString()}
                onValueChange={(value) =>
                  handleInputChange('tableTypeId', parseInt(value))
                }
                disabled={isLoading || isLoadingTableTypes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select table type">
                    {selectedTableType && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: selectedTableType.color,
                          }}
                        >
                          {getIcon(selectedTableType.icon)}
                        </div>
                        <span>{selectedTableType.tableType}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tableTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: type.color,
                          }}
                        >
                          {getIcon(type.icon)}
                        </div>
                        <span>{type.tableType}</span>
                        {type.depositForBooking > 0 && (
                          <span className="text-xs text-gray-500">
                            (+
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(type.depositForBooking)}
                            )
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tableTypeId && (
                <p className="text-sm text-red-500">{errors.tableTypeId}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Position & Size</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xRatio" className="text-sm font-medium">
                  X Position (0-1)
                </Label>
                <Input
                  id="xRatio"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.xRatio}
                  onChange={(e) =>
                    handleInputChange('xRatio', parseFloat(e.target.value))
                  }
                  disabled={isLoading}
                />
                {errors.xRatio && (
                  <p className="text-sm text-red-500">{errors.xRatio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yRatio" className="text-sm font-medium">
                  Y Position (0-1)
                </Label>
                <Input
                  id="yRatio"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.yRatio}
                  onChange={(e) =>
                    handleInputChange('yRatio', parseFloat(e.target.value))
                  }
                  disabled={isLoading}
                />
                {errors.yRatio && (
                  <p className="text-sm text-red-500">{errors.yRatio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="widthRatio" className="text-sm font-medium">
                  Width (0.01-1)
                </Label>
                <Input
                  id="widthRatio"
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={formData.widthRatio}
                  onChange={(e) =>
                    handleInputChange('widthRatio', parseFloat(e.target.value))
                  }
                  disabled={isLoading}
                />
                {errors.widthRatio && (
                  <p className="text-sm text-red-500">{errors.widthRatio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heightRatio" className="text-sm font-medium">
                  Height (0.01-1)
                </Label>
                <Input
                  id="heightRatio"
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={formData.heightRatio}
                  onChange={(e) =>
                    handleInputChange('heightRatio', parseFloat(e.target.value))
                  }
                  disabled={isLoading}
                />
                {errors.heightRatio && (
                  <p className="text-sm text-red-500">{errors.heightRatio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedTableType && (
            <div className="bg-gray-50 p-4 rounded-lg border-t">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    backgroundColor: selectedTableType.color,
                  }}
                >
                  {getIcon(selectedTableType.icon)}
                </div>
                <div>
                  <div className="font-medium">
                    {formData.tableName || 'Table Name'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedTableType.tableType} • {formData.capacity} seats
                  </div>
                  {selectedTableType.depositForBooking > 0 && (
                    <div className="text-xs text-gray-500">
                      Deposit:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(selectedTableType.depositForBooking)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Helper text */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can also adjust position and size by
              dragging directly on the canvas.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingTableTypes}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
