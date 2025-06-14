import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffUnavailabilityResponseDto } from '@/services/api/v1/staff-unavailability';

interface TimeOffRequestsProps {
    requests: StaffUnavailabilityResponseDto[];
    onCreateRequest: () => void;
    isLoading?: boolean;
}

export function TimeOffRequests({ requests, onCreateRequest, isLoading }: TimeOffRequestsProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-300"
                    >
                        Pending
                    </Badge>
                );
            case 'APPROVED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-300"
                    >
                        Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-300"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Time-off Requests</CardTitle>
                    <CardDescription>
                        View and manage your time-off requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-md p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    </div>
                                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Time-off Requests</CardTitle>
                <CardDescription>
                    View and manage your time-off requests
                </CardDescription>
            </CardHeader>
            <CardContent>
                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="border rounded-md p-4"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {format(
                                                parseISO(request.startTime),
                                                'MMM d, yyyy'
                                            )}
                                        </span>
                                    </div>
                                    {getStatusBadge(request.staffUnavailabilityStatus)}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {format(
                                            parseISO(request.startTime),
                                            'h:mm a'
                                        )}{' '}
                                        -{' '}
                                        {format(
                                            parseISO(request.endTime),
                                            'h:mm a'
                                        )}
                                    </span>
                                </div>

                                <p className="text-sm">
                                    <span className="font-medium">
                                        Reason:{' '}
                                    </span>
                                    {request.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No time-off requests</p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={onCreateRequest}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Request Time Off
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 