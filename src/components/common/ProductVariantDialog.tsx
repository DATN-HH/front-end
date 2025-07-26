"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Minus, Plus, MessageSquare } from "lucide-react"
import { MenuProduct, MenuVariant, formatVietnameseCurrency, getVariantPrice, getVariantDisplayName } from "@/api/v1/menu/menu-products"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProductVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: MenuProduct | null
  onAddToCart?: (product: MenuProduct, variant: MenuVariant | null, quantity: number, note?: string) => void
}

export function ProductVariantDialog({
  open,
  onOpenChange,
  product,
  onAddToCart
}: ProductVariantDialogProps) {
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  if (!product) return null

  const hasVariants = product.variants && product.variants.length > 0
  const currentPrice = selectedVariant ? getVariantPrice(selectedVariant, product.price) : product.price

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedVariant, quantity, note.trim() || undefined)
    }
    onOpenChange(false)
    // Reset state
    setSelectedVariant(null)
    setQuantity(1)
    setNote("")
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Image */}
          {product.image && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-2">
            {product.description && (
              <p className="text-sm text-gray-600">{product.description}</p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{product.estimateTime} minutes</span>
            </div>
          </div>

          <Separator />

          {/* Variants Selection */}
          {hasVariants ? (
            <div className="space-y-3">
              <h3 className="font-medium">Choose your option:</h3>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-3">
                        <p className="font-medium text-sm">{getVariantDisplayName(variant)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatVietnameseCurrency(getVariantPrice(variant, product.price))}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedVariant?.id === variant.id && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <Badge variant="secondary" className="text-lg">
                {formatVietnameseCurrency(product.price)}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Quantity Selector */}
          <div className="space-y-3">
            <h3 className="font-medium">Quantity:</h3>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="note" className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Any special requests or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          <Separator />

          {/* Total Price */}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">
              {formatVietnameseCurrency(currentPrice * quantity)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              disabled={hasVariants && !selectedVariant}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
