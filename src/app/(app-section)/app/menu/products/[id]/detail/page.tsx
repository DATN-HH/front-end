'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
    useProductDetail, 
    useArchiveProduct, 
    useUnarchiveProduct,
    ProductType 
} from '@/api/v1/menu/products';
import { ProductEditModalNew } from '@/components/modals';
import { 
    useAllProductAttributes,
    useProductVariants,
    useAssignAttributesToProduct,
    useRemoveAttributesFromProduct,
    useCreateProductVariant,
    useUpdateProductVariant,
    useUpdateVariantPricing,
    useDeleteProductVariant,
    useArchiveProductVariant,
    useUnarchiveProductVariant,
    ProductAttributeResponse,
    ProductVariantResponse,
    ProductVariantCreateRequest,
    ProductVariantUpdateRequest,
    ProductVariantPricingRequest,
    ProductAttributeAssignRequest,
    AttributeAssignment
} from '@/api/v1/menu/product-attributes';
import { 
    Package, 
    Edit, 
    Archive, 
    RotateCcw, 
    DollarSign, 
    Clock, 
    Tag, 
    Image as ImageIcon,
    ShoppingCart,
    TrendingUp,
    Package2,
    BarChart3,
    Settings,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Form schemas
const assignmentFormSchema = z.object({
    attributeAssignments: z.array(z.object({
        attributeId: z.number(),
        selectedValueIds: z.array(z.number()),
        textValue: z.string().optional(),
    })),
});

const variantFormSchema = z.object({
    attributeValueIds: z.array(z.number()).min(1, 'At least one attribute value must be selected'),
    price: z.number().optional(),
    cost: z.number().optional(),
    internalReference: z.string().optional(),
    isActive: z.boolean(),
});

const editVariantFormSchema = z.object({
    price: z.number().optional(),
    cost: z.number().optional(),
    internalReference: z.string().optional(),
    isActive: z.boolean(),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;
type VariantFormData = z.infer<typeof variantFormSchema>;
type EditVariantFormData = z.infer<typeof editVariantFormSchema>;

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const { toast } = useToast();
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Variant management state
    const [activeVariantTab, setActiveVariantTab] = useState('list');
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [showEditVariantModal, setShowEditVariantModal] = useState(false);
    
    // Variant filtering and search state
    const [variantSearchTerm, setVariantSearchTerm] = useState('');
    const [variantStatusFilter, setVariantStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const { data: product, isLoading, error } = useProductDetail(Number(productId));
    
    // Variant management API hooks
    const { data: attributes = [] } = useAllProductAttributes();
    const { data: variants = [], isLoading: variantsLoading } = useProductVariants(Number(productId));
    
    // Debug: Log variants data
    console.log('Variants data:', variants, 'Loading:', variantsLoading);
    const assignAttributesMutation = useAssignAttributesToProduct();
    const removeAttributesMutation = useRemoveAttributesFromProduct();
    const createVariantMutation = useCreateProductVariant();
    const updateVariantMutation = useUpdateProductVariant();
    const updateVariantPricingMutation = useUpdateVariantPricing();
    const deleteVariantMutation = useDeleteProductVariant();
    const archiveVariantMutation = useArchiveProductVariant();
    const unarchiveVariantMutation = useUnarchiveProductVariant();
    const archiveProductMutation = useArchiveProduct();
    const unarchiveProductMutation = useUnarchiveProduct();

    // Forms
    const assignmentForm = useForm<AssignmentFormData>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            attributeAssignments: [],
        },
    });

    const variantForm = useForm<VariantFormData>({
        resolver: zodResolver(variantFormSchema),
        defaultValues: {
            attributeValueIds: [],
            price: undefined,
            cost: undefined,
            internalReference: '',
            isActive: true,
        },
    });

    const editVariantForm = useForm<EditVariantFormData>({
        resolver: zodResolver(editVariantFormSchema),
        defaultValues: {
            price: undefined,
            cost: undefined,
            internalReference: '',
            isActive: true,
        },
    });

    // Initialize assignment form with available attributes
    useEffect(() => {
        if (attributes.length > 0) {
            const initialAssignments = attributes
                .filter(attr => attr.status === 'ACTIVE')
                .map(attr => ({
                    attributeId: attr.id,
                    selectedValueIds: [],
                    textValue: '',
                }));
            
            assignmentForm.reset({
                attributeAssignments: initialAssignments,
            });
        }
    }, [attributes, assignmentForm]);

    const handleArchive = async () => {
        if (!product) return;
        
        try {
            await archiveProductMutation.mutateAsync(product.id);
            toast({
                title: 'Product Archived',
                description: `${product.name} has been archived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to archive product. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnarchive = async () => {
        if (!product) return;
        
        try {
            await unarchiveProductMutation.mutateAsync(product.id);
            toast({
                title: 'Product Unarchived',
                description: `${product.name} has been unarchived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to unarchive product. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'DELETED':
                return <Badge variant="destructive">Deleted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: ProductType) => {
        const typeColors = {
            CONSUMABLE: 'bg-blue-100 text-blue-800',
            STOCKABLE: 'bg-green-100 text-green-800',
            SERVICE: 'bg-purple-100 text-purple-800',
            EXTRA: 'bg-orange-100 text-orange-800',
        };

        return (
            <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
                {type}
            </Badge>
        );
    };

    // Filter variants based on search and status
    const filteredVariants = variants.filter(variant => {
        const matchesSearch = variant.displayName.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                            variant.internalReference?.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                            variant.attributeCombination?.toLowerCase().includes(variantSearchTerm.toLowerCase());
        
        const matchesStatus = variantStatusFilter === 'all' || 
                            (variantStatusFilter === 'active' && variant.status === 'ACTIVE') ||
                            (variantStatusFilter === 'inactive' && variant.status === 'INACTIVE');
        
        return matchesSearch && matchesStatus;
    });

    // Get money attributes for a variant
    const getMoneyAttributes = (variant: ProductVariantResponse) => {
        if (!variant.attributeValues) return [];
        
        return variant.attributeValues
            .filter(attrValue => {
                const attribute = attributes.find(attr => attr.id === attrValue.attributeId);
                return attribute?.isMoneyAttribute === true;
            })
            .map(attrValue => ({
                name: attrValue.attributeName,
                value: attrValue.name,
                textValue: attrValue.textValue
            }));
    };

    // Variant management functions
    const onAssignAttributes = async (data: AssignmentFormData) => {
        try {
            const requestData: ProductAttributeAssignRequest = {
                productId: Number(productId),
                attributeAssignments: data.attributeAssignments.filter(assignment => {
                    // Include assignments that have either selected values or text value
                    const hasSelectedValues = assignment.selectedValueIds && assignment.selectedValueIds.length > 0;
                    const hasTextValue = assignment.textValue && assignment.textValue.trim() !== '';
                    return hasSelectedValues || hasTextValue;
                }),
            };

            const newVariants = await assignAttributesMutation.mutateAsync(requestData);
            
            console.log('Assignment successful, new variants:', newVariants);
            
            toast({
                title: 'Attributes Assigned',
                description: `Successfully assigned attributes and generated ${newVariants.length} variants.`,
            });

            // Reset form and switch to variants list
            assignmentForm.reset();
            setActiveVariantTab('list');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to assign attributes. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEditVariant = (variant: ProductVariantResponse) => {
        setEditingVariantId(variant.id);
        editVariantForm.reset({
            price: Number(variant.price) || 0,
            cost: Number(variant.cost) || 0,
            internalReference: variant.internalReference || '',
            isActive: variant.isActive || true,
        });
        setShowEditVariantModal(true);
    };

    const onUpdateVariant = async (data: EditVariantFormData) => {
        if (!editingVariantId) return;

        try {
            // Update pricing using the pricing endpoint
            if (data.price !== undefined || data.cost !== undefined) {
                const pricingData: ProductVariantPricingRequest = {
                    variantId: editingVariantId,
                    price: data.price,
                    cost: data.cost,
                };
                await updateVariantPricingMutation.mutateAsync(pricingData);
            }
            
            // Update other fields using the regular update endpoint
            if (data.internalReference !== undefined || data.isActive !== undefined) {
                const updateData: ProductVariantUpdateRequest = {
                    internalReference: data.internalReference,
                    isActive: data.isActive,
                };
                await updateVariantMutation.mutateAsync({ id: editingVariantId, data: updateData });
            }
            
            toast({
                title: 'Variant Updated',
                description: 'Product variant has been updated successfully.',
            });

            setShowEditVariantModal(false);
            setEditingVariantId(null);
            editVariantForm.reset();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update variant. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveAllAttributes = async () => {
        if (!confirm('Are you sure you want to remove all attributes from this product? This will delete all variants.')) {
            return;
        }

        try {
            await removeAttributesMutation.mutateAsync(Number(productId));
            toast({
                title: 'Attributes Removed',
                description: 'All attributes have been removed from this product.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to remove attributes. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const onCreateVariant = async (data: VariantFormData) => {
        try {
            const requestData: ProductVariantCreateRequest = {
                productId: Number(productId),
                attributeValueIds: data.attributeValueIds,
                price: data.price || undefined,
                cost: data.cost || undefined,
                internalReference: data.internalReference || undefined,
                isActive: data.isActive,
            };

            await createVariantMutation.mutateAsync(requestData);

            toast({
                title: 'Variant Created',
                description: 'Product variant has been created successfully.',
            });

            variantForm.reset();
            setActiveVariantTab('list');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create variant. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteVariant = async (variantId: number, variantName: string) => {
        if (!confirm(`Are you sure you want to delete variant "${variantName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteVariantMutation.mutateAsync(variantId);
            toast({
                title: 'Variant Deleted',
                description: `${variantName} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete variant. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleArchiveVariant = async (variantId: number, variantName: string) => {
        try {
            await archiveVariantMutation.mutateAsync(variantId);
            toast({
                title: 'Variant Archived',
                description: `${variantName} has been archived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to archive variant. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnarchiveVariant = async (variantId: number, variantName: string) => {
        try {
            await unarchiveVariantMutation.mutateAsync(variantId);
            toast({
                title: 'Variant Unarchived',
                description: `${variantName} has been unarchived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to unarchive variant. Please try again.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading product details...</span>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={Package}
                    title="Product Not Found"
                    left={
                        <Link href="/app/menu/products">
                            <Button variant="outline">
                                Back to Products
                            </Button>
                        </Link>
                    }
                />
                <div className="text-center text-red-500">
                    Product not found or failed to load.
                </div>
            </div>
        );
    }

    const isArchived = product.status === 'DELETED';

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Package}
                title={`${product.name} ${product.internalReference ? `(${product.internalReference})` : ''}`}
                left={
                    <div className="flex gap-2">
                        <Link href="/app/menu/products">
                            <Button variant="outline">
                                Back to Products
                            </Button>
                        </Link>
                        {!isArchived && (
                            <>
                                <Button onClick={() => setShowEditModal(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>

                                <Button
                                    variant="outline"
                                    className="text-red-500"
                                    onClick={handleArchive}
                                    disabled={archiveProductMutation.isPending}
                                >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                </Button>
                            </>
                        )}
                        {isArchived && (
                            <Button
                                variant="outline"
                                onClick={handleUnarchive}
                                disabled={unarchiveProductMutation.isPending}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Unarchive
                            </Button>
                        )}
                    </div>
                }
            />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Product Image */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Product Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                            <p>No image</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">{getStatusBadge(product.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <div className="mt-1">{getTypeBadge(product.type)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Category</label>
                                    <div className="mt-1">
                                        {product.category ? (
                                            <Link href={`/app/menu/categories/${product.category.id}/detail`}>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                                    {product.category.name}
                                                </Badge>
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400">No category</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Size</label>
                                    <div className="mt-1">{product.size || '-'}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Group</label>
                                    <div className="mt-1">{product.groupName || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Sale Price</label>
                                    <div className="mt-1 font-semibold text-lg">
                                        {formatCurrency(product.price)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Cost</label>
                                    <div className="mt-1">{formatCurrency(product.cost)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Margin</label>
                                    <div className="mt-1">
                                        {product.price && product.cost ? (
                                            <span className="text-green-600 font-medium">
                                                {formatCurrency(product.price - product.cost)} 
                                                ({Math.round(((product.price - product.cost) / product.price) * 100)}%)
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estimate Time</label>
                                    <div className="mt-1 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {product.estimateTime ? `${product.estimateTime} minutes` : '-'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Product Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">Can be sold</span>
                                    <Badge variant={product.canBeSold ? 'default' : 'secondary'}>
                                        {product.canBeSold ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">Can be purchased</span>
                                    <Badge variant={product.canBePurchased ? 'default' : 'secondary'}>
                                        {product.canBePurchased ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="font-medium text-gray-500">Created At</label>
                                    <div>{new Date(product.createdAt).toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="font-medium text-gray-500">Updated At</label>
                                    <div>{new Date(product.updatedAt).toLocaleString()}</div>
                                </div>
                                {product.createdBy && (
                                    <div>
                                        <label className="font-medium text-gray-500">Created By</label>
                                        <div>{product.createdBy}</div>
                                    </div>
                                )}
                                {product.updatedBy && (
                                    <div>
                                        <label className="font-medium text-gray-500">Updated By</label>
                                        <div>{product.updatedBy}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Sales Information
                            </CardTitle>
                            <CardDescription>
                                Sales-related settings and information for this product.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.salesInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Sales Description</label>
                                        <div className="mt-1">{product.salesInfo.salesDescription || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Invoice Policy</label>
                                        <div className="mt-1">{product.salesInfo.invoicePolicy || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Track Service</label>
                                        <div className="mt-1">
                                            <Badge variant={product.salesInfo.trackService ? 'default' : 'secondary'}>
                                                {product.salesInfo.trackService ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Customer Lead Time</label>
                                        <div className="mt-1">{product.salesInfo.customerLeadTime || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No sales information available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* POS Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>POS Settings</CardTitle>
                            <CardDescription>
                                Point of Sale specific settings for this product.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.posInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Available in POS</label>
                                        <div className="mt-1">
                                            <Badge variant={product.posInfo.availableInPos ? 'default' : 'secondary'}>
                                                {product.posInfo.availableInPos ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">POS Category</label>
                                        <div className="mt-1">{product.posInfo.posCategoryName || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">POS Sequence</label>
                                        <div className="mt-1">{product.posInfo.posSequence || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">To Weigh</label>
                                        <div className="mt-1">
                                            <Badge variant={product.posInfo.toWeigh ? 'default' : 'secondary'}>
                                                {product.posInfo.toWeigh ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No POS information available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package2 className="h-5 w-5" />
                                Inventory Information
                            </CardTitle>
                            <CardDescription>
                                Inventory and stock management settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.inventoryInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Route</label>
                                        <div className="mt-1">{product.inventoryInfo.route || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Inventory Rule</label>
                                        <div className="mt-1">{product.inventoryInfo.inventoryRule || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Weight</label>
                                        <div className="mt-1">{product.inventoryInfo.weight ? `${product.inventoryInfo.weight} kg` : '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Volume</label>
                                        <div className="mt-1">{product.inventoryInfo.volume ? `${product.inventoryInfo.volume} m³` : '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Stock Quantity</label>
                                        <div className="mt-1">
                                            {product.inventoryInfo.stockQuantity !== undefined ? (
                                                <Badge variant={
                                                    product.inventoryInfo.stockThreshold && 
                                                    product.inventoryInfo.stockQuantity <= product.inventoryInfo.stockThreshold 
                                                        ? 'destructive' 
                                                        : 'default'
                                                }>
                                                    {product.inventoryInfo.stockQuantity}
                                                </Badge>
                                            ) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Stock Threshold</label>
                                        <div className="mt-1">{product.inventoryInfo.stockThreshold || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No inventory information available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Purchase Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Information</CardTitle>
                            <CardDescription>
                                Purchase and supplier related settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.purchaseInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Purchase Description</label>
                                        <div className="mt-1">{product.purchaseInfo.purchaseDescription || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Vendor Lead Time</label>
                                        <div className="mt-1">{product.purchaseInfo.vendorLeadTime || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Minimum Quantity</label>
                                        <div className="mt-1">{product.purchaseInfo.minimumQuantity || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No purchase information available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Accounting Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Accounting Information</CardTitle>
                            <CardDescription>
                                Accounting and financial settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.accountingInfo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Revenue Account</label>
                                        <div className="mt-1">{product.accountingInfo.revenueAccount || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Expense Account</label>
                                        <div className="mt-1">{product.accountingInfo.expenseAccount || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tax Category</label>
                                        <div className="mt-1">{product.accountingInfo.taxCategory || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No accounting information available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variants" className="space-y-6">
                    <Tabs value={activeVariantTab} onValueChange={setActiveVariantTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">
                                Variants ({variants.length})
                            </TabsTrigger>
                            <TabsTrigger value="assign">
                                Create Variants
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="list" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Product Variants</h3>
                                <Button onClick={() => setActiveVariantTab('assign')}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Create Variants
                                </Button>
                            </div>

                            {variantsLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    <p className="mt-2">Loading variants...</p>
                                </div>
                            ) : variants.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-8">
                                        <Package className="h-16 w-16 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
                                        <p className="text-gray-500 mb-4">
                                            Assign attributes first to create variants automatically, or create custom variants.
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={() => setActiveVariantTab('assign')}>
                                                <Settings className="h-4 w-4 mr-2" />
                                                Create Variants
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {/* Search and Filter Controls */}
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                            <div className="flex-1 max-w-md">
                                                <Input
                                                    placeholder="Search variants..."
                                                    value={variantSearchTerm}
                                                    onChange={(e) => setVariantSearchTerm(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                            <Select value={variantStatusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setVariantStatusFilter(value)}>
                                                <SelectTrigger className="w-full sm:w-[180px]">
                                                    <SelectValue placeholder="Filter by status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Variants</SelectItem>
                                                    <SelectItem value="active">Active Only</SelectItem>
                                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="text-sm text-gray-600 flex items-center">
                                                {filteredVariants.length} of {variants.length} variants
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAllAttributes}
                                                className="text-red-500"
                                                disabled={removeAttributesMutation.isPending}
                                            >
                                                <Tag className="h-4 w-4 mr-1" />
                                                Remove All Attributes
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-4">
                                        {filteredVariants.map((variant) => {
                                            const moneyAttributes = getMoneyAttributes(variant);
                                            const isArchived = variant.status === 'INACTIVE';
                                            
                                            return (
                                                <Card key={variant.id} className={isArchived ? 'opacity-60 border-dashed' : ''}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-3 flex-1">
                                                                {/* Variant Name and Status */}
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-semibold text-lg">{variant.displayName}</h4>
                                                                    <Badge variant={variant.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                                        {variant.status === 'ACTIVE' ? 'Active' : 'Archived'}
                                                                    </Badge>
                                                                    {variant.isActive && (
                                                                        <Badge variant="outline" className="text-green-600">
                                                                            Available
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Internal Reference */}
                                                                {variant.internalReference && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Reference: {variant.internalReference}
                                                                    </div>
                                                                )}

                                                                {/* Money Attributes - Prominently displayed */}
                                                                {moneyAttributes.length > 0 && (
                                                                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                                                        <div className="text-sm font-medium text-green-800 mb-2">
                                                                            <DollarSign className="h-4 w-4 inline mr-1" />
                                                                            Money Attributes
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {moneyAttributes.map((attr, index) => (
                                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                                    <span className="font-medium text-green-700">{attr.name}:</span>
                                                                                    <span className="text-green-900 font-semibold">
                                                                                        {attr.textValue ? formatCurrency(Number(attr.textValue)) : attr.value}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Regular Attributes */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {variant.attributeValues?.filter(attrValue => {
                                                                        const attribute = attributes.find(attr => attr.id === attrValue.attributeId);
                                                                        return attribute?.isMoneyAttribute !== true;
                                                                    }).map((attrValue) => (
                                                                        <Badge key={attrValue.id} variant="outline">
                                                                            {attrValue.attributeName}: {attrValue.textValue || attrValue.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>

                                                                {/* Pricing Information */}
                                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                                    <span>Price: {formatCurrency(variant.effectivePrice)}</span>
                                                                    <span>Cost: {formatCurrency(variant.effectiveCost)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex items-center space-x-2 ml-4">
                                                                {variant.status === 'ACTIVE' ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleArchiveVariant(variant.id, variant.displayName)}
                                                                        disabled={archiveVariantMutation.isPending}
                                                                        className="text-orange-600 hover:text-orange-700"
                                                                    >
                                                                        <Archive className="h-4 w-4 mr-1" />
                                                                        Archive
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleUnarchiveVariant(variant.id, variant.displayName)}
                                                                        disabled={unarchiveVariantMutation.isPending}
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <RotateCcw className="h-4 w-4 mr-1" />
                                                                        Unarchive
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-600"
                                                                    onClick={() => handleDeleteVariant(variant.id, variant.displayName)}
                                                                    disabled={deleteVariantMutation.isPending}
                                                                >
                                                                    <Tag className="h-4 w-4 mr-1" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    
                                    {filteredVariants.length === 0 && variants.length > 0 && (
                                        <div className="text-center py-8">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No variants match your search criteria.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setVariantSearchTerm('');
                                                    setVariantStatusFilter('all');
                                                }}
                                                className="mt-2"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="assign" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assign Attributes to Product</CardTitle>
                                    <CardDescription>
                                        Select attribute values to automatically generate product variants.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...assignmentForm}>
                                        <form onSubmit={assignmentForm.handleSubmit(onAssignAttributes)} className="space-y-6">
                                            {attributes
                                                .filter(attr => attr.status === 'ACTIVE')
                                                .map((attribute, index) => (
                                                    <div key={attribute.id} className="space-y-3">
                                                                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                            {attribute.displayType === 'SELECT' && <ChevronDown className="h-4 w-4" />}
                                            {attribute.displayType === 'RADIO' && <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                            {attribute.displayType === 'COLOR' && <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-blue-500" />}
                                            {attribute.displayType === 'CHECKBOX' && <div className="w-3 h-3 border border-gray-400" />}
                                            {attribute.displayType === 'TEXTBOX' && <div className="w-4 h-4 border border-gray-400 rounded" />}
                                            {attribute.name}
                                        </FormLabel>
                                        
                                        {/* SELECT display type - multiple select dropdown */}
                                        {attribute.displayType === 'SELECT' && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Select multiple values (hold Ctrl/Cmd)</div>
                                                <FormField
                                                    control={assignmentForm.control}
                                                    name={`attributeAssignments.${index}.selectedValueIds`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <select
                                                                    multiple
                                                                    value={field.value?.map(id => id.toString()) || []}
                                                                    onChange={(e) => {
                                                                        const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                                                        field.onChange(selectedValues);
                                                                    }}
                                                                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    {attribute.values?.map((value) => (
                                                                        <option key={value.id} value={value.id}>
                                                                            {value.name}
                                                                            {value.textValue && ` ("${value.textValue}")`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* RADIO display type - checkboxes (since we need multiple selection for assignment) */}
                                        {attribute.displayType === 'RADIO' && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Select multiple values for variant generation</div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {attribute.values?.map((value) => (
                                                        <FormField
                                                            key={value.id}
                                                            control={assignmentForm.control}
                                                            name={`attributeAssignments.${index}.selectedValueIds`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(value.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const currentValues = field.value || [];
                                                                                if (checked) {
                                                                                    field.onChange([...currentValues, value.id]);
                                                                                } else {
                                                                                    field.onChange(currentValues.filter(id => id !== value.id));
                                                                                }
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="text-sm font-normal flex items-center gap-2 cursor-pointer">
                                                                            {value.colorCode && (
                                                                                <div 
                                                                                    className="w-4 h-4 rounded border border-gray-300"
                                                                                    style={{ backgroundColor: value.colorCode }}
                                                                                />
                                                                            )}
                                                                            {value.name}
                                                                        </FormLabel>
                                                                        {value.textValue && (
                                                                            <div className="text-xs text-gray-600">
                                                                                "{value.textValue}"
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* COLOR display type - color swatches */}
                                        {attribute.displayType === 'COLOR' && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Select multiple colors</div>
                                                <FormField
                                                    control={assignmentForm.control}
                                                    name={`attributeAssignments.${index}.selectedValueIds`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                                                                    {attribute.values?.map((value) => {
                                                                        const isSelected = field.value?.includes(value.id);
                                                                        return (
                                                                            <div
                                                                                key={value.id}
                                                                                className={`
                                                                                    relative w-12 h-12 rounded-lg border-2 cursor-pointer transition-all
                                                                                    ${isSelected 
                                                                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                                                                        : 'border-gray-300 hover:border-gray-400'
                                                                                    }
                                                                                `}
                                                                                style={{ backgroundColor: value.colorCode || '#f3f4f6' }}
                                                                                onClick={() => {
                                                                                    const currentValues = field.value || [];
                                                                                    if (isSelected) {
                                                                                        field.onChange(currentValues.filter(id => id !== value.id));
                                                                                    } else {
                                                                                        field.onChange([...currentValues, value.id]);
                                                                                    }
                                                                                }}
                                                                                title={`${value.name}${value.textValue ? ` ("${value.textValue}")` : ''}`}
                                                                            >
                                                                                {isSelected && (
                                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                                        <div className="w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center">
                                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* CHECKBOX display type - checkboxes */}
                                        {attribute.displayType === 'CHECKBOX' && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {attribute.values?.map((value) => (
                                                    <FormField
                                                        key={value.id}
                                                        control={assignmentForm.control}
                                                        name={`attributeAssignments.${index}.selectedValueIds`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(value.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentValues = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...currentValues, value.id]);
                                                                            } else {
                                                                                field.onChange(currentValues.filter(id => id !== value.id));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel className="text-sm font-normal flex items-center gap-2 cursor-pointer">
                                                                        {value.colorCode && (
                                                                            <div 
                                                                                className="w-4 h-4 rounded border border-gray-300"
                                                                                style={{ backgroundColor: value.colorCode }}
                                                                            />
                                                                        )}
                                                                        {value.name}
                                                                    </FormLabel>
                                                                    {value.textValue && (
                                                                        <div className="text-xs text-gray-600">
                                                                            "{value.textValue}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* TEXTBOX display type - text input */}
                                        {attribute.displayType === 'TEXTBOX' && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Enter text value (leave empty to skip this attribute)</div>
                                                <FormField
                                                    control={assignmentForm.control}
                                                    name={`attributeAssignments.${index}.textValue`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={`Enter ${attribute.name.toLowerCase()} value...`}
                                                                    value={field.value || ''}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                                    </div>
                                                ))}

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={assignAttributesMutation.isPending}
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    {assignAttributesMutation.isPending ? 'Assigning...' : 'Assign Attributes'}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Analytics & Statistics
                            </CardTitle>
                            <CardDescription>
                                Performance metrics and statistics for this product.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {product.smartButtons ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package2 className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium text-blue-900">On Hand</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {product.smartButtons.onHandCount || 0}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            <span className="font-medium text-green-900">Sold</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {product.smartButtons.soldCount || 0}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                                            <span className="font-medium text-orange-900">Orders</span>
                                        </div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {product.smartButtons.ordersCount || 0}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="h-5 w-5 text-purple-600" />
                                            <span className="font-medium text-purple-900">Variants</span>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {product.smartButtons.variantsCount || 0}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="h-5 w-5 text-red-600" />
                                            <span className="font-medium text-red-900">Promotions</span>
                                        </div>
                                        <div className="text-2xl font-bold text-red-600">
                                            {product.smartButtons.promotionsCount || 0}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No analytics data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Variant Modal */}
            <Dialog open={showEditVariantModal} onOpenChange={setShowEditVariantModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Product Variant</DialogTitle>
                        <DialogDescription>
                            Update the variant pricing and details.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...editVariantForm}>
                        <form onSubmit={editVariantForm.handleSubmit(onUpdateVariant)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={editVariantForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (VND)</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editVariantForm.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cost (VND)</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editVariantForm.control}
                                name="internalReference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Internal Reference</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Optional internal reference"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editVariantForm.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Active</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Whether this variant is active and available
                                            </div>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditVariantModal(false);
                                        setEditingVariantId(null);
                                        editVariantForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateVariantMutation.isPending}
                                >
                                    {updateVariantMutation.isPending ? 'Updating...' : 'Update Variant'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ProductEditModalNew
                open={showEditModal}
                onOpenChange={setShowEditModal}
                productId={Number(productId)}
            />
        </div>
    );
}
