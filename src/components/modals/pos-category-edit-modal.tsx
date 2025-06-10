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
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PosCategory {
  id: number
  name: string
  parentCategory: string | null
  sequence: number
  productCount: number
}

interface PosCategoryEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: PosCategory | null
}

export function PosCategoryEditModal({ open, onOpenChange, category }: PosCategoryEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "none",
    sequence: "",
  })

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        parentCategory: category.parentCategory || "none",
        sequence: category.sequence?.toString() || "",
      })
    }
  }, [category])

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
      title: "Category Updated",
      description: `${formData.name} has been updated successfully.`,
    })

    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form to original values
    if (category) {
      setFormData({
        name: category.name || "",
        parentCategory: category.parentCategory || "none",
        sequence: category.sequence?.toString() || "",
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit POS Category</DialogTitle>
          <DialogDescription>Update category information and settings</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>Update basic POS category information</CardDescription>
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
                    <SelectItem value="drink">Beverage</SelectItem>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Update Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 