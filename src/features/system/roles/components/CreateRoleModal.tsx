import { Loader2 } from 'lucide-react';

import { RoleName } from '@/api/v1';
import { RoleCreateDto } from '@/api/v1/roles';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateRoleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: RoleCreateDto;
  setNewRole: (role: RoleCreateDto) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function CreateRoleModal({
  isOpen,
  onOpenChange,
  newRole,
  setNewRole,
  onSubmit,
  isLoading,
}: CreateRoleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newRole.name}
              onChange={(e) =>
                setNewRole({
                  ...newRole,
                  name: e.target.value as RoleName,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={newRole.description}
              onChange={(e) =>
                setNewRole({
                  ...newRole,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <Input
              id="color"
              type="color"
              value={newRole.hexColor}
              onChange={(e) =>
                setNewRole({
                  ...newRole,
                  hexColor: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
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
  );
}
