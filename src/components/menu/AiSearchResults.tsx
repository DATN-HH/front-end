'use client';

import { AiSearchResponse } from '@/api/v1/menu/ai-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, DollarSign, MessageCircle } from 'lucide-react';

interface AiSearchResultsProps {
    results: AiSearchResponse;
    isLoading: boolean;
}

export function AiSearchResults({ results, isLoading }: AiSearchResultsProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-muted-foreground">AI is searching for recommendations...</span>
                </div>
                <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!results?.success) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-muted-foreground">
                        {results?.message || 'AI search failed. Please try again.'}
                    </p>
                </div>
            </div>
        );
    }

    const { foodCombo, products, summary } = results.data;
    const hasResults = foodCombo.length > 0 || products.length > 0;

    if (!hasResults) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                        No recommendations found for your request. Try a different query.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">AI Recommendations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    {summary ? (
                        <span className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{summary}</span>
                        </span>
                    ) : (
                        "Based on your request, here are our AI-powered recommendations:"
                    )}
                </p>
            </div>

            {/* Food Combos */}
            {foodCombo.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-4">Recommended Combos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {foodCombo.map((combo: any) => (
                            <Card key={combo.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    {combo.image && (
                                        <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={combo.image}
                                                alt={combo.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-food.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <h5 className="font-semibold mb-2">{combo.name}</h5>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {combo.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="font-semibold text-green-600">
                                                ${combo.effectivePrice || combo.price}
                                            </span>
                                        </div>
                                        {combo.estimateTime && (
                                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{combo.estimateTime}min</span>
                                            </div>
                                        )}
                                    </div>
                                    {combo.categoryName && (
                                        <Badge variant="outline" className="mt-2">
                                            {combo.categoryName}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Products */}
            {products.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-4">Recommended Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product: any) => (
                            <Card key={product.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    {product.image && (
                                        <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-food.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <h5 className="font-semibold mb-2">{product.name}</h5>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="font-semibold text-green-600">
                                                ${product.price}
                                            </span>
                                        </div>
                                        {product.estimateTime && (
                                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{product.estimateTime}min</span>
                                            </div>
                                        )}
                                    </div>
                                    {product.category?.name && (
                                        <Badge variant="outline" className="mt-2">
                                            {product.category.name}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}