'use client';

import { Building, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Branch {
    id: number;
    name: string;
    address?: string;
}

interface Floor {
    id: number;
    name: string;
}

interface LocationSelectorProps {
    branches: Branch[];
    floors: Floor[];
    selectedBranch: number | null;
    selectedFloor: number | null;
    onBranchChange: (branchId: string) => void;
    onFloorChange: (floorId: string) => void;
    branchesLoading: boolean;
    floorsLoading: boolean;
    disableBranch?: boolean;
    disableFloor?: boolean;
}

export function LocationSelector({
    branches,
    floors,
    selectedBranch,
    selectedFloor,
    onBranchChange,
    onFloorChange,
    branchesLoading,
    floorsLoading,
    disableBranch,
    disableFloor,
}: LocationSelectorProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="w-4 h-4" />
                    Select Location
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Branch Selection */}
                <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                        value={selectedBranch?.toString() || ''}
                        onValueChange={onBranchChange}
                        disabled={branchesLoading || disableBranch}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    branchesLoading
                                        ? 'Loading...'
                                        : 'Select a branch'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem
                                    key={branch.id}
                                    value={branch.id.toString()}
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">
                                                {branch.name}
                                            </div>
                                            {branch.address && (
                                                <div className="text-sm text-gray-500">
                                                    {branch.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Floor Selection */}
                <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Select
                        value={selectedFloor?.toString() || ''}
                        onValueChange={onFloorChange}
                        disabled={
                            floorsLoading || !selectedBranch || disableFloor
                        }
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    !selectedBranch
                                        ? 'Select a branch first'
                                        : floorsLoading
                                          ? 'Loading...'
                                          : 'Select a floor'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {floors.map((floor) => (
                                <SelectItem
                                    key={floor.id}
                                    value={floor.id.toString()}
                                >
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        {floor.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
