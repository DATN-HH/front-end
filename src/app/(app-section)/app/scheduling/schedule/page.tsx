"use client"

import { PageTitle } from "@/components/layouts/app-section/page-title"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown } from "lucide-react"
import { CreateShiftDialog } from "@/features/scheduling/components/CreateShiftDialog"
import { ScheduleContext, ScheduleProvider } from "@/features/scheduling/contexts/context-schedule"
import { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { BranchScheduleConfig } from "@/features/scheduling/components/BranchScheduleConfig"
import { ScheduleLockManager } from "@/features/scheduling/components/ScheduleLockManager"
import { ShiftAssignmentSuggestions } from "@/features/scheduling/components/ShiftAssignmentSuggestions"
import { useCheckScheduleLock, useActiveScheduleLock } from "@/api/v1/schedule-locks"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CopyOpenShift } from "@/features/scheduling/components/CopyOpenShift"
import { CopyWeekWithSchedule } from "@/features/scheduling/components/CopyWeekWithSchedule"
import ShiftInfoModal from "@/features/scheduling/components/schedule-manager/ShiftInfoModal"
import CreateOpenShift from "@/features/scheduling/components/schedule-manager/CreateOpenShift"
import ScheduleManager from "@/features/scheduling/components/schedule-manager/ScheduleManager"

function SchedulePage() {
  const { isCreateShiftDialogOpen, setIsCreateShiftDialogOpen, selectedDate } = useContext(ScheduleContext);
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch?.id;

  const [isCopyOpenShiftOpen, setIsCopyOpenShiftOpen] = useState(false);
  const [isCopyWeekWithScheduleOpen, setIsCopyWeekWithScheduleOpen] = useState(false);
  const [isScheduleConfigOpen, setIsScheduleConfigOpen] = useState(false);
  const [isScheduleLockManagerOpen, setIsScheduleLockManagerOpen] = useState(false);
  const [isShiftSuggestionsOpen, setIsShiftSuggestionsOpen] = useState(false);

  // Check if today's schedule is locked
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const { data: isTodayLocked } = useCheckScheduleLock(branchId!, todayDate);
  const { data: activeLockToday } = useActiveScheduleLock(branchId!, todayDate);

  // Check if selected date is locked
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: isSelectedDateLocked } = useCheckScheduleLock(branchId!, selectedDateStr);
  const { data: activeLockSelected } = useActiveScheduleLock(branchId!, selectedDateStr);

  return (
    <div className="min-h-screen bg-white">
      <PageTitle
        icon={Calendar}
        title="Schedule Manager"
        left={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Data Entry
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsCreateShiftDialogOpen(true)}>Add Shift</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/app/scheduling/working-shift')}>View Shifts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCopyOpenShiftOpen(true)}>Copy Open Shift</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCopyWeekWithScheduleOpen(true)}>Copy Schedule</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsShiftSuggestionsOpen(true)}>Suggestions</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Publish
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Publish</DropdownMenuItem>
                <DropdownMenuItem>Publish All</DropdownMenuItem>
                <DropdownMenuItem>Approve & Publish</DropdownMenuItem>
                <DropdownMenuItem>Approve</DropdownMenuItem>
                <DropdownMenuItem>Delete Unconfirmed Shifts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Settings
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsScheduleConfigOpen(true)}>Configuration</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsScheduleLockManagerOpen(true)}>Lock Manager</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Schedule Lock Status Alerts */}
      {(isTodayLocked && activeLockToday) && (
        <div className="mx-6 mb-4">
          <Alert className="border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Today's Schedule is Locked</strong> -
                  Locked by {activeLockToday.lockedByName} on {format(new Date(activeLockToday.lockedAt), 'MMM dd, yyyy HH:mm')}
                  {activeLockToday.lockReason && (
                    <div className="text-sm mt-1">
                      Reason: {activeLockToday.lockReason}
                    </div>
                  )}
                </div>
                <Badge variant="destructive">Locked</Badge>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {(selectedDate && isSelectedDateLocked && activeLockSelected && format(selectedDate, 'yyyy-MM-dd') !== todayDate) && (
        <div className="mx-6 mb-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Selected Date ({format(selectedDate, 'MMM dd, yyyy')}) is Locked</strong> -
                  Locked by {activeLockSelected.lockedByName} on {format(new Date(activeLockSelected.lockedAt), 'MMM dd, yyyy HH:mm')}
                  {activeLockSelected.lockReason && (
                    <div className="text-sm mt-1">
                      Reason: {activeLockSelected.lockReason}
                    </div>
                  )}
                </div>
                <Badge variant="destructive">Locked</Badge>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ScheduleManager />

      <CreateShiftDialog isOpen={isCreateShiftDialogOpen} onOpenChange={setIsCreateShiftDialogOpen} onSubmit={() => { }} />
      <CreateOpenShift selectedDate={selectedDate} />
      <ShiftInfoModal />
      <CopyOpenShift open={isCopyOpenShiftOpen} onOpenChange={setIsCopyOpenShiftOpen} />
      <CopyWeekWithSchedule open={isCopyWeekWithScheduleOpen} onOpenChange={setIsCopyWeekWithScheduleOpen} />
      <BranchScheduleConfig open={isScheduleConfigOpen} onOpenChange={setIsScheduleConfigOpen} />
      <ScheduleLockManager open={isScheduleLockManagerOpen} onOpenChange={setIsScheduleLockManagerOpen} />
      <ShiftAssignmentSuggestions open={isShiftSuggestionsOpen} onOpenChange={setIsShiftSuggestionsOpen} />
    </div>
  );
}

export default function Page() {
  return (
    <ScheduleProvider>
      <SchedulePage />
    </ScheduleProvider>
  );
}

