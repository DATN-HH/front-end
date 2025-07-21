import dayjs from 'dayjs';
import {
  User,
  Mail,
  Phone,
  UserCheck,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

import {
  useGetReplacementStaff,
  useReplaceStaff,
  type ReplacementStaff,
} from '@/api/v1/staff-shift-replacement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface StaffReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffShiftId: number;
  currentStaffName: string;
  shiftName: string;
  shiftDate: string;
  shiftTime: string;
  shiftStatus: string;
  onReplacementSuccess?: () => void;
}

export const StaffReplacementModal = ({
  isOpen,
  onClose,
  staffShiftId,
  currentStaffName,
  shiftName,
  shiftDate,
  shiftTime,
  shiftStatus,
  onReplacementSuccess,
}: StaffReplacementModalProps) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const { success: successToast, error: errorToast } = useCustomToast();

  // Check if shift is eligible for replacement
  const isEligibleForReplacement =
    shiftStatus === 'CONFLICTED' || shiftStatus === 'REQUEST_CHANGE';

  const {
    data: replacementStaff = [],
    isLoading,
    error,
    refetch,
  } = useGetReplacementStaff(staffShiftId, isOpen && isEligibleForReplacement);

  const replaceStaffMutation = useReplaceStaff();

  const handleClose = () => {
    setSelectedStaffId(null);
    onClose();
  };

  const handleReplaceStaff = async (
    newStaffId: number,
    newStaffName: string
  ) => {
    try {
      await replaceStaffMutation.mutateAsync({
        staffShiftId,
        newStaffId,
      });

      successToast(
        'Staff replaced successfully',
        `${currentStaffName} has been replaced by ${newStaffName} for ${shiftName} on ${dayjs(shiftDate).format('DD/MM/YYYY')}`
      );

      onReplacementSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error replacing staff:', error);
      errorToast(
        'Failed to replace staff',
        error?.message || 'An error occurred while replacing the staff member'
      );
    }
  };

  const getStaffInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getPrimaryRole = (staff: ReplacementStaff) => {
    return staff.userRoles[0]?.role?.name || 'Unknown Role';
  };

  const renderStaffCard = (staff: ReplacementStaff) => (
    <Card key={staff.id} className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getStaffInitials(staff.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">
                {staff.fullName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">@{staff.username}</p>
            </div>
          </div>
          <Badge variant="outline" className="font-medium">
            {getPrimaryRole(staff)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{staff.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{staff.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{staff.branch.name}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="w-4 h-4" />
            <span>
              {staff.isFullRole === true
                ? 'Full Access'
                : staff.isFullRole === false
                  ? 'Limited Access'
                  : 'Standard Access'}
            </span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2"
                disabled={replaceStaffMutation.isPending}
              >
                <RefreshCw className="w-4 h-4" />
                Replace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Staff Replacement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to replace{' '}
                  <strong>{currentStaffName}</strong> with{' '}
                  <strong>{staff.fullName}</strong> for the{' '}
                  <strong>{shiftName}</strong> shift on{' '}
                  <strong>{dayjs(shiftDate).format('DD/MM/YYYY')}</strong>?
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    <div className="font-medium mb-2">Shift Details:</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{shiftTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Role: {getPrimaryRole(staff)}</span>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleReplaceStaff(staff.id, staff.fullName)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Confirm Replacement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Staff Replacement
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Find replacement for {currentStaffName} - {shiftName} on{' '}
                {dayjs(shiftDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Current Shift Info */}
          <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Clock className="w-5 h-5" />
                Current Shift Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Staff:</strong> {currentStaffName}
                </div>
                <div>
                  <strong>Shift:</strong> {shiftName}
                </div>
                <div>
                  <strong>Date:</strong> {dayjs(shiftDate).format('DD/MM/YYYY')}
                </div>
                <div>
                  <strong>Time:</strong> {shiftTime}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replacement Staff List */}
          {!isEligibleForReplacement ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Replacement Not Available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Staff replacement is only available for shifts with{' '}
                    <strong>CONFLICTED</strong> or{' '}
                    <strong>REQUEST_CHANGE</strong> status.
                  </p>
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive"
                  >
                    Current Status: {shiftStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">
                  Finding available replacement staff...
                </span>
              </div>
            </div>
          ) : error ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-destructive mb-2">
                    Failed to load replacement staff
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : replacementStaff.length === 0 ? (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="pt-12 pb-12">
                <div className="text-center text-muted-foreground">
                  <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No replacement staff available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No eligible staff members found for this shift replacement.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Available Replacement Staff ({replacementStaff.length})
                </h3>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {replacementStaff.map(renderStaffCard)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6 bg-muted/30">
          <Button variant="outline" onClick={handleClose} className="px-8 h-11">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
