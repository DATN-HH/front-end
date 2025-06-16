'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BranchResponseDto } from '@/api/v1/branches';
import { useUsers } from '@/api/v1/users';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditBranchModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    branch: BranchResponseDto | null;
    setBranch: (branch: BranchResponseDto | null) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export function EditBranchModal({
    isOpen,
    onOpenChange,
    branch,
    setBranch,
    onSubmit,
    isLoading,
}: EditBranchModalProps) {
    const [open, setOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const { data: users } = useUsers({
        keyword: searchKeyword,
        status: 'ACTIVE',
        isEmployee: true,
        page: 0,
        size: 10,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    if (!branch) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Branch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={branch.name}
                            onChange={(e) =>
                                setBranch({
                                    ...branch,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={branch.address || ''}
                            onChange={(e) =>
                                setBranch({
                                    ...branch,
                                    address: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={branch.phone || ''}
                            onChange={(e) =>
                                setBranch({
                                    ...branch,
                                    phone: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Manager</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {branch.managerId
                                        ? users?.data.find(
                                            (user) => user.id === branch.managerId
                                        )?.fullName
                                        : 'Select manager...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search manager..."
                                        value={searchKeyword}
                                        onValueChange={setSearchKeyword}
                                    />
                                    <CommandEmpty>No manager found.</CommandEmpty>
                                    <CommandGroup>
                                        {users?.data.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={user.fullName}
                                                onSelect={() => {
                                                    setBranch({
                                                        ...branch,
                                                        managerId: user.id,
                                                    });
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        branch.managerId === user.id
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                                {user.fullName}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={branch.status}
                            onValueChange={(value) =>
                                setBranch({
                                    ...branch,
                                    status: value as 'ACTIVE' | 'INACTIVE',
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !branch.name ||
                                isLoading
                            }
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 