'use client';

import { Building } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { useBranches } from '@/api/v1/branches';
import { useFloorsByBranch } from '@/api/v1/floors';
import {
    useCreateBooking,
    useCreateAdminBooking,
    CreateBookingResponse,
} from '@/api/v1/table-booking';
import { useFloorTablesStatus, TableStatus } from '@/api/v1/table-status';
import { formatCurrency } from '@/api/v1/table-types';
import { useTablesByFloor, TableResponse } from '@/api/v1/tables';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BookingConfirmDialog } from '@/features/booking/components/table-booking/BookingConfirmDialog';
import { BookingForm } from '@/features/booking/components/table-booking/BookingForm';
import { DateTimeSelector } from '@/features/booking/components/table-booking/DateTimeSelector';
import { LocationSelector } from '@/features/booking/components/table-booking/LocationSelector';
import { MultiSelectFloorCanvas } from '@/features/booking/components/table-booking/MultiSelectFloorCanvas';
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
    paymentType?: 'cash' | 'banking'; // Added for admin mode
}

interface TableBookingWrapperProps {
    mode?: 'guest' | 'admin';
    onBookingComplete?: (bookingData: BookingData) => void;
    onCancel?: () => void;
    initialBranchId?: number;
}

export default function TableBookingWrapper({
    mode = 'guest',
    onBookingComplete,
    onCancel,
    initialBranchId,
}: TableBookingWrapperProps) {
    // Basic selection state
    const [selectedBranch, setSelectedBranch] = useState<number | null>(
        initialBranchId || null
    );
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedTables, setSelectedTables] = useState<TableResponse[]>([]);

    // Separate date and hour selection
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [selectedHour, setSelectedHour] = useState<number>(() => {
        return Math.min(new Date().getHours() + 1, 23);
    });

    // Duration state
    const [duration, setDuration] = useState<number>(2);

    // Booking form data
    const [bookingData, setBookingData] = useState({
        guests: 1,
        notes: '',
        customerName: '',
        customerPhone: '',
        paymentType: mode === 'admin' ? ('cash' as const) : undefined,
    });

    // Guest booking states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [createdBooking, setCreatedBooking] =
        useState<CreateBookingResponse | null>(null);

    const { success, error: showError } = useCustomToast();

    // Data queries
    const { data: branches = [], isLoading: branchesLoading } = useBranches();
    const { data: floors = [], isLoading: floorsLoading } = useFloorsByBranch(
        selectedBranch || 0,
        !!selectedBranch
    );
    const { data: floorData } = useTablesByFloor(selectedFloor || 0);
    const tables = floorData?.tables || [];

    // Generate datetime for table status check
    const selectedDateTime = useMemo(() => {
        if (!selectedDate || selectedHour === null) return '';
        const dateObj = new Date(selectedDate);
        dateObj.setHours(selectedHour, 0, 0, 0);
        return dateObj.toISOString();
    }, [selectedDate, selectedHour]);

    // Get table availability
    const { data: tablesStatus = [], isLoading: isLoadingTableStatus } =
        useFloorTablesStatus(
            selectedFloor || 0,
            selectedDateTime,
            duration, // Use dynamic duration instead of hardcoded 2
            !!(selectedFloor && selectedDateTime)
        );

    // Guest booking mutation
    const createBookingMutation = useCreateBooking();

    // Admin booking mutation
    const createAdminBookingMutation = useCreateAdminBooking();

    // Update selected branch when initialBranchId changes
    useEffect(() => {
        if (initialBranchId && !selectedBranch) {
            setSelectedBranch(initialBranchId);
        }
    }, [initialBranchId, selectedBranch]);

    // Reset floor and tables when branch changes
    useEffect(() => {
        setSelectedFloor(null);
        setSelectedTables([]);
    }, [selectedBranch]);

    // Reset tables when floor changes
    useEffect(() => {
        setSelectedTables([]);
    }, [selectedFloor]);

    // Available tables based on status
    const availableTables = useMemo(() => {
        // Handle the API response structure: data.payload.availableTablesList
        if (
            !tablesStatus?.payload?.availableTablesList ||
            !Array.isArray(tablesStatus.payload.availableTablesList)
        ) {
            return [];
        }

        return tablesStatus.payload.availableTablesList
            .filter((table) => table.currentStatus === TableStatus.AVAILABLE)
            .map((table) => ({
                id: table.tableId,
                name: table.tableName,
                capacity: table.capacity,
            }));
    }, [tablesStatus]);

    // Get current floor object
    const currentFloor = useMemo(() => {
        // Use floor data from tables API if available (more complete data)
        if (floorData?.floor) {
            return floorData.floor;
        }
        // Fallback to floors list
        return floors.find((floor) => floor.id === selectedFloor);
    }, [floors, selectedFloor, floorData]);

    // Get selectable table IDs
    const selectableTableIds = useMemo(() => {
        return availableTables.map((table) => table.id);
    }, [availableTables]);

    // Handle table selection for MultiSelectFloorCanvas
    const handleTableSelect = useCallback((tables: TableResponse[]) => {
        setSelectedTables(tables);
    }, []);

    // Handle booking form data changes
    const handleBookingDataChange = useCallback(
        (data: Partial<typeof bookingData>) => {
            setBookingData((prev) => ({ ...prev, ...data }));
        },
        []
    );

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (selectedTables.length === 0) {
                showError('Error', 'Please select at least one table');
                return;
            }

            if (!bookingData.customerName.trim()) {
                showError('Error', 'Please enter customer name');
                return;
            }

            if (!bookingData.customerPhone.trim()) {
                showError('Error', 'Please enter customer phone');
                return;
            }

            if (mode === 'admin') {
                // Admin mode: call admin API and then callback
                const adminBookingPayload = {
                    startTime: selectedDateTime,
                    duration, // Use dynamic duration
                    guests: bookingData.guests,
                    notes: bookingData.notes,
                    branchId: selectedBranch!,
                    floorId: selectedFloor!,
                    tableIds: Array.isArray(selectedTables)
                        ? selectedTables.map((t) => t.id)
                        : [],
                    customerName: bookingData.customerName.trim(),
                    customerPhone: bookingData.customerPhone.trim(),
                    paymentType: bookingData.paymentType,
                };

                try {
                    const response =
                        await createAdminBookingMutation.mutateAsync(
                            adminBookingPayload
                        );

                    if (response.success && response.payload) {
                        success('Success', 'Reservation created successfully!');

                        // Call the completion callback
                        const adminBookingData: BookingData = {
                            startTime: selectedDateTime,
                            duration, // Use dynamic duration
                            guests: bookingData.guests,
                            notes: bookingData.notes,
                            branchId: selectedBranch!,
                            floorId: selectedFloor!,
                            tableIds: Array.isArray(selectedTables)
                                ? selectedTables.map((t) => t.id)
                                : [],
                            customerName: bookingData.customerName.trim(),
                            customerPhone: bookingData.customerPhone.trim(),
                            paymentType: bookingData.paymentType,
                        };

                        onBookingComplete?.(adminBookingData);
                    } else {
                        // showError("Error", response.error?.message || "Failed to create reservation")
                        showError('Error', 'Chưa có APIIIIIIIII');
                    }
                } catch (error: any) {
                    console.error('Admin booking creation error:', error);
                    // showError("Error", error?.response?.data?.message || "Failed to create reservation")
                    showError('Error', 'Chưa có APIIIIIIIII');
                }
                return;
            }

            // Guest mode: create booking and show confirmation dialog
            const bookingPayload = {
                branchId: selectedBranch!,
                startTime: selectedDateTime,
                duration, // Use dynamic duration
                guests: bookingData.guests,
                notes: bookingData.notes,
                tableId: Array.isArray(selectedTables)
                    ? selectedTables.map((t) => t.id)
                    : [],
                customerName: bookingData.customerName.trim(),
                customerPhone: bookingData.customerPhone.trim(),
                paymentType: bookingData.paymentType || 'cash',
            };

            try {
                const response =
                    await createBookingMutation.mutateAsync(bookingPayload);

                if (response.success && response.payload) {
                    setCreatedBooking(response.payload);
                    setShowConfirmDialog(true);
                    success('Success', 'Booking created successfully!');
                } else {
                    showError(
                        'Error',
                        response.error?.message || 'Failed to create booking'
                    );
                }
            } catch (error: any) {
                console.error('Booking creation error:', error);
                showError(
                    'Error',
                    error?.response?.data?.message || 'Failed to create booking'
                );
            }
        },
        [
            selectedTables,
            bookingData,
            selectedDateTime,
            selectedBranch,
            selectedFloor,
            duration,
            mode,
            onBookingComplete,
            createBookingMutation,
            createAdminBookingMutation,
            success,
            showError,
        ]
    );

    // Calculate total cost
    const totalCost = useMemo(() => {
        return selectedTables.reduce((sum, table) => {
            return sum + (table.tableType?.deposit || 0);
        }, 0);
    }, [selectedTables]);

    return (
        <div
            className={mode === 'admin' ? 'p-4' : 'min-h-screen bg-gray-50 p-4'}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header - Only show for guest mode */}
                {mode === 'guest' && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Table Booking
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Reserve your table for a perfect dining experience
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Selection */}
                    <div className="space-y-6">
                        {/* Location Selection */}
                        <LocationSelector
                            branches={branches}
                            floors={floors}
                            selectedBranch={selectedBranch}
                            selectedFloor={selectedFloor}
                            onBranchChange={(branchId) =>
                                setSelectedBranch(parseInt(branchId))
                            }
                            onFloorChange={(floorId) =>
                                setSelectedFloor(parseInt(floorId))
                            }
                            branchesLoading={branchesLoading}
                            floorsLoading={floorsLoading}
                            disableBranch={
                                mode === 'admin' && !!initialBranchId
                            }
                        />

                        {/* Date Time Selection */}
                        <DateTimeSelector
                            selectedDate={selectedDate}
                            selectedHour={selectedHour}
                            duration={duration}
                            onDateChange={setSelectedDate}
                            onHourChange={setSelectedHour}
                            onDurationChange={setDuration}
                            disabled={!selectedFloor}
                        />

                        {/* Floor Canvas */}
                        {selectedFloor && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building className="w-4 h-4" />
                                        Select Tables
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Choose your preferred tables. Selected:{' '}
                                        {selectedTables.length}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {currentFloor ? (
                                        <MultiSelectFloorCanvas
                                            floor={{
                                                id: currentFloor.id,
                                                name: currentFloor.name,
                                                imageUrl:
                                                    currentFloor.imageUrl || '',
                                                order: currentFloor.order || 0,
                                                status:
                                                    currentFloor.status ||
                                                    'ACTIVE',
                                                createdAt:
                                                    currentFloor.createdAt ||
                                                    '',
                                                updatedAt:
                                                    currentFloor.updatedAt ||
                                                    '',
                                            }}
                                            tables={
                                                Array.isArray(tables)
                                                    ? tables
                                                    : []
                                            }
                                            selectedTables={selectedTables}
                                            onTableSelect={handleTableSelect}
                                            selectableTables={
                                                selectableTableIds
                                            }
                                        />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">
                                            Floor data not available. Please
                                            refresh the page.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Booking Form */}
                    <div className="space-y-6">
                        <BookingForm
                            bookingData={bookingData}
                            selectedTables={selectedTables}
                            selectedDate={selectedDate}
                            onBookingDataChange={handleBookingDataChange}
                            onSubmit={handleSubmit}
                            isSubmitting={
                                mode === 'admin'
                                    ? createAdminBookingMutation.isPending
                                    : createBookingMutation.isPending
                            }
                            mode={mode}
                        />

                        {/* Summary Card */}
                        {selectedTables.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        Booking Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Selected Tables:</span>
                                        <span>
                                            {selectedTables.length} table(s)
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total Capacity:</span>
                                        <span>
                                            {selectedTables.reduce(
                                                (sum, t) => sum + t.capacity,
                                                0
                                            )}{' '}
                                            guests
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Total Deposit:</span>
                                        <span>{formatCurrency(totalCost)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {Array.isArray(selectedTables) &&
                                            selectedTables.map((table) => (
                                                <Badge
                                                    key={table.id}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {table.tableName} (
                                                    {table.tableType?.name})
                                                </Badge>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Cancel button for admin mode */}
                        {mode === 'admin' && onCancel && (
                            <Card>
                                <CardContent className="pt-6">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Guest mode confirmation dialog */}
                {mode === 'guest' && (
                    <BookingConfirmDialog
                        open={showConfirmDialog}
                        onOpenChange={setShowConfirmDialog}
                        bookingData={createdBooking}
                        branchId={selectedBranch || undefined}
                        onPaymentSuccess={() => {
                            setShowConfirmDialog(false);
                            // Reset form or redirect
                        }}
                    />
                )}
            </div>
        </div>
    );
}
