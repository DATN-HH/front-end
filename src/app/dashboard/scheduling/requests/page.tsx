"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  CalendarIcon, 
  Plus, 
  Check, 
  X, 
  Clock,
  User,
  Filter,
  Search,
  Eye
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TimeOffRequest {
  id: number
  employeeName: string
  employeeRole: string
  requestType: "vacation" | "sick" | "personal" | "emergency"
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  reviewedBy?: string
  reviewedDate?: string
  notes?: string
}

// Mock data
const mockRequests: TimeOffRequest[] = [
  {
    id: 1,
    employeeName: "John Doe",
    employeeRole: "Manager",
    requestType: "vacation",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    days: 6,
    reason: "Family vacation to Hawaii",
    status: "pending",
    submittedDate: "2024-01-15",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    employeeRole: "Server",
    requestType: "sick",
    startDate: "2024-01-25",
    endDate: "2024-01-25",
    days: 1,
    reason: "Doctor appointment",
    status: "approved",
    submittedDate: "2024-01-20",
    reviewedBy: "Manager",
    reviewedDate: "2024-01-21",
  },
  {
    id: 3,
    employeeName: "Mike Johnson",
    employeeRole: "Chef",
    requestType: "personal",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    days: 3,
    reason: "Moving to new apartment",
    status: "rejected",
    submittedDate: "2024-01-10",
    reviewedBy: "Manager",
    reviewedDate: "2024-01-12",
    notes: "Insufficient coverage during busy period",
  },
  {
    id: 4,
    employeeName: "Sarah Wilson",
    employeeRole: "Server",
    requestType: "emergency",
    startDate: "2024-01-30",
    endDate: "2024-01-31",
    days: 2,
    reason: "Family emergency",
    status: "approved",
    submittedDate: "2024-01-28",
    reviewedBy: "Manager",
    reviewedDate: "2024-01-28",
  },
]

export default function TimeOffRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<TimeOffRequest[]>(mockRequests)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null)

  // New request form state
  const [newRequest, setNewRequest] = useState({
    employeeName: "",
    requestType: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vacation":
        return "bg-blue-100 text-blue-800"
      case "sick":
        return "bg-orange-100 text-orange-800"
      case "personal":
        return "bg-purple-100 text-purple-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.requestType === typeFilter
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: "approved" as const, reviewedBy: "Manager", reviewedDate: new Date().toISOString().split('T')[0] }
        : req
    ))
    toast({
      title: "Request Approved",
      description: "Time-off request has been approved.",
    })
  }

  const handleReject = (id: number) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: "rejected" as const, reviewedBy: "Manager", reviewedDate: new Date().toISOString().split('T')[0] }
        : req
    ))
    toast({
      title: "Request Rejected",
      description: "Time-off request has been rejected.",
    })
  }

  const handleSubmitNewRequest = () => {
    if (!newRequest.employeeName || !newRequest.requestType || !newRequest.startDate || !newRequest.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const days = differenceInDays(newRequest.endDate, newRequest.startDate) + 1

    const request: TimeOffRequest = {
      id: requests.length + 1,
      employeeName: newRequest.employeeName,
      employeeRole: "Staff", // This would come from employee data
      requestType: newRequest.requestType as any,
      startDate: format(newRequest.startDate, "yyyy-MM-dd"),
      endDate: format(newRequest.endDate, "yyyy-MM-dd"),
      days,
      reason: newRequest.reason,
      status: "pending",
      submittedDate: format(new Date(), "yyyy-MM-dd"),
    }

    setRequests(prev => [request, ...prev])
    setNewRequest({
      employeeName: "",
      requestType: "",
      startDate: undefined,
      endDate: undefined,
      reason: "",
    })
    setShowNewRequestDialog(false)

    toast({
      title: "Request Submitted",
      description: "Time-off request has been submitted for review.",
    })
  }

  const handleViewDetails = (request: TimeOffRequest) => {
    setSelectedRequest(request)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time-off Requests</h1>
          <p className="text-muted-foreground">
            Manage staff time-off requests and approvals
          </p>
        </div>
        <Button onClick={() => setShowNewRequestDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by employee or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-sm text-gray-500">{request.employeeRole}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(request.requestType)}>
                      {request.requestType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(request.startDate), "MMM dd, yyyy")}</div>
                      {request.startDate !== request.endDate && (
                        <div className="text-gray-500">
                          to {format(new Date(request.endDate), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.days} day{request.days > 1 ? 's' : ''}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {format(new Date(request.submittedDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No time-off requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === "pending").length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === "approved").length}
                </div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === "rejected").length}
                </div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Time-off Request</DialogTitle>
            <DialogDescription>
              Submit a new time-off request for review
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee Name *</Label>
              <Input
                id="employee"
                value={newRequest.employeeName}
                onChange={(e) => setNewRequest({ ...newRequest, employeeName: e.target.value })}
                placeholder="Enter employee name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Request Type *</Label>
              <Select
                value={newRequest.requestType}
                onValueChange={(value) => setNewRequest({ ...newRequest, requestType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newRequest.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRequest.startDate ? format(newRequest.startDate, "MMM dd, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newRequest.startDate}
                      onSelect={(date) => setNewRequest({ ...newRequest, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newRequest.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRequest.endDate ? format(newRequest.endDate, "MMM dd, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newRequest.endDate}
                      onSelect={(date) => setNewRequest({ ...newRequest, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={newRequest.reason}
                onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                placeholder="Enter reason for time-off request"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNewRequest}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Employee</Label>
                  <p className="font-medium">{selectedRequest.employeeName}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.employeeRole}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={getTypeColor(selectedRequest.requestType)}>
                    {selectedRequest.requestType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                  <p>{format(new Date(selectedRequest.startDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Date</Label>
                  <p>{format(new Date(selectedRequest.endDate), "MMM dd, yyyy")}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Duration</Label>
                <p>{selectedRequest.days} day{selectedRequest.days > 1 ? 's' : ''}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Reason</Label>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.reviewedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reviewed By</Label>
                    <p className="text-sm">{selectedRequest.reviewedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reviewed Date</Label>
                    <p className="text-sm">
                      {selectedRequest.reviewedDate && format(new Date(selectedRequest.reviewedDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 