'use client';

import { Search, Grid, List } from 'lucide-react';
import { useState } from 'react';

import { MenuItemCard } from '@/components/common/menu-item-card';
import { MenuItemCardMobile } from '@/components/common/menu-item-card-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { menuItems, categories } from '@/lib/restaurant-data';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('name');

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviewCount - a.reviewCount;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const promotionItems = menuItems.filter((item) => item.isPromotion);
  const bestSellerItems = menuItems.filter((item) => item.isBestSeller);
  const comboItems = menuItems.filter((item) => item.isCombo);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Culinary Excellence
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest
            ingredients and traditional techniques
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search our menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile View Toggle */}
            <div className="flex lg:hidden gap-2">
              <Button
                variant={mobileViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMobileViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={mobileViewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMobileViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Special Sections */}
        {selectedCategory === 'All' && (
          <>
            {/* Promotions */}
            {promotionItems.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                  🔥 Special Offers
                </h2>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {promotionItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
                <div className="md:hidden">
                  {mobileViewMode === 'list' ? (
                    <div className="space-y-3">
                      {promotionItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="list"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {promotionItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="grid"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Best Sellers */}
            {bestSellerItems.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                  ⭐ Chef's Recommendations
                </h2>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {bestSellerItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
                <div className="md:hidden">
                  {mobileViewMode === 'list' ? (
                    <div className="space-y-3">
                      {bestSellerItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="list"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {bestSellerItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="grid"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Combo Deals */}
            {comboItems.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                  🍽️ Curated Experiences
                </h2>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comboItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
                <div className="md:hidden">
                  {mobileViewMode === 'list' ? (
                    <div className="space-y-3">
                      {comboItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="list"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {comboItems.map((item) => (
                        <MenuItemCardMobile
                          key={item.id}
                          item={item}
                          viewMode="grid"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* All Items */}
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">
            {selectedCategory === 'All' ? 'Complete Menu' : selectedCategory}
          </h2>
          {sortedItems.length > 0 ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                {mobileViewMode === 'list' ? (
                  <div className="space-y-3">
                    {sortedItems.map((item) => (
                      <MenuItemCardMobile
                        key={item.id}
                        item={item}
                        viewMode="list"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {sortedItems.map((item) => (
                      <MenuItemCardMobile
                        key={item.id}
                        item={item}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No items found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
