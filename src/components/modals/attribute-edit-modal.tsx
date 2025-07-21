'use client';

import { Save, Plus, X } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Attribute {
  id: number;
  name: string;
  displayType: string;
  creationMode: string;
  valueCount: number;
  values: string[];
}

interface AttributeEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: Attribute | null;
}

export function AttributeEditModal({
  open,
  onOpenChange,
  attribute,
}: AttributeEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    displayType: '',
    creationMode: 'Instantly',
  });
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');

  // Populate form when attribute changes
  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name || '',
        displayType: attribute.displayType || '',
        creationMode: attribute.creationMode || 'Instantly',
      });
      setValues(attribute.values || []);
    }
  }, [attribute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.displayType) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (values.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one value for the attribute.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Attribute Updated',
      description: `${formData.name} has been updated successfully with ${values.length} values.`,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (attribute) {
      setFormData({
        name: attribute.name || '',
        displayType: attribute.displayType || '',
        creationMode: attribute.creationMode || 'Instantly',
      });
      setValues(attribute.values || []);
    }
    setNewValue('');
    onOpenChange(false);
  };

  const addValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Attribute</DialogTitle>
          <DialogDescription>
            Update attribute information and values
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Information</CardTitle>
              <CardDescription>
                Update basic attribute information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g: Pizza Size, Spice Level, Color"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayType">Display Type *</Label>
                  <Select
                    value={formData.displayType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        displayType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select display type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Radio">Radio</SelectItem>
                      <SelectItem value="Select">Select</SelectItem>
                      <SelectItem value="Color">Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creationMode">Variant Creation Mode</Label>
                  <Select
                    value={formData.creationMode}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        creationMode: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instantly">Instantly</SelectItem>
                      <SelectItem value="Dynamically">Dynamically</SelectItem>
                      <SelectItem value="Never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attribute Values</CardTitle>
              <CardDescription>
                Update possible values for this attribute
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter new value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addValue}
                  disabled={!newValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {values.length > 0 && (
                <div className="space-y-2">
                  <Label>Value List ({values.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeValue(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Update Attribute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
