'use client';

import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function NewAttributePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    displayType: '',
    creationMode: 'Instantly',
  });
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');

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
      title: 'Attribute Created',
      description: `${formData.name} has been created successfully with ${values.length} values.`,
    });

    router.push('/app/menu/attributes');
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/app/menu/attributes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Attribute
          </h1>
          <p className="text-muted-foreground">
            Define a new attribute to create product variants
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribute Information</CardTitle>
            <CardDescription>Enter basic attribute information</CardDescription>
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
              Add possible values for this attribute
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

        <div className="flex justify-end space-x-4">
          <Link href="/app/menu/attributes">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
