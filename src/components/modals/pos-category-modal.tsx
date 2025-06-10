"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PosCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PosCategoryModal({ open, onOpenChange }: PosCategoryModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "none",
    sequence: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter category name.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Category Created",
      description: `${formData.name} has been created successfully.`,
    })

    // Reset form and close modal
    setFormData({
      name: "",
      parentCategory: "none",
      sequence: "",
    })
    onOpenChange(false)
  }

  const handleSaveAndNew = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter category name.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Category Created",
      description: `${formData.name} has been created successfully. Create new category.`,
    })

    // Reset form but keep modal open
    setFormData({
      name: "",
      parentCategory: "none",
      sequence: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New POS Category</DialogTitle>
          <DialogDescription>Add a new category to organize products on POS</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>Enter basic information of the POS category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentCategory">Parent Category</Label>
                <Select
                  value={formData.parentCategory}
                  onValueChange={(value) => setFormData({ ...formData, parentCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="drink">Beverages</SelectItem>
                    <SelectItem value="appetizer">Appetizers</SelectItem>
                    <SelectItem value="dessert">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">Sequence Number</Label>
                <Input
                  id="sequence"
                  type="number"
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                  placeholder="Enter display sequence number"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers will display first. Leave empty for automatic ordering.
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveAndNew}>
              <Plus className="mr-2 h-4 w-4" />
              Save & Create New
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
