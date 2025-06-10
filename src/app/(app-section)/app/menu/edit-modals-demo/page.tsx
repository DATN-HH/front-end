"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { ProductEditModal, PosCategoryEditModal, AttributeEditModal } from "@/components/modals"

// Sample data for demonstration
const sampleProduct = {
  id: 1,
  name: "Beef Pho",
  type: "Consumable",
  price: 50000,
  cost: 30000,
  internalReference: "PHO001",
  category: "food",
  posCategory: "main",
  canBeSold: true,
  canBePurchased: false,
  availableInPos: true,
  description: "Traditional Vietnamese beef noodle soup with rich broth and tender beef slices",
}

const sampleCategory = {
  id: 1,
  name: "Main Course",
  parentCategory: null,
  sequence: 1,
  productCount: 15,
}

const sampleAttribute = {
  id: 1,
  name: "Size",
  displayType: "Radio",
  creationMode: "Instantly",
  valueCount: 3,
  values: ["Small", "Medium", "Large"],
}

export default function EditModalsDemo() {
  const [showProductEdit, setShowProductEdit] = useState(false)
  const [showCategoryEdit, setShowCategoryEdit] = useState(false)
  const [showAttributeEdit, setShowAttributeEdit] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Modals Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of edit modal components for products, categories, and attributes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product
              <Button size="sm" onClick={() => setShowProductEdit(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardTitle>
            <CardDescription>Sample product data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm font-medium">{sampleProduct.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <Badge variant="outline">{sampleProduct.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-sm font-medium">{formatCurrency(sampleProduct.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cost</label>
                <p className="text-sm font-medium">{formatCurrency(sampleProduct.cost)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reference</label>
              <p className="text-sm">{sampleProduct.internalReference}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={sampleProduct.canBeSold ? "default" : "secondary"}>
                {sampleProduct.canBeSold ? "Can Sell" : "Cannot Sell"}
              </Badge>
              <Badge variant={sampleProduct.availableInPos ? "default" : "secondary"}>
                {sampleProduct.availableInPos ? "POS Available" : "POS Unavailable"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              POS Category
              <Button size="sm" onClick={() => setShowCategoryEdit(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardTitle>
            <CardDescription>Sample category data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm font-medium">{sampleCategory.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Parent Category</label>
              <p className="text-sm">{sampleCategory.parentCategory || "None (Root)"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sequence</label>
              <p className="text-sm">{sampleCategory.sequence}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Product Count</label>
              <Badge variant="outline">{sampleCategory.productCount} products</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attribute Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Attribute
              <Button size="sm" onClick={() => setShowAttributeEdit(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardTitle>
            <CardDescription>Sample attribute data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm font-medium">{sampleAttribute.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Display Type</label>
              <Badge variant="outline">{sampleAttribute.displayType}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Creation Mode</label>
              <p className="text-sm">{sampleAttribute.creationMode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Values</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {sampleAttribute.values.map((value, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Edit Modals</CardTitle>
          <CardDescription>Instructions for implementing edit modals in your components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Import the Edit Modals</h4>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              {`import { ProductEditModal, PosCategoryEditModal, AttributeEditModal } from "@/components/modals"`}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Add State Management</h4>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              {`const [showEditModal, setShowEditModal] = useState(false)
const [selectedItem, setSelectedItem] = useState(null)`}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Create Edit Handler</h4>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              {`const handleEdit = (item) => {
  setSelectedItem(item)
  setShowEditModal(true)
}`}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Add Modal Component</h4>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              {`<ProductEditModal 
  open={showEditModal} 
  onOpenChange={setShowEditModal} 
  product={selectedItem}
/>`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modals */}
      <ProductEditModal 
        open={showProductEdit} 
        onOpenChange={setShowProductEdit} 
        product={sampleProduct}
      />
      <PosCategoryEditModal 
        open={showCategoryEdit} 
        onOpenChange={setShowCategoryEdit} 
        category={sampleCategory}
      />
      <AttributeEditModal 
        open={showAttributeEdit} 
        onOpenChange={setShowAttributeEdit} 
        attribute={sampleAttribute}
      />
    </div>
  )
} 