'use client';

import { useState } from 'react';
import { X, Filter, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    type FilterDefinition,
    type OperatorOption,
    OperandType,
} from './types';
import { OperatorType, SearchCondition } from '@/lib/response-object';

interface AdvancedFilterProps {
    filterDefinitions: FilterDefinition[];
    filters: SearchCondition[];
    onFiltersChange: (filters: SearchCondition[]) => void;
}

const getOperatorsForType = (type: OperandType): OperatorOption[] => {
    switch (type) {
        case OperandType.STRING:
            return [
                { value: 'CONTAIN', label: 'Contains' },
                { value: 'START_WITH', label: 'Starts with' },
                { value: 'END_WITH', label: 'Ends with' },
            ];
        case OperandType.INTEGER:
        case OperandType.DECIMAL:
            return [
                { value: 'EQUAL', label: 'Equals' },
                { value: 'GREATER_EQUAL', label: 'Greater than or equal' },
                { value: 'LESS_EQUAL', label: 'Less than or equal' },
                { value: 'BETWEEN', label: 'Between' },
            ];
        case OperandType.DATE:
        case OperandType.TIME:
        case OperandType.DATETIME:
            return [
                { value: 'EQUAL', label: 'Equals' },
                { value: 'GREATER_EQUAL', label: 'After' },
                { value: 'LESS_EQUAL', label: 'Before' },
                { value: 'BETWEEN', label: 'Between' },
            ];
        case OperandType.BOOLEAN:
            return [{ value: 'EQUAL', label: 'Is' }];
        case OperandType.ENUM:
            return [
                { value: 'EQUAL', label: 'Is' },
                { value: 'IN', label: 'Is one of' },
            ];
        default:
            return [];
    }
};

