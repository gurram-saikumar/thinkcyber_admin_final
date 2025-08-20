import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Filter } from 'lucide-react';

const sampleUsers = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'Active',
    enrollments: 5,
    joinDate: '2024-01-15',
    avatar: '/avatars/alice.jpg'
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    status: 'Active',
    enrollments: 3,
    joinDate: '2024-02-20',
    avatar: '/avatars/bob.jpg'
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    status: 'Inactive',
    enrollments: 8,
    joinDate: '2024-03-10',
    avatar: '/avatars/carol.jpg'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    status: 'Pending',
    enrollments: 1,
    joinDate: '2024-01-05',
    avatar: '/avatars/david.jpg'
  }
];

export default function UsersPage() {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs /> 
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Users Management</h1>
            <p className='text-muted-foreground'>
              Manage all users in your educational platform
            </p>
          </div>
          <Button>
            <UserPlus className='mr-2 h-4 w-4' />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>2,451</div>
              <p className='text-xs text-muted-foreground'>
                +15% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>1,892</div>
              <p className='text-xs text-muted-foreground'>
                +8% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>156</div>
              <p className='text-xs text-muted-foreground'>
                +22% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Avg. Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>4.2</div>
              <p className='text-xs text-muted-foreground'>
                +3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>
              A comprehensive list of all users in your platform
            </CardDescription>
            <div className='flex items-center space-x-4 w-full'>
              <div className='relative flex-1'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input placeholder='Search users by name, email, or status...' className='pl-8' />
              </div>
              <Button variant='outline'>
                <Filter className='mr-2 h-4 w-4' />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {sampleUsers.map((user) => (
                <div key={user.id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'>
                  <div className='flex items-center space-x-4'>
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{user.name}</p>
                      <p className='text-sm text-muted-foreground'>{user.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{user.enrollments} enrollments</p>
                      <p className='text-xs text-muted-foreground'>Joined {user.joinDate}</p>
                    </div>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
