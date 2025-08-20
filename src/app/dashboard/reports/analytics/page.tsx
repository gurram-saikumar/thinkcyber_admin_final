import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, BookOpen, Clock, Download } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>User Analytics</h1>
            <p className='text-muted-foreground'>
              Comprehensive analytics and insights about user behavior
            </p>
          </div>
          <div className='flex space-x-2'>
            <Select>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select period' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Last 7 days</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='90d'>Last 3 months</SelectItem>
                <SelectItem value='1y'>Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className='mr-2 h-4 w-4' />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12,451</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+15.2%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Learners</CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>8,924</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+8.7%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Avg. Session Time</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>24m 35s</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+12.4%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completion Rate</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>78.9%</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+3.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>User registration and activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg'>
                <div className='text-center'>
                  <TrendingUp className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-600'>User Growth Chart</p>
                  <p className='text-xs text-gray-500'>Interactive chart will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Topics</CardTitle>
              <CardDescription>Most popular topics by enrollment and completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  { name: 'Introduction to Cybersecurity', enrollments: 1247, completion: 89 },
                  { name: 'Network Security Basics', enrollments: 986, completion: 82 },
                  { name: 'Ethical Hacking Fundamentals', enrollments: 834, completion: 76 },
                  { name: 'Digital Forensics 101', enrollments: 721, completion: 91 },
                  { name: 'Incident Response', enrollments: 658, completion: 74 }
                ].map((topic, index) => (
                  <div key={index} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <p className='font-medium text-sm'>{topic.name}</p>
                      <p className='text-xs text-muted-foreground'>{topic.enrollments} enrollments</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{topic.completion}%</p>
                      <p className='text-xs text-muted-foreground'>completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Geographic and demographic breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg'>
                <div className='text-center'>
                  <Users className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-600'>Demographics Chart</p>
                  <p className='text-xs text-gray-500'>Geographic distribution and age groups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Patterns</CardTitle>
              <CardDescription>When and how users engage with content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg'>
                <div className='text-center'>
                  <Clock className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-600'>Activity Heatmap</p>
                  <p className='text-xs text-gray-500'>Peak usage times and engagement patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
