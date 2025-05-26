'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    Clock,
    ChefHat,
    Star,
    AlertCircle,
    Package,
    Utensils,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    PieChart,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for charts
const revenueData = [
    { day: 'Mon', revenue: 12500, orders: 45 },
    { day: 'Tue', revenue: 15200, orders: 52 },
    { day: 'Wed', revenue: 18900, orders: 68 },
    { day: 'Thu', revenue: 16700, orders: 58 },
    { day: 'Fri', revenue: 22300, orders: 78 },
    { day: 'Sat', revenue: 28500, orders: 95 },
    { day: 'Sun', revenue: 25800, orders: 87 },
];

const popularDishes = [
    { name: 'Beef Pho', orders: 45, revenue: 2250, percentage: 28 },
    {
        name: 'Grilled Pork Vermicelli',
        orders: 38,
        revenue: 1520,
        percentage: 24,
    },
    { name: 'Broken Rice', orders: 32, revenue: 1280, percentage: 20 },
    { name: 'Banh Mi', orders: 28, revenue: 840, percentage: 17 },
    { name: 'Spring Rolls', orders: 25, revenue: 750, percentage: 11 },
];

const recentOrders = [
    {
        id: '#001',
        customer: 'John Smith',
        items: 3,
        total: 285,
        status: 'completed',
        time: '10 min ago',
    },
    {
        id: '#002',
        customer: 'Sarah Johnson',
        items: 2,
        total: 180,
        status: 'preparing',
        time: '15 min ago',
    },
    {
        id: '#003',
        customer: 'Mike Wilson',
        items: 4,
        total: 420,
        status: 'pending',
        time: '20 min ago',
    },
    {
        id: '#004',
        customer: 'Emma Davis',
        items: 1,
        total: 95,
        status: 'completed',
        time: '25 min ago',
    },
    {
        id: '#005',
        customer: 'Alex Brown',
        items: 2,
        total: 165,
        status: 'preparing',
        time: '30 min ago',
    },
    {
        id: '#006',
        customer: 'Lisa Chen',
        items: 3,
        total: 320,
        status: 'completed',
        time: '35 min ago',
    },
];

const orderStatusData = [
    { status: 'Completed', count: 24, color: 'bg-green-500', percentage: 67 },
    { status: 'Preparing', count: 8, color: 'bg-orange-500', percentage: 22 },
    { status: 'Pending', count: 3, color: 'bg-yellow-500', percentage: 8 },
    { status: 'Cancelled', count: 1, color: 'bg-red-500', percentage: 3 },
];

const hourlyOrdersData = [
    { hour: '6AM', orders: 5 },
    { hour: '8AM', orders: 12 },
    { hour: '10AM', orders: 18 },
    { hour: '12PM', orders: 35 },
    { hour: '2PM', orders: 28 },
    { hour: '4PM', orders: 15 },
    { hour: '6PM', orders: 42 },
    { hour: '8PM', orders: 38 },
    { hour: '10PM', orders: 22 },
];