export function AdvancedFilter({
    filterDefinitions,
    filters,
    onFiltersChange,
}: AdvancedFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newFilter, setNewFilter] = useState<SearchCondition>({
        fieldName: filterDefinitions[0]?.field || '',
        operandType: filterDefinitions[0]?.type || OperandType.STRING,
        operatorType: OperatorType.CONTAIN,
        data: undefined,
        datas: undefined,
        label: undefined,
        minDate: undefined,
        maxDate: undefined,
        min: undefined,
        max: undefined,
    });
    const [activeField, setActiveField] = useState<FilterDefinition | null>(
        filterDefinitions[0] || null
    );
    const [tempValue, setTempValue] = useState<string>('');
    const [tempValueEnd, setTempValueEnd] = useState<string>('');

    const handleAddFilter = () => {
        if (!activeField || !newFilter.operatorType) return;

        const filterToAdd: SearchCondition = {
            fieldName: activeField.field,
            operandType: activeField.type,
            operatorType: newFilter.operatorType,
            label: activeField.label,
            data: undefined,
            datas: undefined,
            minDate: undefined,
            maxDate: undefined,
            min: undefined,
            max: undefined,
        };

        // Handle BETWEEN operator
        if (newFilter.operatorType === OperatorType.BETWEEN) {
            if (
                activeField.type === OperandType.DATE ||
                activeField.type === OperandType.TIME ||
                activeField.type === OperandType.DATETIME
            ) {
                filterToAdd.datas = [tempValue, tempValueEnd];
                filterToAdd.minDate = tempValue;
                filterToAdd.maxDate = tempValueEnd;
            } else if (
                activeField.type === OperandType.INTEGER ||
                activeField.type === OperandType.DECIMAL
            ) {
                filterToAdd.datas = [tempValue, tempValueEnd];
                filterToAdd.min = tempValue;
                filterToAdd.max = tempValueEnd;
            } else {
                filterToAdd.datas = [tempValue, tempValueEnd];
            }
        } else {
            // Handle other operators
            filterToAdd.data = tempValue;
        }

        onFiltersChange([...filters, filterToAdd]);

        // Reset form
        setTempValue('');
        setTempValueEnd('');
        setNewFilter({
            fieldName: activeField.field,
            operandType: activeField.type,
            operatorType: OperatorType.CONTAIN,
            data: undefined,
            datas: undefined,
            label: undefined,
            minDate: undefined,
            maxDate: undefined,
            min: undefined,
            max: undefined,
        });
    };

    const handleRemoveFilter = (index: number) => {
        const newFilters = [...filters];
        newFilters.splice(index, 1);
        onFiltersChange(newFilters);
    };

    const handleResetFilters = () => {
        onFiltersChange([]);
    };

    const handleFieldChange = (fieldId: string) => {
        const field =
            filterDefinitions.find((f) => f.field === fieldId) || null;
        setActiveField(field);
        setTempValue(field?.type === OperandType.BOOLEAN ? 'true' : '');
        setTempValueEnd('');

        if (field) {
            setNewFilter({
                fieldName: field.field,
                operandType: field.type,
                operatorType: OperatorType.CONTAIN,
                data: undefined,
                datas: undefined,
                label: field.label,
                minDate: undefined,
                maxDate: undefined,
                min: undefined,
                max: undefined,
            });
        }
    };

    const handleOperatorChange = (operatorValue: string) => {
        setNewFilter({
            ...newFilter,
            operatorType: operatorValue as OperatorType,
        });
        setTempValue('');
        setTempValueEnd('');
    };

    const renderValueInput = () => {
        if (!activeField) return null;

        switch (activeField.type) {
            case OperandType.STRING:
                return (
                    <Input
                        placeholder="Enter text..."
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                );

            case OperandType.INTEGER:
                return (
                    <div className="space-y-3">
                        <Input
                            type="number"
                            placeholder="Enter number..."
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {newFilter.operatorType === OperatorType.BETWEEN && (
                            <>
                                <div className="text-center text-xs text-muted-foreground font-medium">
                                    AND
                                </div>
                                <Input
                                    type="number"
                                    placeholder="Enter end number..."
                                    value={tempValueEnd}
                                    onChange={(e) =>
                                        setTempValueEnd(e.target.value)
                                    }
                                    className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </>
                        )}
                    </div>
                );

            case OperandType.DECIMAL:
                return (
                    <div className="space-y-3">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter decimal..."
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {newFilter.operatorType === OperatorType.BETWEEN && (
                            <>
                                <div className="text-center text-xs text-muted-foreground font-medium">
                                    AND
                                </div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter end decimal..."
                                    value={tempValueEnd}
                                    onChange={(e) =>
                                        setTempValueEnd(e.target.value)
                                    }
                                    className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </>
                        )}
                    </div>
                );

            case OperandType.DATE:
            case OperandType.DATETIME:
                return (
                    <div className="space-y-3">
                        <DatePicker
                            date={tempValue ? new Date(tempValue) : undefined}
                            setDate={(date) =>
                                setTempValue(date?.toISOString() || '')
                            }
                            className="w-full"
                        />
                        {newFilter.operatorType === OperatorType.BETWEEN && (
                            <>
                                <div className="text-center text-xs text-muted-foreground font-medium">
                                    AND
                                </div>
                                <DatePicker
                                    date={
                                        tempValueEnd
                                            ? new Date(tempValueEnd)
                                            : undefined
                                    }
                                    setDate={(date) =>
                                        setTempValueEnd(
                                            date?.toISOString() || ''
                                        )
                                    }
                                    className="w-full"
                                />
                            </>
                        )}
                    </div>
                );

            case OperandType.TIME:
                return (
                    <div className="space-y-3">
                        <Input
                            type="time"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {newFilter.operatorType === OperatorType.BETWEEN && (
                            <>
                                <div className="text-center text-xs text-muted-foreground font-medium">
                                    AND
                                </div>
                                <Input
                                    type="time"
                                    value={tempValueEnd}
                                    onChange={(e) =>
                                        setTempValueEnd(e.target.value)
                                    }
                                    className="w-full border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </>
                        )}
                    </div>
                );

            case OperandType.BOOLEAN:
                return (
                    <Select
                        value={tempValue}
                        onValueChange={(value) => setTempValue(value)}
                    >
                        <SelectTrigger className="w-full border-input focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select value..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                    </Select>
                );

            case OperandType.ENUM:
                return (
                    <Select
                        value={tempValue}
                        onValueChange={(value) => setTempValue(value)}
                    >
                        <SelectTrigger className="w-full border-input focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select option..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            {activeField.options?.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            default:
                return null;
        }
    };

    const getFilterLabel = (filter: SearchCondition) => {
        const field = filterDefinitions.find(
            (f) => f.field === filter.fieldName
        );
        if (!field) return '';

        const operatorOptions = getOperatorsForType(field.type);
        const operator = operatorOptions.find(
            (o) => o.value === filter.operatorType
        );

        let valueLabel = '';

        // Handle BETWEEN operator
        if (filter.operatorType === OperatorType.BETWEEN) {
            if (
                field.type === OperandType.DATE ||
                field.type === OperandType.TIME ||
                field.type === OperandType.DATETIME
            ) {
                const minLabel = filter.minDate
                    ? new Date(filter.minDate).toLocaleDateString()
                    : '';
                const maxLabel = filter.maxDate
                    ? new Date(filter.maxDate).toLocaleDateString()
                    : '';
                valueLabel = `${minLabel} and ${maxLabel}`;
            } else if (
                field.type === OperandType.INTEGER ||
                field.type === OperandType.DECIMAL
            ) {
                valueLabel = `${filter.min} and ${filter.max}`;
            } else if (filter.datas && filter.datas.length === 2) {
                valueLabel = `${filter.datas[0]} and ${filter.datas[1]}`;
            }
        } else {
            // Handle other operators
            switch (field.type) {
                case OperandType.BOOLEAN:
                    valueLabel = filter.data === 'true' ? 'True' : 'False';
                    break;
                case OperandType.ENUM:
                    valueLabel =
                        field.options?.find((o) => o.value === filter.data)
                            ?.label || String(filter.data);
                    break;
                case OperandType.DATE:
                case OperandType.DATETIME:
                    valueLabel = filter.data
                        ? new Date(filter.data as string).toLocaleDateString()
                        : '';
                    break;
                default:
                    valueLabel = String(filter.data);
            }
        }

        return `${field.label} ${operator?.label || ''} ${valueLabel}`;
    };

    const isFilterValid = () => {
        if (!newFilter.fieldName || !newFilter.operatorType) return false;

        // Check if value is provided
        if (!tempValue && tempValue !== '0' && tempValue !== 'false')
            return false;

        // For 'between' operator, check if end value is provided
        if (
            newFilter.operatorType === OperatorType.BETWEEN &&
            !tempValueEnd &&
            tempValueEnd !== '0'
        ) {
            return false;
        }

        return true;
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Active Filters Display */}
            {filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Filter className="h-4 w-4" />
                        Active Filters:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1.5 bg-primary/15 text-primary border-primary/30 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                                <span>{getFilterLabel(filter)}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveFilter(index)}
                                    className="h-4 w-4 p-0 hover:bg-primary/30 rounded-full ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetFilters}
                        className="text-primary hover:text-primary-foreground hover:bg-primary h-8 px-3 rounded-md"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Clear All
                    </Button>
                </div>
            )}

            {/* Add Filter Button */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        <Filter className="h-4 w-4" />
                        Add Filter
                        {filters.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-primary/15 text-primary ml-1"
                            >
                                {filters.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-96 p-0 bg-popover border-border shadow-xl rounded-xl"
                    align="start"
                >
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Filter className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">
                                    Add New Filter
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Create a new filter condition
                                </p>
                            </div>
                        </div>

                        {/* Filter Configuration */}
                        <div className="space-y-5">
                            {/* Field Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">
                                    Field
                                </Label>
                                <Select
                                    value={newFilter.fieldName}
                                    onValueChange={handleFieldChange}
                                >
                                    <SelectTrigger className="border-input focus:ring-2 focus:ring-primary/20 h-11">
                                        <SelectValue placeholder="Choose a field to filter..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        {filterDefinitions.map((field) => (
                                            <SelectItem
                                                key={field.field}
                                                value={field.field}
                                                className="hover:bg-accent"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{field.label}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {field.type}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Operator Selection */}
                            {activeField && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Condition
                                    </Label>
                                    <Select
                                        value={newFilter.operatorType}
                                        onValueChange={handleOperatorChange}
                                    >
                                        <SelectTrigger className="border-input focus:ring-2 focus:ring-primary/20 h-11">
                                            <SelectValue placeholder="Select condition..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            {getOperatorsForType(
                                                activeField.type
                                            ).map((operator) => (
                                                <SelectItem
                                                    key={operator.value}
                                                    value={operator.value}
                                                    className="hover:bg-accent"
                                                >
                                                    {operator.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Value Input */}
                            {newFilter.operatorType && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        {newFilter.operatorType ===
                                        OperatorType.BETWEEN
                                            ? 'Value Range'
                                            : 'Value'}
                                    </Label>
                                    {renderValueInput()}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    handleAddFilter();
                                    setIsOpen(false);
                                }}
                                disabled={!isFilterValid()}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Filter
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="border-input hover:bg-accent"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
