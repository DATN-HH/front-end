'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Mock roles
const mockRoles = [
    { name: 'WAITER', hexColor: '#4CAF50' },
    { name: 'CASHIER', hexColor: '#2196F3' },
    { name: 'KITCHEN', hexColor: '#FF5722' },
    { name: 'MANAGER', hexColor: '#9C27B0' },
    { name: 'SUPPORT', hexColor: '#607D8B' },
];

// Mock shifts
const initialShifts = [
    {
        id: 1,
        startTime: '08:00:00',
        endTime: '12:00:00',
        branchId: 1,
        branchName: 'Downtown Branch',
        requirements: [
            { id: 1, role: 'WAITER', quantity: 2 },
            { id: 2, role: 'CASHIER', quantity: 1 },
        ],
    },
    {
        id: 2,
        startTime: '12:00:00',
        endTime: '16:00:00',
        branchId: 1,
        branchName: 'Downtown Branch',
        requirements: [
            { id: 3, role: 'WAITER', quantity: 3 },
            { id: 4, role: 'KITCHEN', quantity: 2 },
        ],
    },
    {
        id: 3,
        startTime: '16:00:00',
        endTime: '20:00:00',
        branchId: 1,
        branchName: 'Downtown Branch',
        requirements: [
            { id: 5, role: 'WAITER', quantity: 2 },
            { id: 6, role: 'CASHIER', quantity: 1 },
            { id: 7, role: 'KITCHEN', quantity: 1 },
        ],
    },
];

// Mock branches
const mockBranches = [
    { id: 1, name: 'Downtown Branch' },
    { id: 2, name: 'Uptown Branch' },
    { id: 3, name: 'Westside Branch' },
];

type Requirement = {
    id?: number;
    role: string;
    quantity: number;
};

type Shift = {
    id?: number;
    startTime: string;
    endTime: string;
    branchId: number;
    branchName?: string;
    requirements: Requirement[];
};

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentShift, setCurrentShift] = useState<Shift>({
        startTime: '09:00:00',
        endTime: '17:00:00',
        branchId: 1,
        requirements: [{ role: 'WAITER', quantity: 1 }],
    });

    // Handle form input changes
    const handleInputChange = (field: keyof Shift, value: any) => {
        setCurrentShift((prev) => ({ ...prev, [field]: value }));
    };

    // Handle requirement changes
    const handleRequirementChange = (
        index: number,
        field: keyof Requirement,
        value: any
    ) => {
        const updatedRequirements = [...currentShift.requirements];
        updatedRequirements[index] = {
            ...updatedRequirements[index],
            [field]: value,
        };
        setCurrentShift((prev) => ({
            ...prev,
            requirements: updatedRequirements,
        }));
    };

    // Add a new requirement
    const addRequirement = () => {
        setCurrentShift((prev) => ({
            ...prev,
            requirements: [
                ...prev.requirements,
                { role: 'WAITER', quantity: 1 },
            ],
        }));
    };

    // Remove a requirement
    const removeRequirement = (index: number) => {
        const updatedRequirements = [...currentShift.requirements];
        updatedRequirements.splice(index, 1);
        setCurrentShift((prev) => ({
            ...prev,
            requirements: updatedRequirements,
        }));
    };

    // Open dialog for creating a new shift
    const openCreateDialog = () => {
        setIsEditMode(false);
        setCurrentShift({
            startTime: '09:00:00',
            endTime: '17:00:00',
            branchId: 1,
            requirements: [{ role: 'WAITER', quantity: 1 }],
        });
        setIsDialogOpen(true);
    };

    // Open dialog for editing an existing shift
    const openEditDialog = (shift: Shift) => {
        setIsEditMode(true);
        setCurrentShift({ ...shift });
        setIsDialogOpen(true);
    };

    // Save the current shift (create or update)
    const saveShift = () => {
        if (isEditMode) {
            // Update existing shift
            setShifts((prev) =>
                prev.map((shift) =>
                    shift.id === currentShift.id ? { ...currentShift } : shift
                )
            );
            //   toast({
            //     title: "Shift updated",
            //     description: `Shift from ${currentShift.startTime} to ${currentShift.endTime} has been updated.`,
            //   })
        } else {
            // Create new shift
            const newShift = {
                ...currentShift,
                id: Math.max(0, ...shifts.map((s) => s.id || 0)) + 1,
                branchName: mockBranches.find(
                    (b) => b.id === currentShift.branchId
                )?.name,
            };
            setShifts((prev) => [...prev, newShift]);
            //   toast({
            //     title: "Shift created",
            //     description: `New shift from ${currentShift.startTime} to ${currentShift.endTime} has been created.`,
            //   })
        }
        setIsDialogOpen(false);
    };

    // Delete a shift
    const deleteShift = (id: number | undefined) => {
        if (!id) return;
        setShifts((prev) => prev.filter((shift) => shift.id !== id));
        // toast({
        //   title: "Shift deleted",
        //   description: "The shift has been deleted successfully.",
        // })
    };

    // Format time for display
    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Work Shifts</h1>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Shift
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shift Configuration</CardTitle>
                    <CardDescription>
                        Manage your fixed work shifts and role requirements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shift Time</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Role Requirements</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                    <TableCell className="font-medium">
                                        {formatTime(shift.startTime)} -{' '}
                                        {formatTime(shift.endTime)}
                                    </TableCell>
                                    <TableCell>{shift.branchName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {shift.requirements.map(
                                                (req, index) => {
                                                    const roleColor =
                                                        mockRoles.find(
                                                            (r) =>
                                                                r.name ===
                                                                req.role
                                                        )?.hexColor || '#333';
                                                    return (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            style={{
                                                                backgroundColor: `${roleColor}20`,
                                                                borderColor:
                                                                    roleColor,
                                                                color: roleColor,
                                                            }}
                                                        >
                                                            {req.role}:{' '}
                                                            {req.quantity}
                                                        </Badge>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(shift)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    deleteShift(shift.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Shift Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                    value={currentShift.startTime.substring(
                                        0,
                                        5
                                    )}
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
                                    {mockBranches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id.toString()}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
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
                                                {mockRoles.map((role) => (
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
                                                    Number.parseInt(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                        />

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                removeRequirement(index)
                                            }
                                            disabled={
                                                currentShift.requirements
                                                    .length <= 1
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
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={saveShift}>
                            {isEditMode ? 'Update Shift' : 'Create Shift'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
