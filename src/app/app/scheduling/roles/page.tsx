'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Loader2,
} from 'lucide-react';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  RoleResponse,
  RoleRequest,
} from '@/features/system/api/api-role';
import { useCustomToast } from '@/lib/show-toast';
import { Role } from '@/lib/rbac';

export default function JobRolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleResponse | null>(null);
  const [newRole, setNewRole] = useState<RoleRequest>({
    name: Role.CUSTOMER,
    hexColor: '#FF9500',
    description: '',
    status: 'ACTIVE',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    error: toastError,
    success,
    // info,
    // warning,
    // default: defaultToast,
  } = useCustomToast();

  const queryClient = useQueryClient();

  // Fetch roles using React Query
  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      success('Success', 'Role created successfully');
      setIsCreateDialogOpen(false);
      resetNewRoleForm();
    },
    onError: (error: any) => {
      toastError(
        'Error',
        error?.response?.data?.message || 'Failed to create role'
      );
      console.error('Create role error:', error);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (role: RoleResponse) =>
      updateRole(role.id, role as RoleRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      success('Success', 'Role updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toastError(
        'Error',
        error?.response?.data?.message || 'Failed to update role'
      );
      console.error('Update role error:', error);
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      success('Success', 'Role deleted successfully');
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toastError(
        'Error',
        error?.response?.data?.message || 'Failed to delete role'
      );
      console.error('Delete role error:', error);
    },
  });

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset new role form
  const resetNewRoleForm = () => {
    setNewRole({
      name: Role.CUSTOMER,
      hexColor: '#FF9500',
      description: '',
      status: 'ACTIVE',
    });
  };

  // Handle create role
  const handleCreateRole = () => {
    createRoleMutation.mutate(newRole);
  };

  // Handle edit role
  const handleEditRole = () => {
    if (currentRole) {
      updateRoleMutation.mutate(currentRole);
    }
  };

  // Handle delete role
  const handleDeleteRole = () => {
    if (currentRole) {
      deleteRoleMutation.mutate(currentRole.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Job Roles</h1>
        <p className="text-muted-foreground">
          Manage job roles for scheduling and employee assignments
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Job Role</DialogTitle>
              <DialogDescription>
                Add a new job role to the system. This will be used for
                scheduling and employee assignments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Head Chef"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    className="w-12 h-10 p-1"
                    value={newRole.hexColor}
                    onChange={(e) =>
                      setNewRole({ ...newRole, hexColor: e.target.value })
                    }
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      This color will be used to identify the role in schedules
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the responsibilities of this role"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleCreateRole}
                disabled={!newRole.name.trim() || createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Roles List</CardTitle>
          <CardDescription>
            View and manage all job roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading roles. Please try again later.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No job roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: role.hexColor }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {role.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            role.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {role.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentRole(role);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setCurrentRole(role);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Role</DialogTitle>
            <DialogDescription>
              Update the details of this job role
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={currentRole.name}
                  disabled
                  // onChange={(e) =>
                  //   setCurrentRole({ ...currentRole, name: e.target.value })
                  // }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    className="w-12 h-10 p-1"
                    value={currentRole.hexColor}
                    onChange={(e) =>
                      setCurrentRole({
                        ...currentRole,
                        hexColor: e.target.value,
                      })
                    }
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      This color will be used to identify the role in schedules
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={currentRole.description}
                  onChange={(e) =>
                    setCurrentRole({
                      ...currentRole,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentRole.status}
                  onChange={(e) =>
                    setCurrentRole({ ...currentRole, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleEditRole}
              disabled={
                !currentRole?.name.trim() || updateRoleMutation.isPending
              }
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job role? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="py-4">
              <p className="font-medium">{currentRole.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentRole.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