// Simple bar chart component
function SimpleBarChart({
    data,
    dataKey = 'revenue',
    label = 'Revenue',
}: {
    data: any[];
    dataKey?: string;
    label?: string;
}) {
    const maxValue = Math.max(...data.map((d) => d[dataKey]));

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between h-24 gap-1">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-2 flex-1"
                    >
                        <div
                            className="bg-orange-500 rounded-t w-full transition-all hover:bg-orange-600 relative group"
                            style={{
                                height: `${(item[dataKey] / maxValue) * 100}%`,
                                minHeight: '4px',
                            }}
                        >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {typeof item[dataKey] === 'number'
                                    ? item[dataKey].toLocaleString()
                                    : item[dataKey]}
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {item.day || item.hour}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Donut chart component
function DonutChart({ data }: { data: typeof orderStatusData }) {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="flex items-center justify-center space-x-6">
            <div className="relative w-24 h-24">
                <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 36 36"
                >
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                    />
                    {data.map((item, index) => {
                        const offset = data
                            .slice(0, index)
                            .reduce((sum, prev) => sum + prev.percentage, 0);
                        return (
                            <path
                                key={index}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={item.color
                                    .replace('bg-', '')
                                    .replace('green-500', '#10b981')
                                    .replace('orange-500', '#f97316')
                                    .replace('yellow-500', '#eab308')
                                    .replace('red-500', '#ef4444')}
                                strokeWidth="3"
                                strokeDasharray={`${item.percentage}, 100`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-300"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-bold">{total}</div>
                        <div className="text-xs text-muted-foreground">
                            Orders
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-1">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${item.color}`}
                        ></div>
                        <span className="text-xs">{item.status}</span>
                        <span className="text-xs font-semibold ml-auto">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Line chart component
function SimpleLineChart({
    data,
    dataKey = 'orders',
}: {
    data: any[];
    dataKey?: string;
}) {
    const maxValue = Math.max(...data.map((d) => d[dataKey]));
    const minValue = Math.min(...data.map((d) => d[dataKey]));

    const points = data
        .map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y =
                100 -
                ((item[dataKey] - minValue) / (maxValue - minValue)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="space-y-2">
            <div className="relative h-20 w-full">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        points={points}
                        vectorEffect="non-scaling-stroke"
                    />
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y =
                            100 -
                            ((item[dataKey] - minValue) /
                                (maxValue - minValue)) *
                                100;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="#f97316"
                                vectorEffect="non-scaling-stroke"
                                className="hover:r-2 transition-all"
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                {data.slice(0, 3).map((item, index) => (
                    <span key={index}>{item.hour}</span>
                ))}
                <span>...</span>
                {data.slice(-3).map((item, index) => (
                    <span key={index}>{item.hour}</span>
                ))}
            </div>
        </div>
    );
}

export default function RestaurantDashboard() {
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
    const avgOrderValue = totalRevenue / totalOrders;

    return (
        <div className="flex flex-col gap-4 h-screen overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's your restaurant's performance
                        overview.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 px-6 pb-6">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger
                        value="overview"
                        className="flex items-center gap-2"
                    >
                        <Activity className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="analytics"
                        className="flex items-center gap-2"
                    >
                        <PieChart className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger
                        value="orders"
                        className="flex items-center gap-2"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Orders
                    </TabsTrigger>
                    <TabsTrigger
                        value="performance"
                        className="flex items-center gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="overview"
                    className="space-y-4 h-full overflow-auto"
                >
                    {/* Main Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Weekly Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${totalRevenue.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +12.5% from last week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Orders
                                </CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {totalOrders}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +8.2% from yesterday
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Today's Customers
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">127</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +15.3% from yesterday
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Rating
                                </CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4.8</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +0.2 from last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions and Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>
                                    Common restaurant management tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Link href="/orders">
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Orders
                                    </Button>
                                </Link>
                                <Link href="/menu">
                                    <Button
                                        className="w-full h-12"
                                        variant="outline"
                                    >
                                        <Utensils className="mr-2 h-4 w-4" />
                                        Menu
                                    </Button>
                                </Link>
                                <Link href="/inventory">
                                    <Button
                                        className="w-full h-12"
                                        variant="outline"
                                    >
                                        <Package className="mr-2 h-4 w-4" />
                                        Inventory
                                    </Button>
                                </Link>
                                <Link href="/staff">
                                    <Button
                                        className="w-full h-12"
                                        variant="outline"
                                    >
                                        <ChefHat className="mr-2 h-4 w-4" />
                                        Staff
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Today's Highlights
                                </CardTitle>
                                <CardDescription>
                                    Key metrics and achievements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">
                                            Peak hour revenue
                                        </span>
                                    </div>
                                    <span className="font-semibold">
                                        $2,850
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm">
                                            Most popular dish
                                        </span>
                                    </div>
                                    <span className="font-semibold">
                                        Beef Pho
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm">
                                            Avg prep time
                                        </span>
                                    </div>
                                    <span className="font-semibold">
                                        18 min
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-sm">
                                            Customer satisfaction
                                        </span>
                                    </div>
                                    <span className="font-semibold">4.8/5</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent
                    value="analytics"
                    className="space-y-4 h-full overflow-auto"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Weekly Revenue
                                </CardTitle>
                                <CardDescription>
                                    Daily revenue trend
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleBarChart
                                    data={revenueData}
                                    dataKey="revenue"
                                    label="Revenue"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Hourly Orders
                                </CardTitle>
                                <CardDescription>
                                    Order distribution today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleLineChart
                                    data={hourlyOrdersData}
                                    dataKey="orders"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Order Status
                                </CardTitle>
                                <CardDescription>
                                    Current distribution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DonutChart data={orderStatusData} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Top Selling Dishes
                                </CardTitle>
                                <CardDescription>
                                    Most popular items today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {popularDishes
                                        .slice(0, 4)
                                        .map((dish, index) => (
                                            <div
                                                key={index}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="text-sm">
                                                            {dish.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-semibold">
                                                            ${dish.revenue}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({dish.orders})
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                    <div
                                                        className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${dish.percentage}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Revenue Breakdown
                                </CardTitle>
                                <CardDescription>
                                    Revenue sources analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Dine-in</span>
                                        <span className="font-semibold">
                                            65%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full"
                                            style={{ width: '65%' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Takeaway</span>
                                        <span className="font-semibold">
                                            25%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: '25%' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Delivery</span>
                                        <span className="font-semibold">
                                            10%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: '10%' }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent
                    value="orders"
                    className="space-y-4 h-full overflow-auto"
                >
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">11</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently processing
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completed Today
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24</div>
                                <p className="text-xs text-muted-foreground">
                                    +3 from yesterday
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Wait Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">18m</div>
                                <p className="text-xs text-muted-foreground">
                                    -2m from yesterday
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Rush Hour
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">6-8PM</div>
                                <p className="text-xs text-muted-foreground">
                                    Peak time today
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Recent Orders
                            </CardTitle>
                            <CardDescription>
                                Latest order activity and status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {recentOrders.map((order, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">
                                                {order.id}
                                            </span>
                                            <div
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    order.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : order.status ===
                                                            'preparing'
                                                          ? 'bg-orange-100 text-orange-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {order.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.status.slice(1)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {order.customer}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.items} items • $
                                                {order.total}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {order.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="performance"
                    className="space-y-4 h-full overflow-auto"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Order Value
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${avgOrderValue.toFixed(0)}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +$12 from last week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Cancellation Rate
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2.8%</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                                    -0.5% from last week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Customer Retention
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">78%</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    +5% from last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Performance Metrics
                                </CardTitle>
                                <CardDescription>
                                    Key operational indicators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Kitchen Efficiency</span>
                                        <span className="font-semibold">
                                            92%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: '92%' }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Order Accuracy</span>
                                        <span className="font-semibold">
                                            97%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: '97%' }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Customer Satisfaction</span>
                                        <span className="font-semibold">
                                            96%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: '96%' }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Staff Productivity</span>
                                        <span className="font-semibold">
                                            88%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full"
                                            style={{ width: '88%' }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Alerts & Notifications
                                </CardTitle>
                                <CardDescription>
                                    Important updates and warnings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 bg-red-50 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Low inventory alert
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Beef stock: 5kg remaining
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg">
                                        <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Long wait time
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Order #002: 25 minutes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Revenue milestone
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Daily target achieved!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
