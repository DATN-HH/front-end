"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Save, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAllPosCategories, useCreatePosCategory, PosCategoryCreateRequest } from "@/api/v1/menu/pos-categories"

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
    description: "",
  })

  // API hooks
  const { data: allCategories = [] } = useAllPosCategories()
  const createPosCategoryMutation = useCreatePosCategory()

  // Get root categories for parent dropdown
  const rootCategories = allCategories.filter(cat => cat.isRoot)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter category name.",
        variant: "destructive",
      })
      return
    }

    try {
      const requestData: PosCategoryCreateRequest = {
        name: formData.name.trim(),
        parentId: formData.parentCategory === "none" ? undefined : Number(formData.parentCategory),
        sequence: formData.sequence ? Number(formData.sequence) : undefined,
        description: formData.description || undefined,
      }

      await createPosCategoryMutation.mutateAsync({ data: requestData, saveAndNew: false })
      
      toast({
        title: "Category Created",
        description: `${formData.name} has been created successfully.`,
      })

      // Reset form and close modal
      setFormData({
        name: "",
        parentCategory: "none",
        sequence: "",
        description: "",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAndNew = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter category name.",
        variant: "destructive",
      })
      return
    }

    try {
      const requestData: PosCategoryCreateRequest = {
        name: formData.name.trim(),
        parentId: formData.parentCategory === "none" ? undefined : Number(formData.parentCategory),
        sequence: formData.sequence ? Number(formData.sequence) : undefined,
        description: formData.description || undefined,
      }

      await createPosCategoryMutation.mutateAsync({ data: requestData, saveAndNew: true })
      
      toast({
        title: "Category Created",
        description: `${formData.name} has been created successfully. Create new category.`,
      })

      // Reset form but keep modal open
      setFormData({
        name: "",
        parentCategory: "none",
        sequence: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
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
                    {rootCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveAndNew}
              disabled={createPosCategoryMutation.isPending}
            >
              {createPosCategoryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Save & Create New
            </Button>
            <Button type="submit" disabled={createPosCategoryMutation.isPending}>
              {createPosCategoryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
