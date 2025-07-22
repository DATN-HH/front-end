'use client';

import { Building, Timer } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { useBranches } from '@/api/v1/branches';
import { useFloorsByBranch } from '@/api/v1/floors';
import {
    useCreateBooking,
    CreateBookingRequest,
    CreateBookingResponse,
} from '@/api/v1/table-booking';
import {
    useFloorTablesStatus,
    TableStatus,
    AvailableTable,
} from '@/api/v1/table-status';
import { formatCurrency } from '@/api/v1/table-types';
import { useTablesByFloor, TableResponse } from '@/api/v1/tables';
import { WaitlistResponseDto } from '@/api/v1/waitlist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BookingConfirmDialog } from '@/features/booking/components/table-booking/BookingConfirmDialog';
import { BookingForm } from '@/features/booking/components/table-booking/BookingForm';
import { DateTimeSelector } from '@/features/booking/components/table-booking/DateTimeSelector';
import { LocationSelector } from '@/features/booking/components/table-booking/LocationSelector';
import { MultiSelectFloorCanvas } from '@/features/booking/components/table-booking/MultiSelectFloorCanvas';
import { WaitlistCard } from '@/features/waitlist/components/WaitlistCard';
import { WaitlistForm } from '@/features/waitlist/components/WaitlistForm';
import { getIconByName } from '@/lib/icon-utils';
import { useCustomToast } from '@/lib/show-toast';

interface BookingData {
    startTime: string;
    duration: number; // Duration in hours
    guests: number;
    notes: string;
    branchId: number;
    floorId: number;
    tableIds: number[]; // Changed from single tableId to array
    customerName: string;
    customerPhone: string;
    customerEmail: string;
}

