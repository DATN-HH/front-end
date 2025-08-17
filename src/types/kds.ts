// KDS Item Status enum
export enum KdsItemStatus {
    RECEIVED = 'RECEIVED',
    SEND_TO_KITCHEN = 'SEND_TO_KITCHEN',
    COOKING = 'COOKING',
    READY_TO_SERVE = 'READY_TO_SERVE',
    COMPLETED = 'COMPLETED',
}

// Order Type enum
export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKEOUT = 'TAKEOUT',
    DELIVERY = 'DELIVERY',
}

// Staff Role enum
export enum StaffRole {
    KITCHEN = 'KITCHEN',
    WAITER = 'WAITER',
    HOST = 'HOST',
    CASHIER = 'CASHIER',
    MANAGER = 'MANAGER',
    ACCOUNTANT = 'ACCOUNTANT',
    EMPLOYEE = 'EMPLOYEE',
}

// Status labels for display
export const KDS_STATUS_LABELS: Record<KdsItemStatus, string> = {
    [KdsItemStatus.RECEIVED]: 'Received',
    [KdsItemStatus.SEND_TO_KITCHEN]: 'To Do',
    [KdsItemStatus.COOKING]: 'Cooking',
    [KdsItemStatus.READY_TO_SERVE]: 'Ready',
    [KdsItemStatus.COMPLETED]: 'Completed',
};

// Status colors for display
export const KDS_STATUS_COLORS: Record<KdsItemStatus, string> = {
    [KdsItemStatus.RECEIVED]: 'bg-gray-100 text-gray-800 border-gray-300',
    [KdsItemStatus.SEND_TO_KITCHEN]:
        'bg-blue-100 text-blue-800 border-blue-300',
    [KdsItemStatus.COOKING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [KdsItemStatus.READY_TO_SERVE]:
        'bg-green-100 text-green-800 border-green-300',
    [KdsItemStatus.COMPLETED]:
        'bg-purple-100 text-purple-800 border-purple-300',
};

// Order type labels
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
    [OrderType.DINE_IN]: 'Dine In',
    [OrderType.TAKEOUT]: 'Takeout',
    [OrderType.DELIVERY]: 'Delivery',
};

// Staff role labels
export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
    [StaffRole.KITCHEN]: 'Kitchen',
    [StaffRole.WAITER]: 'Waiter',
    [StaffRole.HOST]: 'Host',
    [StaffRole.CASHIER]: 'Cashier',
    [StaffRole.MANAGER]: 'Manager',
    [StaffRole.ACCOUNTANT]: 'Accountant',
    [StaffRole.EMPLOYEE]: 'Employee',
};

// Status transition rules
export const STATUS_TRANSITIONS: Record<KdsItemStatus, any[]> = {
    [KdsItemStatus.RECEIVED]: [KdsItemStatus.SEND_TO_KITCHEN, null],
    [KdsItemStatus.SEND_TO_KITCHEN]: [KdsItemStatus.COOKING],
    [KdsItemStatus.COOKING]: [
        KdsItemStatus.READY_TO_SERVE,
        KdsItemStatus.SEND_TO_KITCHEN,
    ],
    [KdsItemStatus.READY_TO_SERVE]: [
        KdsItemStatus.COMPLETED,
        KdsItemStatus.COOKING,
    ],
    [KdsItemStatus.COMPLETED]: [null, KdsItemStatus.READY_TO_SERVE],
};

// Get next status
export const getNextStatus = (
    currentStatus: KdsItemStatus
): KdsItemStatus | null => {
    const transitions = STATUS_TRANSITIONS[currentStatus];
    return transitions && transitions.length > 0 ? transitions[0] : null;
};

// Get previous status
export const getPreviousStatus = (
    currentStatus: KdsItemStatus
): KdsItemStatus | null => {
    const transitions = STATUS_TRANSITIONS[currentStatus];
    return transitions && transitions.length > 1 ? transitions[1] : null;
};

// Priority colors
export const getPriorityColor = (waitingTimeMinutes: number): string => {
    if (waitingTimeMinutes <= 15) return 'bg-green-500';
    if (waitingTimeMinutes <= 25) return 'bg-yellow-500';
    return 'bg-red-500';
};

// Format waiting time
export const formatWaitingTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

// Tab configuration for KDS
export interface KdsTab {
    id: string;
    label: string;
    status?: KdsItemStatus;
    icon?: string;
}

export const KDS_TABS: KdsTab[] = [
    { id: 'all', label: 'All', icon: 'LayoutGrid' },
    {
        id: 'todo',
        label: 'To Do',
        status: KdsItemStatus.SEND_TO_KITCHEN,
        icon: 'Clock',
    },
    {
        id: 'cooking',
        label: 'Cooking',
        status: KdsItemStatus.COOKING,
        icon: 'ChefHat',
    },
    {
        id: 'ready',
        label: 'Ready',
        status: KdsItemStatus.READY_TO_SERVE,
        icon: 'CheckCircle',
    },
];

// Kanban columns configuration
export interface KanbanColumn {
    id: string;
    title: string;
    status: KdsItemStatus;
    color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
    {
        id: 'todo',
        title: 'To Do',
        status: KdsItemStatus.SEND_TO_KITCHEN,
        color: 'border-blue-200 bg-blue-50',
    },
    {
        id: 'cooking',
        title: 'Cooking',
        status: KdsItemStatus.COOKING,
        color: 'border-yellow-200 bg-yellow-50',
    },
    {
        id: 'ready',
        title: 'Ready',
        status: KdsItemStatus.READY_TO_SERVE,
        color: 'border-green-200 bg-green-50',
    },
    {
        id: 'completed',
        title: 'Completed',
        status: KdsItemStatus.COMPLETED,
        color: 'border-purple-200 bg-purple-50',
    },
];
