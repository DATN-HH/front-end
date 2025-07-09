// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { PageTitle } from '@/components/layouts/app-section/page-title';
// import { Users, Settings, UserPlus, Calculator } from 'lucide-react';
// import { ManagerLeaveManagement } from '@/features/scheduling/components/ManagerLeaveManagement';
// import { AddLeaveForEmployeeModal } from '@/features/scheduling/components/AddLeaveForEmployeeModal';
// import { UpdateLeaveBalanceModal } from '@/features/scheduling/components/UpdateLeaveBalanceModal';
// import {
//     usePendingLeaveRequests,
//     useBranchLeaveStatistics,
//     useLowBalanceEmployees,
//     useAllLeaveRequests,
// } from '@/api/v1/leave-management';
// import { LeaveQuickStats } from '@/features/scheduling/components/LeaveQuickStats';
// import { LeaveStatisticsCard } from '@/features/scheduling/components/LeaveStatisticsCard';
// import { PendingRequestsList } from '@/features/scheduling/components/PendingRequestsList';
// import { RecentActivityList } from '@/features/scheduling/components/RecentActivityList';
// import { LeaveBalanceOverview } from '@/features/scheduling/components/LeaveBalanceOverview';
// import { useAuth } from '@/contexts/auth-context';
// import { Role } from '@/lib/rbac';
// import { ProtectedRoute } from '@/components/protected-component';

// export function LeaveManagement() {
//     const { user } = useAuth();
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
//     const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState(false);
//     const currentYear = new Date().getFullYear();
//     const branchId = user?.branch?.id || 0;

//     // API hooks
//     const { data: pendingRequests = [], isLoading: isLoadingPending } = usePendingLeaveRequests(branchId);
//     const { data: statistics, isLoading: isLoadingStats } = useBranchLeaveStatistics(branchId, currentYear);
//     const { data: lowBalanceEmployees = [], isLoading: isLoadingBalance } = useLowBalanceEmployees(branchId, 2.0);
//     const { data: allRequests = [], isLoading: isLoadingAll } = useAllLeaveRequests(branchId, currentYear);

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <PageTitle
//                 icon={Users}
//                 title="Leave Management"
//                 left={
//                     <div className="flex gap-2">
//                         <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-fit">
//                             <Settings className="h-4 w-4" />
//                             Management
//                         </Button>
//                         <Button
//                             onClick={() => setIsAddLeaveModalOpen(true)}
//                             className="gap-2 w-fit"
//                         >
//                             <UserPlus className="h-4 w-4" />
//                             Add Leave
//                         </Button>
//                         <Button
//                             onClick={() => setIsUpdateBalanceModalOpen(true)}
//                             variant="outline"
//                             className="gap-2 w-fit"
//                         >
//                             <Calculator className="h-4 w-4" />
//                             Update Balance
//                         </Button>
//                     </div>
//                 }
//             />


//             {/* Quick Stats */}
//             <LeaveQuickStats
//                 statistics={statistics}
//                 isLoading={isLoadingStats}
//                 pendingCount={pendingRequests.length}
//                 lowBalanceCount={lowBalanceEmployees.length}
//             />

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left Column - Pending Requests & Statistics */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <PendingRequestsList
//                         requests={pendingRequests}
//                         isLoading={isLoadingPending}
//                         onViewAll={() => setIsModalOpen(true)}
//                     />

//                     <LeaveStatisticsCard
//                         statistics={statistics}
//                         isLoading={isLoadingStats}
//                         year={currentYear}
//                     />
//                 </div>

//                 {/* Right Column - Leave Balance Overview */}
//                 <div className="space-y-6">
//                     <LeaveBalanceOverview
//                         lowBalanceEmployees={lowBalanceEmployees}
//                         isLoading={isLoadingBalance}
//                         threshold={2}
//                     />
//                 </div>
//             </div>

//             {/* Recent Activity - Full Width */}
//             <RecentActivityList
//                 requests={allRequests}
//                 isLoading={isLoadingAll}
//                 onViewAll={() => setIsModalOpen(true)}
//             />

//             {/* Management Modal */}
//             <ManagerLeaveManagement
//                 open={isModalOpen}
//                 onOpenChange={setIsModalOpen}
//                 branchId={branchId}
//             />

//             {/* Add Leave for Employee Modal */}
//             <AddLeaveForEmployeeModal
//                 open={isAddLeaveModalOpen}
//                 onOpenChange={setIsAddLeaveModalOpen}
//                 branchId={branchId}
//             />

//             {/* Update Leave Balance Modal */}
//             <UpdateLeaveBalanceModal
//                 open={isUpdateBalanceModalOpen}
//                 onOpenChange={setIsUpdateBalanceModalOpen}
//             />
//         </div>
//     );
// }

// export default function LeaveManagementPage() {
//     return (
//         <ProtectedRoute requiredRoles={[Role.MANAGER]}>
//             <LeaveManagement />
//         </ProtectedRoute>
//     );
// }