export default function TableBookingPage() {
    // Basic selection state
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedTables, setSelectedTables] = useState<TableResponse[]>([]); // Changed to array

    // Separate date and hour selection
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        // Default to today
        return new Date().toISOString().split('T')[0];
    });
    const [selectedHour, setSelectedHour] = useState<number>(() => {
        // Default to current hour + 1
        const now = new Date();
        return (now.getHours() + 1) % 24;
    });

    const [bookingData, setBookingData] = useState<BookingData>({
        startTime: '',
        duration: 1, // Default 1 hour
        guests: 2,
        notes: '',
        branchId: 0,
        floorId: 0,
        tableIds: [], // Changed to array
        customerName: 'John Doe', // Fake user data
        customerPhone: '0345888777', // Fake user data
        customerEmail: '', // Optional email field
    });

    // Dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [bookingResponse, setBookingResponse] =
        useState<CreateBookingResponse | null>(null);

    // Waitlist state
    const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
    const [selectedWaitlist, setSelectedWaitlist] =
        useState<WaitlistResponseDto | null>(null);

    // Toast hook
    const { success, error } = useCustomToast();

    // API hooks for basic data
    const { data: branches = [], isLoading: branchesLoading } = useBranches();
    const { data: floors = [], isLoading: floorsLoading } = useFloorsByBranch(
        selectedBranch || 0
    );
    const { data: floorData, isLoading: tablesLoading } = useTablesByFloor(
        selectedFloor || 0
    );

    // Booking API
    const createBookingMutation = useCreateBooking();

    // Compute selectedDateTime string directly without timezone conversion
    const selectedDateTimeString = useMemo(() => {
        if (!selectedDate) return '';
        // Create datetime string directly: YYYY-MM-DDTHH:mm:ss
        const hourString = selectedHour.toString().padStart(2, '0');
        return `${selectedDate}T${hourString}:00:00`;
    }, [selectedDate, selectedHour]);

    // Create Date object for other uses (like booking data)
    const selectedDateTime = useMemo(() => {
        if (!selectedDate) return null;
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateTime = new Date(year, month - 1, day, selectedHour, 0, 0, 0);
        return dateTime;
    }, [selectedDate, selectedHour]);

    // API hooks for floor tables status - use the string directly
    const formattedDateTime = selectedDateTimeString;

    const {
        data: floorTablesStatus,
        isLoading: floorStatusLoading,
        error: floorStatusError,
    } = useFloorTablesStatus(
        selectedFloor ?? 0,
        formattedDateTime,
        bookingData.duration,
        !!(
            selectedFloor &&
            selectedDate &&
            formattedDateTime &&
            bookingData.duration
        )
    );

    // Reset selections when parent changes
    useEffect(() => {
        setSelectedFloor(null);
        setSelectedTables([]); // Reset to empty array
        // Reset to default date and hour
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedHour((new Date().getHours() + 1) % 24);
    }, [selectedBranch]);

    useEffect(() => {
        setSelectedTables([]); // Reset to empty array
    }, [selectedFloor]);

    // Update booking data when selections change
    useEffect(() => {
        if (selectedDateTime) {
            setBookingData((prev) => ({
                ...prev,
                startTime: selectedDateTime.toISOString().slice(0, 16),
            }));
        }
    }, [selectedDateTime]);

    const handleBranchChange = useCallback((branchId: string) => {
        const id = parseInt(branchId);
        setSelectedBranch(id);
        setBookingData((prev) => ({ ...prev, branchId: id }));
    }, []);

    const handleFloorChange = useCallback((floorId: string) => {
        const id = parseInt(floorId);
        setSelectedFloor(id);
        setBookingData((prev) => ({ ...prev, floorId: id }));
    }, []);

    const handleDateChange = useCallback((dateValue: string) => {
        setSelectedDate(dateValue);
    }, []);

    const handleHourChange = useCallback((hourValue: string) => {
        setSelectedHour(parseInt(hourValue));
    }, []);

    const handleTableSelect = useCallback((tables: TableResponse[]) => {
        setSelectedTables(tables);
        const tableIds = tables.map((t) => t.id);
        const maxCapacity = tables.reduce(
            (sum, table) => sum + table.capacity,
            0
        );

        setBookingData((prev) => ({
            ...prev,
            tableIds,
            guests:
                maxCapacity > 0
                    ? Math.min(prev.guests, maxCapacity)
                    : prev.guests,
        }));
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (
                selectedTables.length === 0 ||
                !selectedDate ||
                !selectedDateTime
            ) {
                error(
                    'Validation Error',
                    'Please select table(s) and date/time first'
                );
                return;
            }

            const request: CreateBookingRequest = {
                startTime: selectedDateTimeString,
                duration: bookingData.duration,
                guests: bookingData.guests,
                notes: bookingData.notes || undefined,
                tableId: bookingData.tableIds,
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                customerEmail: bookingData.customerEmail || undefined,
            };

            try {
                const response =
                    await createBookingMutation.mutateAsync(request);

                if (response.success && response.payload) {
                    setBookingResponse(response.payload);
                    setShowConfirmDialog(true);
                    success('Success', 'Booking created successfully!');
                } else {
                    error(
                        'Booking Failed',
                        response.message || 'Failed to create booking'
                    );
                }
            } catch (err: any) {
                console.error('Booking error:', err);
                const errorMessage =
                    err.response?.data?.error?.message ||
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to create booking';
                error('Booking Failed', errorMessage);
            }
        },
        [
            selectedTables,
            selectedDate,
            selectedDateTime,
            bookingData,
            createBookingMutation,
            success,
            error,
        ]
    );

    const renderIcon = useCallback((iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-4 h-4" />;
    }, []);

    // Waitlist handlers
    const handleWaitlistSuccess = useCallback(
        (waitlistId: number) => {
            setShowWaitlistDialog(false);
            success('Success', 'Successfully joined the waitlist!');
        },
        [success]
    );

    const handleViewWaitlist = useCallback((waitlist: WaitlistResponseDto) => {
        setSelectedWaitlist(waitlist);
    }, []);

    const selectedBranchData = useMemo(() => {
        return branches.find((b) => b.id === selectedBranch);
    }, [branches, selectedBranch]);

    const selectedFloorData = useMemo(() => {
        return floors.find((f) => f.id === selectedFloor);
    }, [floors, selectedFloor]);

    // Get selectable tables based on current date/time selection
    const selectableTables = useMemo((): number[] | undefined => {
        if (!floorTablesStatus?.success || !selectedDate) {
            return undefined; // If no API data or no time selection, all tables are selectable
        }

        // Return array of table IDs that are available at the selected time
        return floorTablesStatus.payload.availableTablesList
            .filter(
                (t: AvailableTable) => t.currentStatus === TableStatus.AVAILABLE
            )
            .map((t: AvailableTable) => t.tableId);
    }, [floorTablesStatus, selectedDate]);

    // Check if no tables are available for waitlist option
    const noTablesAvailable = useMemo(() => {
        return (
            floorTablesStatus?.success &&
            selectedDate &&
            selectedFloor &&
            selectableTables?.length === 0
        );
    }, [floorTablesStatus, selectedDate, selectedFloor, selectableTables]);

    // Enhanced FloorCanvas that uses table status
    const floorCanvas = useMemo(() => {
        if (!floorData?.floor) return null;

        return (
            <MultiSelectFloorCanvas
                floor={floorData.floor}
                tables={Array.isArray(floorData.tables) ? floorData.tables : []}
                selectedTables={selectedTables}
                onTableSelect={handleTableSelect}
                selectableTables={selectableTables}
            />
        );
    }, [floorData, selectedTables, selectableTables, handleTableSelect]);

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-1">Table Booking</h1>
                <p className="text-gray-600 text-sm">
                    Select date, time and table for your reservation
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Selection Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Location Selection */}
                    <LocationSelector
                        branches={branches}
                        floors={floors}
                        selectedBranch={selectedBranch}
                        selectedFloor={selectedFloor}
                        onBranchChange={handleBranchChange}
                        onFloorChange={handleFloorChange}
                        branchesLoading={branchesLoading}
                        floorsLoading={floorsLoading}
                    />

                    {/* Date & Time Selection */}
                    <DateTimeSelector
                        selectedDate={selectedDate}
                        selectedHour={selectedHour}
                        duration={bookingData.duration}
                        onDateChange={handleDateChange}
                        onHourChange={handleHourChange}
                        onDurationChange={(duration) =>
                            setBookingData((prev) => ({ ...prev, duration }))
                        }
                        disabled={!selectedFloor}
                    />

                    {/* Booking Form */}
                    <BookingForm
                        bookingData={{
                            guests: bookingData.guests,
                            customerName: bookingData.customerName,
                            customerPhone: bookingData.customerPhone,
                            customerEmail: bookingData.customerEmail,
                            notes: bookingData.notes,
                        }}
                        selectedTables={selectedTables}
                        selectedDate={selectedDate}
                        onBookingDataChange={(data) =>
                            setBookingData((prev) => ({ ...prev, ...data }))
                        }
                        onSubmit={handleSubmit}
                        isSubmitting={createBookingMutation.isPending}
                    />
                </div>

                {/* Floor Map and Status */}
                <div className="lg:col-span-2 space-y-4">
                    {/* No Tables Available - Waitlist Option */}
                    {noTablesAvailable && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <Timer className="w-5 h-5" />
                                    No Tables Available
                                </CardTitle>
                                <CardDescription className="text-orange-700">
                                    All tables are booked for this time. You can
                                    join our waitlist to be notified when a
                                    table becomes available.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={() =>
                                            setShowWaitlistDialog(true)
                                        }
                                        className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                                    >
                                        <Timer className="w-4 h-4 mr-2" />
                                        Join Waitlist
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Floor Map */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building className="w-4 h-4" />
                                Floor Map
                                {selectedBranchData && selectedFloorData && (
                                    <div className="ml-auto text-xs text-gray-500 hidden sm:block">
                                        {selectedBranchData?.name} -{' '}
                                        {selectedFloorData?.name}
                                    </div>
                                )}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Select date/time first, then choose an available
                                table
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {!selectedBranch && (
                                <div className="flex items-center justify-center h-48 text-gray-500">
                                    <div className="text-center">
                                        <Building className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">
                                            Please select a branch first
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedBranch && !selectedFloor && (
                                <div className="flex items-center justify-center h-48 text-gray-500">
                                    <div className="text-center">
                                        <Building className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">
                                            Please select a floor
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedFloor && tablesLoading && (
                                <div className="flex items-center justify-center h-48 text-gray-500">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-sm">
                                            Loading floor map...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedFloor && floorData && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    {floorCanvas}
                                </div>
                            )}
                        </CardContent>

                        {/* Selected Tables Info */}
                        {selectedTables.length > 0 && (
                            <div className="mx-4 mb-3">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs font-medium text-blue-900">
                                            Selected Table
                                            {selectedTables.length > 1
                                                ? 's'
                                                : ''}{' '}
                                            ({selectedTables.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedTables.map((table, _) => (
                                            <div
                                                key={table.id}
                                                className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs p-2 bg-white rounded border"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-gray-600 mb-1">
                                                        Table
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {table.tableName}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-600 mb-1">
                                                        Capacity
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-semibold w-fit text-xs h-5"
                                                    >
                                                        {table.capacity} people
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-600 mb-1">
                                                        Type
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {renderIcon(
                                                            table.tableType.icon
                                                        )}
                                                        <span className="font-semibold text-gray-900">
                                                            {
                                                                table.tableType
                                                                    .tableType
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-600 mb-1">
                                                        Deposit
                                                    </span>
                                                    <span className="font-semibold text-green-600">
                                                        {formatCurrency(
                                                            table.tableType
                                                                .depositForBooking
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedTables.length > 1 && (
                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Total Capacity:
                                                </span>
                                                <span className="font-semibold">
                                                    {selectedTables.reduce(
                                                        (sum, t) =>
                                                            sum + t.capacity,
                                                        0
                                                    )}{' '}
                                                    people
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">
                                                    Total Deposit:
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(
                                                        selectedTables.reduce(
                                                            (sum, t) =>
                                                                sum +
                                                                t.tableType
                                                                    .depositForBooking,
                                                            0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Booking Confirmation Dialog */}
            <BookingConfirmDialog
                open={showConfirmDialog}
                onOpenChange={(open) => {
                    setShowConfirmDialog(open);
                }}
                bookingData={bookingResponse}
                branchId={selectedBranch || undefined}
                onConfirm={() => {
                    setShowConfirmDialog(false);
                    // Reset form after successful booking
                    setSelectedTables([]);
                    setBookingData((prev) => ({
                        ...prev,
                        tableIds: [],
                        guests: 2,
                        notes: '',
                    }));
                }}
                onCancel={() => {
                    setShowConfirmDialog(false);
                }}
                onPaymentSuccess={() => {
                    success(
                        'Payment Success',
                        'Payment completed successfully! Your booking is confirmed.'
                    );
                    setShowConfirmDialog(false);
                    // Reset form after successful payment
                    setSelectedTables([]);
                    setBookingData((prev) => ({
                        ...prev,
                        tableIds: [],
                        guests: 2,
                        notes: '',
                    }));
                }}
            />

            {/* Waitlist Dialog */}
            <Dialog
                open={showWaitlistDialog}
                onOpenChange={setShowWaitlistDialog}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <WaitlistForm
                        onSuccess={handleWaitlistSuccess}
                        onCancel={() => setShowWaitlistDialog(false)}
                        initialData={{
                            guestCount: bookingData.guests,
                            customerName: bookingData.customerName,
                            customerPhone: bookingData.customerPhone,
                            customerEmail: bookingData.customerEmail,
                            preferredStartTime: selectedDateTimeString,
                            duration: bookingData.duration,
                            branchId: selectedBranch || 1,
                        }}
                        compact={false}
                    />
                </DialogContent>
            </Dialog>

            {/* Waitlist Details Dialog */}
            <Dialog
                open={!!selectedWaitlist}
                onOpenChange={() => setSelectedWaitlist(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    {selectedWaitlist && (
                        <WaitlistCard
                            waitlist={selectedWaitlist}
                            onRefresh={() => {
                                setSelectedWaitlist(null);
                            }}
                            showActions={false}
                            compact={false}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
