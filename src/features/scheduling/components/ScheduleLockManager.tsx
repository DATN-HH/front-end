'use client';

import { format } from 'date-fns';
import {
  Lock,
  Unlock,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Loader2,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

import { ScheduleLockStatus } from '@/api/v1/branch-schedule-config';
import {
  useLockSchedule,
  useUnlockSchedule,
  useBranchScheduleLocks,
  useScheduleLocksInRange,
  useActiveScheduleLock,
  useCheckScheduleLock,
  ScheduleLockRequest,
  ScheduleUnlockRequest,
} from '@/api/v1/schedule-locks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

interface ScheduleLockManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleLockManager({
  open,
  onOpenChange,
}: ScheduleLockManagerProps) {
  const { success, error } = useCustomToast();
  const { user } = useAuth();
  const branchId = user?.branch?.id;

  // State declarations first
  const [activeTab, setActiveTab] = useState<'lock' | 'manage' | 'check'>(
    'lock'
  );
  const [checkDate, setCheckDate] = useState<string>('');
  const [rangeStartDate, setRangeStartDate] = useState<string>('');
  const [rangeEndDate, setRangeEndDate] = useState<string>('');

  const { data: locks, isLoading, refetch } = useBranchScheduleLocks(branchId!);

  // Additional hooks for new functionality
  const { data: rangelocks, isLoading: isLoadingRange } =
    useScheduleLocksInRange(branchId!, rangeStartDate, rangeEndDate);

  const { data: activeLockForDate } = useActiveScheduleLock(
    branchId!,
    checkDate
  );
  const { data: isDateLocked } = useCheckScheduleLock(branchId!, checkDate);
  const lockMutation = useLockSchedule();
  const unlockMutation = useUnlockSchedule();
  const [lockForm, setLockForm] = useState<ScheduleLockRequest>({
    branchId: branchId!,
    startDate: '',
    endDate: '',
    lockReason: '',
  });

  const [unlockForm, setUnlockForm] = useState<ScheduleUnlockRequest>({
    unlockReason: '',
  });

  const [selectedLockId, setSelectedLockId] = useState<number | null>(null);

  const handleLockSubmit = async () => {
    if (!lockForm.startDate || !lockForm.endDate) {
      error('Validation Error', 'Please select start and end dates');
      return;
    }

    if (new Date(lockForm.startDate) > new Date(lockForm.endDate)) {
      error('Validation Error', 'Start date must be before end date');
      return;
    }

    try {
      await lockMutation.mutateAsync(lockForm);
      success('Schedule Locked', 'Schedule has been locked successfully');
      setLockForm({
        branchId: branchId!,
        startDate: '',
        endDate: '',
        lockReason: '',
      });
      refetch();
    } catch (err: any) {
      error(
        'Lock Failed',
        err.response?.data?.message || 'Failed to lock schedule'
      );
    }
  };

  const handleUnlockSubmit = async () => {
    if (!selectedLockId) {
      error('Validation Error', 'Please select a schedule lock to unlock');
      return;
    }

    if (!unlockForm.unlockReason.trim()) {
      error('Validation Error', 'Please provide a reason for unlocking');
      return;
    }

    try {
      await unlockMutation.mutateAsync({
        lockId: selectedLockId,
        data: unlockForm,
      });
      success('Schedule Unlocked', 'Schedule has been unlocked successfully');
      setSelectedLockId(null);
      setUnlockForm({ unlockReason: '' });
      refetch();
    } catch (err: any) {
      error(
        'Unlock Failed',
        err.response?.data?.message || 'Failed to unlock schedule'
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setActiveTab('lock');
    setLockForm({
      branchId: branchId!,
      startDate: '',
      endDate: '',
      lockReason: '',
    });
    setUnlockForm({ unlockReason: '' });
    setSelectedLockId(null);
  };

  const getStatusBadge = (status: ScheduleLockStatus) => {
    switch (status) {
      case ScheduleLockStatus.LOCKED:
        return <Badge variant="destructive">Locked</Badge>;
      case ScheduleLockStatus.UNLOCKED:
        return <Badge variant="secondary">Unlocked</Badge>;
      case ScheduleLockStatus.TEMPORARILY_UNLOCKED:
        return <Badge variant="outline">Temporarily Unlocked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const activeLocks =
    locks?.filter((lock) => lock.lockStatus === ScheduleLockStatus.LOCKED) ||
    [];
  const lockHistory =
    locks?.filter((lock) => lock.lockStatus !== ScheduleLockStatus.LOCKED) ||
    [];

  if (!branchId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Schedule Lock Manager
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Lock and unlock schedules for {user?.branch?.name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-muted p-2 rounded-xl">
            <button
              onClick={() => setActiveTab('lock')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'lock'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
              }`}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Lock Schedule
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'manage'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
              }`}
            >
              <Unlock className="h-4 w-4 inline mr-2" />
              Manage Locks
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'check'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Check & Search
            </button>
          </div>

          {activeTab === 'lock' && (
            <div className="space-y-6">
              {/* Lock Form */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    Lock Schedule
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Lock a schedule for a specific date range to prevent
                    modifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="startDate"
                        className="text-sm font-medium text-foreground"
                      >
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={lockForm.startDate}
                        onChange={(e) =>
                          setLockForm((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="h-11 bg-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="endDate"
                        className="text-sm font-medium text-foreground"
                      >
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={lockForm.endDate}
                        onChange={(e) =>
                          setLockForm((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="h-11 bg-white    "
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="lockReason"
                      className="text-sm font-medium text-foreground"
                    >
                      Lock Reason (Optional)
                    </Label>
                    <Textarea
                      id="lockReason"
                      placeholder="Enter reason for locking schedule..."
                      value={lockForm.lockReason}
                      onChange={(e) =>
                        setLockForm((prev) => ({
                          ...prev,
                          lockReason: e.target.value,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Warning */}
              <Card className="border-2 border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/20 text-destructive flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-destructive">
                      <div className="font-semibold mb-2 text-foreground">
                        Important Notice:
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>
                            Locked schedules cannot be modified by staff or
                            managers
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>
                            Only authorized personnel can unlock schedules
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>
                            Consider the date range carefully before locking
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading schedule locks...</span>
                </div>
              ) : (
                <>
                  {/* Active Locks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-red-600" />
                        Active Locks ({activeLocks.length})
                      </CardTitle>
                      <CardDescription>
                        Currently locked schedules that can be unlocked
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activeLocks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No active schedule locks found
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeLocks.map((lock) => (
                            <Card key={lock.id} className="border-red-200">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {format(
                                          new Date(lock.startDate),
                                          'MMM dd, yyyy'
                                        )}{' '}
                                        -{' '}
                                        {format(
                                          new Date(lock.endDate),
                                          'MMM dd, yyyy'
                                        )}
                                      </span>
                                      {getStatusBadge(lock.lockStatus)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="h-4 w-4" />
                                      <span>Locked by {lock.lockedByName}</span>
                                      <Clock className="h-4 w-4 ml-2" />
                                      <span>
                                        {format(
                                          new Date(lock.lockedAt),
                                          'MMM dd, yyyy HH:mm'
                                        )}
                                      </span>
                                    </div>
                                    {lock.lockReason && (
                                      <div className="text-sm text-muted-foreground">
                                        <strong>Reason:</strong>{' '}
                                        {lock.lockReason}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedLockId(lock.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Unlock className="h-4 w-4 mr-1" />
                                    Unlock
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Unlock Form */}
                  {selectedLockId && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                          <Unlock className="h-5 w-5" />
                          Unlock Schedule
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                          Provide a reason for unlocking the selected schedule
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="unlockReason">Unlock Reason *</Label>
                          <Textarea
                            id="unlockReason"
                            placeholder="Enter reason for unlocking schedule..."
                            value={unlockForm.unlockReason}
                            onChange={(e) =>
                              setUnlockForm((prev) => ({
                                ...prev,
                                unlockReason: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUnlockSubmit}
                            disabled={unlockMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {unlockMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Unlocking...
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Confirm Unlock
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedLockId(null)}
                            disabled={unlockMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lock History */}
                  {lockHistory.length > 0 && (
                    <>
                      <Separator />
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Lock History ({lockHistory.length})
                          </CardTitle>
                          <CardDescription>
                            Previously locked schedules that have been unlocked
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {lockHistory.map((lock) => (
                              <div
                                key={lock.id}
                                className="flex items-center justify-between p-3 border rounded"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {format(
                                        new Date(lock.startDate),
                                        'MMM dd'
                                      )}{' '}
                                      -{' '}
                                      {format(
                                        new Date(lock.endDate),
                                        'MMM dd, yyyy'
                                      )}
                                    </span>
                                    {getStatusBadge(lock.lockStatus)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Locked by {lock.lockedByName} • Unlocked by{' '}
                                    {lock.unlockedByName}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'check' && (
            <div className="space-y-6">
              {/* Date Lock Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Check Schedule Lock Status
                  </CardTitle>
                  <CardDescription>
                    Check if a specific date is locked and view active lock
                    details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkDate">Select Date to Check</Label>
                    <Input
                      id="checkDate"
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                    />
                  </div>

                  {checkDate && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Lock Status:
                        </span>
                        <Badge
                          variant={isDateLocked ? 'destructive' : 'success'}
                        >
                          {isDateLocked ? 'Locked' : 'Unlocked'}
                        </Badge>
                      </div>

                      {activeLockForDate && (
                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader>
                            <CardTitle className="text-lg text-orange-900">
                              Active Lock Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">
                                  {format(
                                    new Date(activeLockForDate.startDate),
                                    'MMM dd, yyyy'
                                  )}{' '}
                                  -{' '}
                                  {format(
                                    new Date(activeLockForDate.endDate),
                                    'MMM dd, yyyy'
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  Locked by: {activeLockForDate.lockedByName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Locked at:{' '}
                                  {format(
                                    new Date(activeLockForDate.lockedAt),
                                    'MMM dd, yyyy HH:mm'
                                  )}
                                </span>
                              </div>
                              {activeLockForDate.lockReason && (
                                <div className="text-sm">
                                  <strong>Reason:</strong>{' '}
                                  {activeLockForDate.lockReason}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date Range Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Search Locks by Date Range
                  </CardTitle>
                  <CardDescription>
                    Find all locks within a specific date range
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rangeStart">Range Start Date</Label>
                      <Input
                        id="rangeStart"
                        type="date"
                        value={rangeStartDate}
                        onChange={(e) => setRangeStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rangeEnd">Range End Date</Label>
                      <Input
                        id="rangeEnd"
                        type="date"
                        value={rangeEndDate}
                        onChange={(e) => setRangeEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {rangeStartDate && rangeEndDate && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Locks in Selected Range</h4>
                        <Badge variant="outline">
                          {rangelocks?.length || 0} locks found
                        </Badge>
                      </div>

                      {isLoadingRange ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span>Searching...</span>
                        </div>
                      ) : rangelocks && rangelocks.length > 0 ? (
                        <div className="space-y-3">
                          {rangelocks.map((lock) => (
                            <Card key={lock.id} className="border">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span className="font-medium">
                                        {format(
                                          new Date(lock.startDate),
                                          'MMM dd'
                                        )}{' '}
                                        -{' '}
                                        {format(
                                          new Date(lock.endDate),
                                          'MMM dd, yyyy'
                                        )}
                                      </span>
                                      {getStatusBadge(lock.lockStatus)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Locked by {lock.lockedByName}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No locks found in the selected date range
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6 bg-muted/30">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-8 h-11"
            >
              Close
            </Button>
            {activeTab === 'lock' && (
              <Button
                onClick={handleLockSubmit}
                disabled={lockMutation.isPending}
                className="px-8 h-11 font-medium"
              >
                {lockMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Locking...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Schedule
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
