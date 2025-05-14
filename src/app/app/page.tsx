import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, UserCog, Users, FileText, Bell } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Menu+ Personnel Management System
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Roles</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Shifts This Week
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">-2 from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/test/scheduling/roles">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Manage Job Roles
              </Button>
            </Link>
            <Link href="/scheduling/shifts">
              <Button className="w-full" variant="outline">
                Create Work Shifts
              </Button>
            </Link>
            <Link href="/scheduling/schedule">
              <Button className="w-full" variant="outline">
                View Schedule
              </Button>
            </Link>
            <Link href="/employees">
              <Button className="w-full" variant="outline">
                Manage Employees
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-orange-100">
                  <UserCog className="h-4 w-4 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New job role created</p>
                  <p className="text-xs text-muted-foreground">
                    "Head Chef" role was added by Admin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Today at 10:30 AM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Schedule published</p>
                  <p className="text-xs text-muted-foreground">
                    Next week's schedule was published
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Yesterday at 5:15 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-orange-100">
                  <Bell className="h-4 w-4 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Time-off request</p>
                  <p className="text-xs text-muted-foreground">
                    John Smith requested time off for May 15-16
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 days ago at 2:45 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
