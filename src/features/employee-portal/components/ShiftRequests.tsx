import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ShiftRequestsProps {
    requests: any[];
}

export function ShiftRequests({ requests }: ShiftRequestsProps) {
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

    const formatTime = (time: string | { hour: number; minute: number; second: number; nano: number }) => {
        if (typeof time === 'string') {
            return time.substring(0, 5);
        }
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Shift Requests</CardTitle>
                <CardDescription>
                    View and manage your shift exchange or drop requests
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
                                                parseISO(request.targetShift.date),
                                                'MMM d, yyyy'
                                            )}
                                        </span>
                                    </div>
                                    {getStatusBadge(request.requestStatus)}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {formatTime(request.targetShift.shift.startTime)}{' '}
                                        -{' '}
                                        {formatTime(request.targetShift.shift.endTime)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <Badge variant="outline">
                                        {request.type === 'EXCHANGE'
                                            ? 'Shift Exchange'
                                            : 'Leave Request'}
                                    </Badge>
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
                        <p>No shift requests</p>
                        <p className="text-xs mt-1">
                            Click on a shift in the calendar to request a change
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 