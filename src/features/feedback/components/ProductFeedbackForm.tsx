'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Upload, X, Package, Check, ChevronsUpDown, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { customerFeedbackAPI, ProductFeedbackCreateDto, FeedbackRatingDto } from '@/api/v1/feedback';
import { useCustomToast } from '@/lib/show-toast';
import { useUploadMultipleImages } from '@/api/v1/images';
import { useRouter } from 'next/navigation';

const ratingCategories = [
  { key: 'FOOD_QUALITY', label: 'Food Quality' },
  { key: 'TASTE', label: 'Taste' },
  { key: 'PRESENTATION', label: 'Presentation' },
  { key: 'VALUE', label: 'Value for Money' },
  { key: 'SERVICE', label: 'Service' },
] as const;

const orderTypes = [
  { value: 'POS_ORDER', label: 'Dine-in' },
  { value: 'PRE_ORDER', label: 'Pre-order' },
  { value: 'BOOKING_TABLE', label: 'Table Booking' },
] as const;

const feedbackSchema = z.object({
  overallRating: z.number().min(1, 'Please provide an overall rating').max(5),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  reviewText: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
  customerName: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
  branchId: z.number().min(1, 'Please select a branch'),
  productId: z.number().min(1, 'Please select a product'),

  orderType: z.enum(['POS_ORDER', 'PRE_ORDER', 'BOOKING_TABLE']).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Product {
  id: number;
  name: string;
  category?: string;
}

interface ProductFeedbackFormProps {
  branches: Array<{ id: number; name: string }>;
  products: Product[];
  onSuccess?: () => void;
  onCancel?: () => void;
  preSelectedProduct?: Product;
}

export function ProductFeedbackForm({ 
  branches, 
  products, 
  onSuccess, 
  onCancel, 
  preSelectedProduct 
}: ProductFeedbackFormProps) {
  const toast = useCustomToast();
  const router = useRouter();
  const uploadImagesMutation = useUploadMultipleImages();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(preSelectedProduct || null);

  // Update selected product when preSelectedProduct changes
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProduct(preSelectedProduct);
    }
  }, [preSelectedProduct]);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overallRating: 0,
      title: '',
      reviewText: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      branchId: 0,
      productId: selectedProduct?.id || 0,
    },
  });

  const handleRatingChange = (category: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedImages.length > 5) {
      toast.error('Error', 'Maximum 5 images allowed');
      return;
    }
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = async (data: FeedbackFormData) => {
    if (data.overallRating === 0) {
      toast.error('Error', 'Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        try {
          const uploadResults = await uploadImagesMutation.mutateAsync({
            files: uploadedImages,
            folder: 'feedback'
          });
          imageUrls = uploadResults.map(result => result.secureUrl);
        } catch (error) {
          console.error('Failed to upload images:', error);
          toast.error('Error', 'Failed to upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const feedbackData: ProductFeedbackCreateDto = {
        ...data,
        categoryRatings,
        imageUrls: imageUrls,
      };

      await customerFeedbackAPI.submitProductFeedback(feedbackData);

      // Show success state
      setIsSuccess(true);
      toast.success('Success', 'Your product feedback has been submitted successfully!');
      
      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      toast.error('Error', error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, size = 24 }: { value: number; onChange: (rating: number) => void; size?: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              size={size}
              className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-500" />
          Product Feedback
        </CardTitle>
        <CardDescription>
          Share your experience with a specific product. Your feedback helps us improve our menu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          // Success State
          <div className="text-center py-8 space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-green-700">Thank You!</h3>
              <p className="text-gray-600">Your product feedback has been submitted successfully.</p>
              <p className="text-sm text-gray-500">We appreciate your time and will use your feedback to improve our menu.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={onCancel} variant="outline">
                Close
              </Button>
              <Button 
                onClick={() => {
                  setIsSuccess(false);
                  form.reset();
                  setCategoryRatings({});
                  setUploadedImages([]);
                  setSelectedProduct(null);
                  setOpen(false);
                }}
                variant="default"
              >
                Submit Another Review
              </Button>
            </div>
          </div>
        ) : (
          // Form State
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product *</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {selectedProduct ? (
                              <div className="flex flex-col items-start">
                                <span>{selectedProduct.name}</span>
                                {selectedProduct.category && (
                                  <span className="text-xs text-muted-foreground">{selectedProduct.category}</span>
                                )}
                              </div>
                            ) : (
                              "Select product..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandList>
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup>
                              {products.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={`${product.name} ${product.category || ''}`}
                                  onSelect={() => {
                                    setSelectedProduct(product);
                                    field.onChange(product.id);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    {product.category && (
                                      <span className="text-xs text-muted-foreground">{product.category}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Selected Product Display */}
            {selectedProduct && (
              <div className="p-4 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedProduct.name}</p>
                    {selectedProduct.category && (
                      <p className="text-sm text-blue-700">{selectedProduct.category}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="overallRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        size={32}
                      />
                      <span className="text-sm text-muted-foreground">
                        {field.value > 0 ? `${field.value} out of 5 stars` : 'Click to rate'}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Ratings */}
            <div className="space-y-4">
              <FormLabel>Detailed Ratings</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratingCategories.map((category) => (
                  <div key={category.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{category.label}</span>
                    <StarRating
                      value={categoryRatings[category.key] || 0}
                      onChange={(rating) => handleRatingChange(category.key, rating)}
                      size={20}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Content */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your product feedback" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reviewText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about this product..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your thoughts about the product quality, taste, presentation, etc. (minimum 10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orderTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* Image Upload */}
            <div className="space-y-4">
              <FormLabel>Product Photos (Optional)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload photos of the product
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG up to 10MB each (max 5 photos)
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Product Feedback'
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}
