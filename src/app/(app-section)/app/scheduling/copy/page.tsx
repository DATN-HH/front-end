'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Copy, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/layouts/app-section/page-title';

// Mock branches
const mockBranches = [
    { id: 1, name: 'Downtown Branch' },
    { id: 2, name: 'Uptown Branch' },
    { id: 3, name: 'Westside Branch' },
];

export default function CopySchedulePage() {
    const [selectedBranch, setSelectedBranch] = useState<number>(1);
    const [fromDate, setFromDate] = useState<Date>(
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [toDate, setToDate] = useState<Date>(
        addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7)
    );
    const [copyMode, setCopyMode] = useState<'day' | 'week' | 'custom'>('week');
    const [numberOfDays, setNumberOfDays] = useState<number>(7);
    const [saveAsDraft, setSaveAsDraft] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [previewData, setPreviewData] = useState<any[]>([]);

    // Format date for display
    const formatDate = (date: Date) => {
        return format(date, 'MMMM d, yyyy');
    };

    // Handle copy mode change
    const handleCopyModeChange = (mode: 'day' | 'week' | 'custom') => {
        setCopyMode(mode);

        // Update number of days based on mode
        if (mode === 'day') {
            setNumberOfDays(1);
        } else if (mode === 'week') {
            setNumberOfDays(7);
        }
    };

    // Generate preview data
    const generatePreview = () => {
        // In a real app, this would fetch data from the API
        // For now, we'll generate mock data

        const fromDateStr = format(fromDate, 'yyyy-MM-dd');
        const toDateStr = format(toDate, 'yyyy-MM-dd');

        // Generate mock shifts for the preview
        const mockShifts = [
            {
                date: fromDateStr,
                staff: { fullName: 'John Doe' },
                shift: { startTime: '08:00:00', endTime: '12:00:00' },
            },
            {
                date: fromDateStr,
                staff: { fullName: 'Emily Clark' },
                shift: { startTime: '08:00:00', endTime: '12:00:00' },
            },
            {
                date: format(addDays(parseISO(fromDateStr), 1), 'yyyy-MM-dd'),
                staff: { fullName: 'Mike Johnson' },
                shift: { startTime: '12:00:00', endTime: '16:00:00' },
            },
            {
                date: format(addDays(parseISO(fromDateStr), 2), 'yyyy-MM-dd'),
                staff: { fullName: 'Sarah Adams' },
                shift: { startTime: '16:00:00', endTime: '20:00:00' },
            },
        ];

        setPreviewData(mockShifts);
    };

    // Handle copy schedule
    const handleCopySchedule = () => {
        setIsProcessing(true);

        // In a real app, this would call the API
        // For now, we'll simulate an API call
        setTimeout(() => {
            setIsProcessing(false);
            //   toast({
            //     title: "Schedule copied",
            //     description: `Schedule has been copied from ${formatDate(fromDate)} to ${formatDate(toDate)}${
            //       saveAsDraft ? " and saved as draft" : ""
            //     }.`,
            //   })
        }, 1500);
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <PageTitle
                    icon={Copy}
                    title="Copy Schedule"
                    left={
                        <Button
                            onClick={generatePreview}
                            disabled={isProcessing}
                            variant="outline"
                        >
                            Generate Preview
                        </Button>
                    }
                />

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left column - Copy Settings */}
                    <Card className="md:col-span-5">
                        <CardHeader>
                            <CardTitle>Copy Settings</CardTitle>
                            <CardDescription>
                                Configure how you want to copy the schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Branch
                                </label>
                                <Select
                                    value={selectedBranch.toString()}
                                    onValueChange={(value) =>
                                        setSelectedBranch(Number(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockBranches.map((branch) => (
                                            <SelectItem
                                                key={branch.id}
                                                value={branch.id.toString()}
                                            >
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    From Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(fromDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={fromDate}
                                            onSelect={(date) =>
                                                date && setFromDate(date)
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Copy Mode
                                </label>
                                <Tabs
                                    defaultValue="week"
                                    onValueChange={(value) =>
                                        handleCopyModeChange(value as any)
                                    }
                                >
                                    <TabsList className="w-full">
                                        <TabsTrigger
                                            value="day"
                                            className="flex-1"
                                        >
                                            Day
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="week"
                                            className="flex-1"
                                        >
                                            Week
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="custom"
                                            className="flex-1"
                                        >
                                            Custom
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {copyMode === 'custom' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Number of Days
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={numberOfDays}
                                        onChange={(e) =>
                                            setNumberOfDays(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    To Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(toDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={toDate}
                                            onSelect={(date) =>
                                                date && setToDate(date)
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="draft"
                                    checked={saveAsDraft}
                                    onCheckedChange={(checked) =>
                                        setSaveAsDraft(!!checked)
                                    }
                                />
                                <label
                                    htmlFor="draft"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Save as draft (unpublished)
                                </label>
                            </div>

                            <div className="pt-4 flex flex-col gap-2">
                                <Button onClick={generatePreview}>
                                    Preview
                                </Button>
                                <Button
                                    onClick={handleCopySchedule}
                                    disabled={isProcessing}
                                    className="gap-2"
                                >
                                    {isProcessing
                                        ? 'Processing...'
                                        : 'Copy Schedule'}
                                    {!isProcessing && (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right column - Preview */}
                    <Card className="md:col-span-7">
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>
                                Preview of shifts that will be copied from{' '}
                                {formatDate(fromDate)} to {formatDate(toDate)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {previewData.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-4 py-2 bg-muted/50 rounded-md">
                                        <div className="flex-1">
                                            Source Date
                                        </div>
                                        <ArrowRight className="h-4 w-4 mx-4" />
                                        <div className="flex-1">
                                            Target Date
                                        </div>
                                    </div>

                                    {previewData.map((shift, index) => {
                                        const sourceDate = parseISO(shift.date);
                                        const targetDate = addDays(
                                            sourceDate,
                                            numberOfDays
                                        );

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border rounded-md p-3"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {format(
                                                            sourceDate,
                                                            'EEE, MMM d'
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {shift.staff.fullName} •{' '}
                                                        {shift.shift.startTime.substring(
                                                            0,
                                                            5
                                                        )}
                                                        -
                                                        {shift.shift.endTime.substring(
                                                            0,
                                                            5
                                                        )}
                                                    </div>
                                                </div>

                                                <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />

                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {format(
                                                            targetDate,
                                                            'EEE, MMM d'
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {shift.staff.fullName} •{' '}
                                                        {shift.shift.startTime.substring(
                                                            0,
                                                            5
                                                        )}
                                                        -
                                                        {shift.shift.endTime.substring(
                                                            0,
                                                            5
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="text-sm text-muted-foreground pt-2">
                                        <p>
                                            Total shifts to be copied:{' '}
                                            {previewData.length}
                                        </p>
                                        <p>
                                            Status:{' '}
                                            {saveAsDraft
                                                ? 'Will be saved as draft'
                                                : 'Will be published immediately'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Copy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No preview available</p>
                                    <p className="text-sm">
                                        Click the Preview button to see what
                                        will be copied
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
