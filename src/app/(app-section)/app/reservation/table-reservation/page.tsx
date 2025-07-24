'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Plus, CalendarRange, Timer } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { useAdvanceSearch } from '@/api/v1/advance-search';
import {
    useBookingTables,
    BookingTableResponseDto,
    BookingTableListRequest,
} from '@/api/v1/table-booking';
import { WaitlistResponseDto } from '@/api/v1/waitlist';
import { DataTable } from '@/components/common/Table/DataTable';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProtectedRoute } from '@/components/protected-component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import TableBookingWrapper from '@/features/booking/components/table-booking/TableBookingWrapper';
import { BookingTableColumns } from '@/features/reservation/components/BookingTableColumns';
import { WaitlistCard } from '@/features/waitlist/components/WaitlistCard';
import { WaitlistTable } from '@/features/waitlist/components/WaitlistTable';
import { Role } from '@/lib/rbac';
import { SearchCondition } from '@/lib/response-object';
import { useCustomToast } from '@/lib/show-toast';

interface BookingData {
    startTime: string;
    duration: number;
    guests: number;
    notes: string;
    branchId: number;
    floorId: number;
    tableIds: number[];
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentType?: 'cash' | 'banking';
}

function TableReservation() {
    const { user } = useAuth();

    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string>('timeStart:desc');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [bookingTables, setBookingTables] = useState<
        BookingTableResponseDto[]
    >([]);
    const [total, setTotal] = useState(0);

    // Booking modal state
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Waitlist modal state
    const [selectedWaitlist, setSelectedWaitlist] =
        useState<WaitlistResponseDto | null>(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('bookings');

    // Hooks
    const { error: toastError, success } = useCustomToast();
    const queryClient = useQueryClient();

    // Query params
    const queryParams: BookingTableListRequest = useMemo(
        () => ({
            branchId: user?.branch.id,
            page: pageIndex,
            size: pageSize,
            keyword,
            sortBy: sorting || undefined,
            searchCondition:
                columnFilters && columnFilters.length > 0
                    ? JSON.stringify(columnFilters)
                    : undefined,
        }),
        [pageIndex, pageSize, sorting, keyword, columnFilters, user]
    );

    // Data fetching
    const { data: filterDefinitions = [] } = useAdvanceSearch('booking_table');
    const {
        data: bookingTableList,
        isLoading,
        error,
    } = useBookingTables(queryParams);

    // Effects
    useEffect(() => {
        if (bookingTableList) {
            setBookingTables(bookingTableList.data);
            setPageIndex(bookingTableList.page);
            setTotal(bookingTableList.total);
        }
    }, [bookingTableList]);

    useEffect(() => {
        if (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch booking tables';
            toastError('Error', errorMessage);
            console.error('Fetch booking tables error:', error);
        }
    }, [error, toastError]);

    // Handlers
    const onPaginationChange = (pageIndex: number, pageSize: number) => {
        setPageIndex(pageIndex);
        setPageSize(pageSize);
    };

    const onSortingChange = (newSorting: string) => {
        setSorting(newSorting);
    };

    const handleBookingComplete = (bookingData: BookingData) => {
        // Close modal
        setIsBookingModalOpen(false);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['booking-tables'] });

        success('Success', 'New reservation created successfully!');
    };

    const handleBookingCancel = () => {
        setIsBookingModalOpen(false);
    };

    // Waitlist handlers
    const handleViewWaitlistDetails = (waitlist: WaitlistResponseDto) => {
        setSelectedWaitlist(waitlist);
    };

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={CalendarRange}
                title="Table Reservation"
                left={
                    <Button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add New</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                }
            />

            {/* Tabs for Bookings and Waitlist */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                        value="bookings"
                        className="flex items-center gap-2"
                    >
                        <CalendarRange className="h-4 w-4" />
                        Reservations
                    </TabsTrigger>
                    <TabsTrigger
                        value="waitlist"
                        className="flex items-center gap-2"
                    >
                        <Timer className="h-4 w-4" />
                        Waitlist
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bookings" className="mt-6">
                    <DataTable
                        columns={BookingTableColumns()}
                        data={bookingTables}
                        tableId="booking-tables-table"
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        total={total}
                        currentSorting={sorting}
                        onPaginationChange={onPaginationChange}
                        onSortingChange={onSortingChange}
                        onFilterChange={(filters) => {
                            setColumnFilters(filters);
                        }}
                        onSearchChange={(searchTerm) => {
                            setKeyword(searchTerm);
                        }}
                        filterDefinitions={filterDefinitions}
                        enableSearch={true}
                        enableColumnVisibility={true}
                        enableSorting={true}
                        enablePinning={true}
                        enableColumnOrdering={true}
                        enableFiltering={true}
                        enablePagination={true}
                        enableExport={true}
                        loading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="waitlist" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5" />
                                Waitlist Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WaitlistTable
                                onViewDetails={handleViewWaitlistDetails}
                                compact={false}
                                branchId={user?.branch?.id}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Booking Modal */}
            <Dialog
                open={isBookingModalOpen}
                onOpenChange={setIsBookingModalOpen}
            >
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Reservation</DialogTitle>
                    </DialogHeader>
                    <TableBookingWrapper
                        mode="admin"
                        onBookingComplete={handleBookingComplete}
                        onCancel={handleBookingCancel}
                        initialBranchId={user?.branch?.id}
                    />
                </DialogContent>
            </Dialog>

            {/* Waitlist Details Modal */}
            <Dialog
                open={!!selectedWaitlist}
                onOpenChange={() => setSelectedWaitlist(null)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Waitlist Details #{selectedWaitlist?.id}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedWaitlist && (
                        <WaitlistCard
                            waitlist={selectedWaitlist}
                            onRefresh={() => setSelectedWaitlist(null)}
                            showActions={false}
                            compact={false}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TableReservationPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.SUPPORT, Role.MANAGER]}>
            <TableReservation />
        </ProtectedRoute>
    );
}
