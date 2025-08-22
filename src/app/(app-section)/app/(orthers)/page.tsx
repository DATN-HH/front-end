'use client';

import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Clock,
    BarChart3,
    Filter,
    RefreshCw,
    Package,
    Users,
    Calendar,
    Loader2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import {
    useSalesStatistics,
    useOrderMetrics,
    useOrderStatusStatistics,
    usePeakHoursStatistics,
    useProductStatistics,
    SalesStatisticsRequest,
} from '@/api/v1/sales-reports';

// Import components and utilities
import { MetricCard } from '@/components/ui/MetricCard';
import { 
    RevenueAreaChart, 
    StackedOrderChart, 
    PeakHoursHeatmap, 
    ProductDualAxisChart 
} from '@/components/charts';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

// Dashboard loading state
function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header skeleton */}
                <div className="text-center sm:text-left">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                    </div>
                </div>

                {/* Filters skeleton */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="flex flex-wrap gap-2">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metrics skeleton */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts skeleton */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                                    <div className="h-32 bg-gray-200 rounded"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Loading indicator */}
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                        <span className="text-lg font-medium">Loading dashboard data...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RestaurantDashboard() {
    // State for user-controlled filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [timePeriod, setTimePeriod] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY');
    const [orderType, setOrderType] = useState<string>('ALL');
    const [paymentType, setPaymentType] = useState<string>('ALL');

    // API parameters based on user selections
    const apiParams: SalesStatisticsRequest = useMemo(() => {
        const params: SalesStatisticsRequest = {
            startDate,
            endDate,
            timePeriod,
        };

        if (orderType && orderType !== 'ALL') params.orderType = orderType as any;
        if (paymentType && paymentType !== 'ALL') params.paymentType = paymentType as any;

        return params;
    }, [startDate, endDate, timePeriod, orderType, paymentType]);

    // Previous period for comparison
    const prevApiParams: SalesStatisticsRequest = useMemo(() => {
        const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        const prevEndDate = format(subDays(new Date(startDate), 1), 'yyyy-MM-dd');
        const prevStartDate = format(subDays(new Date(startDate), daysDiff + 1), 'yyyy-MM-dd');

        return {
            ...apiParams,
            startDate: prevStartDate,
            endDate: prevEndDate,
        };
    }, [apiParams, startDate, endDate]);

    // API calls
    const { data: salesStats, isLoading: salesLoading, refetch: refetchSales } = useSalesStatistics(apiParams);
    const { data: orderMetrics, isLoading: orderLoading, refetch: refetchOrders } = useOrderMetrics(apiParams);
    const { data: orderStatus, isLoading: statusLoading, refetch: refetchStatus } = useOrderStatusStatistics(apiParams);
    const { data: peakHours, isLoading: peakLoading, refetch: refetchPeak } = usePeakHoursStatistics(apiParams);
    const { data: productStats, isLoading: productLoading, refetch: refetchProducts } = useProductStatistics(apiParams);

    // Previous period data for comparison
    const { data: prevSalesStats } = useSalesStatistics(prevApiParams);
    const { data: prevOrderMetrics } = useOrderMetrics(prevApiParams);

    const isLoading = salesLoading || orderLoading || statusLoading || peakLoading || productLoading;
    const isInitialLoading = isLoading && !salesStats && !orderMetrics && !orderStatus && !peakHours && !productStats;

    // Refresh all data
    const handleRefresh = () => {
        refetchSales();
        refetchOrders();
        refetchStatus();
        refetchPeak();
        refetchProducts();
    };

    // Calculate percentage changes
    const revenueChange = useMemo(() => {
        if (!salesStats?.totalRevenue || !prevSalesStats?.totalRevenue) return 0;
        return ((salesStats.totalRevenue - prevSalesStats.totalRevenue) / prevSalesStats.totalRevenue) * 100;
    }, [salesStats, prevSalesStats]);

    const ordersChange = useMemo(() => {
        if (!orderMetrics?.totalOrders || !prevOrderMetrics?.totalOrders) return 0;
        return ((orderMetrics.totalOrders - prevOrderMetrics.totalOrders) / prevOrderMetrics.totalOrders) * 100;
    }, [orderMetrics, prevOrderMetrics]);

    const avgOrderValueChange = useMemo(() => {
        if (!orderMetrics?.averageOrderValue || !prevOrderMetrics?.averageOrderValue) return 0;
        return ((orderMetrics.averageOrderValue - prevOrderMetrics.averageOrderValue) / prevOrderMetrics.averageOrderValue) * 100;
    }, [orderMetrics, prevOrderMetrics]);

    // Quick date range setters
    const setDateRange = (range: string) => {
        const today = new Date();
        switch (range) {
            case 'today':
                setStartDate(format(today, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setStartDate(format(yesterday, 'yyyy-MM-dd'));
                setEndDate(format(yesterday, 'yyyy-MM-dd'));
                break;
            case 'last7days':
                setStartDate(format(subDays(today, 6), 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
                break;
            case 'last30days':
                setStartDate(format(subDays(today, 29), 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
                break;
            case 'thisMonth':
                setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
                break;
            case 'lastMonth':
                const lastMonth = subDays(startOfMonth(today), 1);
                setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                break;
        }
    };

    // Show loading state for initial load
    if (isInitialLoading) {
        return <DashboardLoading />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center sm:text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="h-8 w-8 text-orange-500" />
                        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
                    </div>
                    <p className="text-gray-600 mt-2">Monitor your restaurant's performance and analytics</p>
                </div>

                {/* Filters and Controls */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-orange-500" />
                            Filters & Date Range
                        </CardTitle>
                        <CardDescription>
                            Customize your dashboard view with date ranges and filters
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Quick Date Presets */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Quick Date Ranges</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('today')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Today
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('yesterday')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    Yesterday
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('last7days')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    Last 7 Days
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('last30days')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    Last 30 Days
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('thisMonth')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    This Month
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setDateRange('lastMonth')}
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    Last Month
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleRefresh} 
                                    disabled={isLoading}
                                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Custom Date Range and Filters */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Custom Filters</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timePeriod">Time Period</Label>
                                    <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAY">Daily</SelectItem>
                                            <SelectItem value="WEEK">Weekly</SelectItem>
                                            <SelectItem value="MONTH">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orderType">Order Type</Label>
                                    <Select value={orderType} onValueChange={setOrderType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Types</SelectItem>
                                            <SelectItem value="DINE_IN">Dine In</SelectItem>
                                            <SelectItem value="TAKEOUT">Takeout</SelectItem>
                                            <SelectItem value="DELIVERY">Delivery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentType">Payment Type</Label>
                                    <Select value={paymentType} onValueChange={setPaymentType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Types</SelectItem>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total Revenue"
                        value={isLoading ? '...' : formatCurrency(salesStats?.totalRevenue ?? 0)}
                        change={revenueChange}
                        icon={DollarSign}
                        isLoading={isLoading}
                        subtitle="Total sales revenue"
                        trend={revenueChange >= 0 ? 'up' : 'down'}
                        formatPercentage={formatPercentage}
                    />

                    <MetricCard
                        title="Total Orders"
                        value={isLoading ? '...' : (orderMetrics?.totalOrders ?? 0)}
                        change={ordersChange}
                        icon={ShoppingCart}
                        isLoading={isLoading}
                        subtitle="Number of orders"
                        trend={ordersChange >= 0 ? 'up' : 'down'}
                        formatPercentage={formatPercentage}
                    />

                    <MetricCard
                        title="Average Order Value"
                        value={isLoading ? '...' : formatCurrency(orderMetrics?.averageOrderValue ?? 0)}
                        change={avgOrderValueChange}
                        icon={TrendingUp}
                        isLoading={isLoading}
                        subtitle="Average per order"
                        trend={avgOrderValueChange >= 0 ? 'up' : 'down'}
                        formatPercentage={formatPercentage}
                    />

                    <MetricCard
                        title="Peak Hour"
                        value={isLoading ? '...' : `${peakHours?.peakHour ?? 0}:00`}
                        icon={Clock}
                        isLoading={isLoading}
                        subtitle={`${peakHours?.peakHourOrderCount ?? 0} orders at peak`}
                        trend="neutral"
                        formatPercentage={formatPercentage}
                    />
                </div>

                {/* Product Statistics Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                        title="Total Items Sold"
                        value={isLoading ? '...' : (productStats?.totalItemsSold ?? 0)}
                        icon={Package}
                        isLoading={isLoading}
                        subtitle="Total quantity of items sold"
                        trend="neutral"
                        formatPercentage={formatPercentage}
                    />

                    <MetricCard
                        title="Total Item Revenue"
                        value={isLoading ? '...' : formatCurrency(productStats?.totalItemRevenue ?? 0)}
                        icon={DollarSign}
                        isLoading={isLoading}
                        subtitle="Revenue from all items"
                        trend="neutral"
                        formatPercentage={formatPercentage}
                    />

                    <MetricCard
                        title="Unique Products"
                        value={isLoading ? '...' : (productStats?.uniqueProductCount ?? 0)}
                        icon={BarChart3}
                        isLoading={isLoading}
                        subtitle="Different products sold"
                        trend="neutral"
                        formatPercentage={formatPercentage}
                    />
                </div>

                {/* Charts and Analytics */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Revenue Chart */}
                    <Card className="hover:shadow-lg transition-shadow duration-200 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Revenue & Deposits Trend
                            </CardTitle>
                            <CardDescription>
                                Revenue and deposits over time ({timePeriod.toLowerCase()}) with dual axis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueAreaChart
                                data={salesStats?.timeSeriesData?.map(item => ({
                                    period: item.period,
                                    revenue: item.revenue,
                                    deposits: item.deposits,
                                    day: format(new Date(item.period), timePeriod === 'DAY' ? 'MMM dd' : 'MMM yyyy')
                                })) || []}
                                title="Revenue vs Deposits"
                                formatCurrency={formatCurrency}
                            />
                        </CardContent>
                    </Card>

                    {/* Order Metrics Chart */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-blue-500" />
                                Order Trends by Type
                            </CardTitle>
                            <CardDescription>
                                Stacked breakdown of orders by type over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StackedOrderChart
                                data={orderMetrics?.timeSeriesData?.map(item => ({
                                    period: item.period,
                                    totalOrders: item.totalOrders,
                                    dineInOrders: item.dineInOrders,
                                    takeoutOrders: item.takeoutOrders,
                                    deliveryOrders: item.deliveryOrders,
                                    day: format(new Date(item.period), timePeriod === 'DAY' ? 'MMM dd' : 'MMM yyyy')
                                })) || []}
                                title="Order Type Distribution"
                            />
                        </CardContent>
                    </Card>

                    {/* Peak Hours Chart */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-purple-500" />
                                Peak Hours Analysis
                            </CardTitle>
                            <CardDescription>
                                24-hour activity heatmap and hourly distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PeakHoursHeatmap
                                data={peakHours?.hourlyData || []}
                                peakHour={peakHours?.peakHour}
                                title="Daily Activity Pattern"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Product Statistics Time Series */}
                {productStats?.timeSeriesData && productStats.timeSeriesData.length > 0 && (
                    <Card className="hover:shadow-lg transition-shadow duration-200 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-500" />
                                Product Sales Analytics
                            </CardTitle>
                            <CardDescription>
                                Dual-axis view: quantity (bars) vs revenue (line) with unique products indicator
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductDualAxisChart
                                data={productStats.timeSeriesData.map(item => ({
                                    period: item.period,
                                    totalQuantity: item.totalQuantity,
                                    totalRevenue: item.totalRevenue,
                                    uniqueProducts: item.uniqueProducts,
                                    day: format(new Date(item.period), timePeriod === 'DAY' ? 'MMM dd' : 'MMM yyyy')
                                }))}
                                title="Product Performance Over Time"
                                formatCurrency={formatCurrency}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Additional Analytics */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Order Type Breakdown */}
                    {orderMetrics?.orderTypeMetrics && orderMetrics.orderTypeMetrics.length > 0 && (
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-cyan-500" />
                                    Order Type Distribution
                                </CardTitle>
                                <CardDescription>
                                    Breakdown by order type with detailed metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {orderMetrics.orderTypeMetrics.map((orderType, index) => {
                                    const colors = [
                                        'from-orange-500 to-orange-400',
                                        'from-blue-500 to-blue-400',
                                        'from-green-500 to-green-400'
                                    ];
                                    const bgColors = [
                                        'bg-orange-50 border-orange-200',
                                        'bg-blue-50 border-blue-200',
                                        'bg-green-50 border-green-200'
                                    ];
                                    const textColors = [
                                        'text-orange-700',
                                        'text-blue-700',
                                        'text-green-700'
                                    ];
                                    const labels = {
                                        'DINE_IN': 'Dine-in',
                                        'TAKEOUT': 'Takeaway',
                                        'DELIVERY': 'Delivery'
                                    };

                                    return (
                                        <div key={orderType.orderType} className={`p-4 rounded-lg border ${bgColors[index]} hover:shadow-md transition-shadow`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-semibold ${textColors[index]}`}>
                                                        {labels[orderType.orderType as keyof typeof labels] || orderType.orderType}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {orderType.orderCount} orders • {formatCurrency(orderType.averageOrderValue)} avg
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(orderType.totalRevenue)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {orderType.revenuePercentage.toFixed(1)}% revenue
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-gray-700">
                                                    <span>Orders: {orderType.orderPercentage.toFixed(1)}%</span>
                                                    <span>Revenue: {orderType.revenuePercentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`bg-gradient-to-r ${colors[index]} h-3 rounded-full transition-all duration-500 shadow-sm`}
                                                        style={{ width: `${orderType.orderPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Type Breakdown */}
                    {salesStats?.paymentTypeStats && salesStats.paymentTypeStats.length > 0 && (
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-500" />
                                    Payment Methods
                                </CardTitle>
                                <CardDescription>
                                    Payment distribution across different methods
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {salesStats.paymentTypeStats.map((payment, index) => {
                                    const colors = [
                                        'from-emerald-500 to-emerald-400',
                                        'from-blue-500 to-blue-400',
                                        'from-purple-500 to-purple-400',
                                        'from-pink-500 to-pink-400',
                                        'from-yellow-500 to-yellow-400',
                                        'from-red-500 to-red-400'
                                    ];

                                    return (
                                        <div key={payment.paymentType} className="space-y-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">{payment.paymentType}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(payment.totalAmount)}
                                                    </span>
                                                    <div className="text-xs text-gray-600">
                                                        {payment.orderCount} orders • {payment.percentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`bg-gradient-to-r ${colors[index % colors.length]} h-3 rounded-full transition-all duration-500 shadow-sm`}
                                                    style={{ width: `${payment.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Top Products */}
                    {productStats?.topSellingProducts && productStats.topSellingProducts.length > 0 && (
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-amber-500" />
                                    Top Selling Products
                                </CardTitle>
                                <CardDescription>
                                    Best performing products by revenue
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {productStats.topSellingProducts.slice(0, 5).map((product, index) => {
                                    const rankColors = [
                                        'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
                                        'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
                                        'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100',
                                        'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900',
                                        'bg-gradient-to-r from-green-400 to-green-500 text-green-900'
                                    ];

                                    return (
                                        <div key={product.productId} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${rankColors[index]}`}>
                                                        #{index + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {product.productName}
                                                            </span>
                                                            {product.isCombo && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                                    COMBO
                                                                </span>
                                                            )}
                                                        </div>
                                                        {product.comboName && (
                                                            <span className="text-xs text-gray-600 mt-1">
                                                                {product.comboName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(product.totalRevenue)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {product.totalQuantity} sold • {formatCurrency(product.averagePrice)} avg
                                                    </div>
                                                    <div className="text-xs text-emerald-600 font-semibold">
                                                        {product.revenuePercentage.toFixed(1)}% of total
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                                                    style={{
                                                        width: `${product.revenuePercentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* No Data Message */}
                {!isLoading && !salesStats && !orderMetrics && !orderStatus && !peakHours && !productStats && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="text-center py-16">
                            <div className="max-w-md mx-auto">
                                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <BarChart3 className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Data Available</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    No data found for the selected date range and filters. Try adjusting your filters or selecting a different time period.
                                </p>
                                <Button
                                    onClick={handleRefresh}
                                    variant="outline"
                                    className="hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function RestaurantDashboardPage() {
    return <RestaurantDashboard />;
}
