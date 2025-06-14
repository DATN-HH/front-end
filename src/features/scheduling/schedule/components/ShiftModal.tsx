import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

export function ShiftModal({
    isShiftDialogOpen,
    setIsShiftDialogOpen,
    isEditMode,
    currentShift,
    handleInputChange,
    handleRequirementChange,
    addRequirement,
    removeRequirement,
    saveShift,
    roles,
}: any) {
    const { user } = useAuth();

    return (
        <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Shift' : 'Create New Shift'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the details of this work shift.'
                            : 'Configure a new work shift and its role requirements.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={currentShift?.startTime?.substring(0, 5)}
                                onChange={(e) =>
                                    handleInputChange(
                                        'startTime',
                                        e.target.value + ':00'
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={currentShift.endTime.substring(0, 5)}
                                onChange={(e) =>
                                    handleInputChange(
                                        'endTime',
                                        e.target.value + ':00'
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                            value={currentShift.branchId.toString()}
                            onValueChange={(value) =>
                                handleInputChange(
                                    'branchId',
                                    Number.parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger id="branch">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    key={user?.branch?.id || 0}
                                    value={(user?.branch?.id || '').toString()}
                                >
                                    {user?.branch?.name || 'Default Branch'}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Role Requirements</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addRequirement}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Role
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {currentShift.requirements.map((req, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <Select
                                        value={req.role}
                                        onValueChange={(value) =>
                                            handleRequirementChange(
                                                index,
                                                'role',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.name}
                                                    value={role.name}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    role.hexColor,
                                                            }}
                                                        />
                                                        {role.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="number"
                                        min="1"
                                        className="w-20"
                                        value={req.quantity}
                                        onChange={(e) =>
                                            handleRequirementChange(
                                                index,
                                                'quantity',
                                                Number.parseInt(e.target.value)
                                            )
                                        }
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRequirement(index)}
                                        disabled={
                                            currentShift.requirements.length <=
                                            1
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsShiftDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={saveShift}>
                        {isEditMode ? 'Update Shift' : 'Create Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 