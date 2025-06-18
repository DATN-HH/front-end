"use client"

import { PageTitle } from "@/components/layouts/app-section/page-title"
import { Button } from "@/components/ui/button"
import ScheduleManager from "@/features/scheduling/schedule/components/schedule-manager/ScheduleManager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown } from "lucide-react"
import { CreateShiftDialog } from "@/features/scheduling/schedule/components/CreateShiftDialog"
import { ScheduleContext, ScheduleProvider } from "@/features/scheduling/schedule/contexts/context-schedule"
import { useContext } from "react"
import CreateOpenShift from "@/features/scheduling/schedule/components/schedule-manager/CreateOpenShift"

import ShiftInfoModal from "@/features/scheduling/schedule/components/schedule-manager/ShiftInfoModal"

function SchedulePage() {
  const { isCreateShiftDialogOpen,
    setIsCreateShiftDialogOpen,
    isCreateOpenShiftDialogOpen,
    setIsCreateOpenShiftDialogOpen,
    selectedDate,
    isShiftInfoModalOpen,
    setIsShiftInfoModalOpen,
  } = useContext(ScheduleContext);

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
                <DropdownMenuItem onClick={() => setIsCreateShiftDialogOpen(true)}>Create Shift</DropdownMenuItem>
                <DropdownMenuItem>Shift List</DropdownMenuItem>
                <DropdownMenuItem>Assign Shifts</DropdownMenuItem>
                <DropdownMenuItem>Copy Shifts</DropdownMenuItem>
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
          </div>
        }
      />
      <ScheduleManager />

      <CreateShiftDialog isOpen={isCreateShiftDialogOpen} onOpenChange={setIsCreateShiftDialogOpen} onSubmit={() => { }} />
      <CreateOpenShift selectedDate={selectedDate} />
      <ShiftInfoModal />
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

