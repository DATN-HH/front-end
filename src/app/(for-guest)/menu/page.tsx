'use client';

import { Search, Sparkles, Send, Mic, Globe } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

import { aiSearchMenu, AiSearchResponse } from '@/api/v1/menu/ai-search';

import { useAllCategories } from '@/api/v1/menu/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import { FoodComboSection } from '@/features/guess-menu/components/FoodComboSection';
import { MenuCategorySection } from '@/features/guess-menu/components/MenuCategorySection';
import { AiSearchResults } from '@/components/menu/AiSearchResults';
import { SpeechRecognition } from '@/components/speech-to-text/SpeechRecognition';

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState<number | 'All'>(
        'All'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiSearchEnabled, setIsAiSearchEnabled] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<any>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);
const [speechLanguage, setSpeechLanguage] = useState('vi-VN'); // Vietnamese by default

    // Fetch categories data
    const { data: categoriesData, isLoading: categoriesLoading } =
        useAllCategories();

    // Process categories for UI
    const categories = useMemo(() => {
        if (!categoriesData) return [];
        // Filter out categories without products (will be handled by lazy loading)
        return categoriesData.filter((cat) => cat.status === 'ACTIVE');
    }, [categoriesData]);

    // Get filtered categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery || isAiSearchEnabled) return categories;
        return categories.filter((category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery, isAiSearchEnabled]);

    // Handle AI search
    const handleAiSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || !isAiSearchEnabled) return;

            setIsAiSearching(true);
            try {
                const results = await aiSearchMenu(query.trim());
                setAiSearchResults(results);
            } catch (error) {
                console.error('AI search failed:', error);
                setAiSearchResults({
                    success: false,
                    code: 500,
                    message: 'AI search failed. Please try again.',
                    data: { foodCombo: [], products: [] },
                });
            } finally {
                setIsAiSearching(false);
            }
        },
        [isAiSearchEnabled]
    );

    // Handle submit for AI search
    const handleSubmitSearch = useCallback(() => {
        if (searchQuery.trim() && isAiSearchEnabled) {
            handleAiSearch(searchQuery);
        }
    }, [searchQuery, isAiSearchEnabled, handleAiSearch]);

    // Handle search input changes
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);

            // For regular search (non-AI), filter immediately
            if (!isAiSearchEnabled && !value.trim()) {
                setAiSearchResults(null);
            }
        },
        [isAiSearchEnabled]
    );

    // Handle key press events in the search input
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && isAiSearchEnabled && searchQuery.trim()) {
                handleAiSearch(searchQuery);
            }
        },
        [isAiSearchEnabled, searchQuery, handleAiSearch]
    );

    // Show loading state
    if (categoriesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
                        Culinary Excellence
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover our carefully crafted dishes made with the
                        finest ingredients and traditional techniques
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1 flex items-center gap-2 w-full lg:w-2/3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder={
                                        isAiSearchEnabled
                                            ? "Ask AI what you're looking for..."
                                            : 'Search categories...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleKeyPress}
                                    className="pl-10 pr-24"
                                    disabled={isAiSearching}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                    {/* Speech Recognition Button - Only show when AI search is enabled */}
                                    {isAiSearchEnabled && (
                                        <div className="relative group">
                                            <SpeechRecognition 
                                                onTranscript={(text) => {
                                                    if (text && text.trim()) {
                                                        console.log('Received transcript:', text);
                                                        // Update search query with transcript text
                                                        handleSearchChange(text);
                                                        // Automatically submit after speech recognition with short delay
                                                        setTimeout(() => {
                                                            if (text.trim()) {
                                                                handleSubmitSearch();
                                                            }
                                                        }, 500);
                                                    }
                                                }}
                                                disabled={isAiSearching}
                                                language={speechLanguage}
                                            />
                                            {/* Tooltip for speech button */}
                                            <div className="absolute -top-10 right-0 bg-black bg-opacity-80 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                Click to speak in {speechLanguage === 'vi-VN' ? 'Vietnamese' : 
                                                                  speechLanguage === 'en-US' ? 'English' : 
                                                                  speechLanguage === 'fr-FR' ? 'French' : 
                                                                  speechLanguage === 'ja-JP' ? 'Japanese' : 
                                                                  speechLanguage === 'zh-CN' ? 'Chinese' : 'selected language'}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* AI Toggle Button */}
                                    <Button
                                        variant={
                                            isAiSearchEnabled ? 'default' : 'ghost'
                                        }
                                        size="sm"
                                        className={`h-8 w-8 p-0 transition-all duration-300 ${
                                            isAiSearchEnabled
                                                ? 'bg-primary text-primary-foreground shadow-lg'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                        onClick={() => {
                                            setIsAiSearchEnabled(
                                                !isAiSearchEnabled
                                            );
                                            if (isAiSearchEnabled) {
                                                setAiSearchResults(null);
                                                setSearchQuery('');
                                            }
                                        }}
                                        title={
                                            isAiSearchEnabled
                                                ? 'Switch to normal search'
                                                : 'Enable AI search'
                                        }
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Submit Button - Only shown when AI search is enabled */}
                            {isAiSearchEnabled && (
                                <Button
                                    onClick={handleSubmitSearch}
                                    disabled={
                                        isAiSearching || !searchQuery.trim()
                                    }
                                    className="shrink-0"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {/* Language selector for speech recognition - only visible when AI search is enabled */}
                            {isAiSearchEnabled && (
                                <Select
                                    value={speechLanguage}
                                    onValueChange={setSpeechLanguage}
                                >
                                    <SelectTrigger className="w-auto min-w-24 max-w-32">
                                        <div className="flex items-center gap-2 truncate">
                                            <Globe className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {speechLanguage === 'vi-VN' ? 'Vietnamese' : 
                                                 speechLanguage === 'en-US' ? 'English' : 
                                                 speechLanguage === 'fr-FR' ? 'French' : 
                                                 speechLanguage === 'ja-JP' ? 'Japanese' : 
                                                 speechLanguage === 'zh-CN' ? 'Chinese' : 'Language'}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Languages</SelectLabel>
                                            <SelectItem value="vi-VN">Vietnamese</SelectItem>
                                            <SelectItem value="en-US">English</SelectItem>
                                            <SelectItem value="fr-FR">French</SelectItem>
                                            <SelectItem value="ja-JP">Japanese</SelectItem>
                                            <SelectItem value="zh-CN">Chinese</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                            
                            {/* Category Filter */}
                            <Select
                                value={selectedCategory.toString()}
                                onValueChange={(value) =>
                                    setSelectedCategory(
                                        value === 'All' ? 'All' : parseInt(value)
                                    )
                                }
                            >
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* AI Search Results */}
                {isAiSearchEnabled && (isAiSearching || aiSearchResults) && (
                    <AiSearchResults
                        results={aiSearchResults}
                        isLoading={isAiSearching}
                    />
                )}

                {/* Regular Menu Content - Show only when AI search is not active */}
                {!isAiSearchEnabled && (
                    <>
                        {/* Food Combos Section */}
                        <FoodComboSection className="mb-8 md:mb-12" />

                        {/* Menu Categories with Lazy Loading */}
                        <div className="space-y-8 md:space-y-12">
                            {selectedCategory === 'All'
                                ? // Show all categories
                                  filteredCategories.map((category) => (
                                      <MenuCategorySection
                                          key={category.id}
                                          categoryId={category.id}
                                          categoryName={category.name}
                                      />
                                  ))
                                : // Show specific category
                                  (() => {
                                      const category = categories.find(
                                          (cat) => cat.id === selectedCategory
                                      );
                                      return category ? (
                                          <MenuCategorySection
                                              key={category.id}
                                              categoryId={category.id}
                                              categoryName={category.name}
                                          />
                                      ) : null;
                                  })()}
                        </div>
                    </>
                )}

                {/* No Results Message */}
                {filteredCategories.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No categories found matching "{searchQuery}".
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                        >
                            Clear Search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
