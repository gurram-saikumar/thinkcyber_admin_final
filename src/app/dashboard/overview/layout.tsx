import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Completed Topics Card */}
          <Card className='bg-gradient-to-br from-red-400 to-red-500 text-white border-0'>
            <CardHeader className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-3xl font-bold text-white mb-1'>
                    2,800
                  </CardTitle>
                  <CardDescription className='text-white/90 text-sm'>
                    Completed Topics
                  </CardDescription>
                </div>
                <div className='flex-shrink-0'>
                  <img src='/assets/online-course.svg' alt='Completed' className='w-18 h-18' />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Enrolled Topics Card */}
          <Card className='bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0'>
            <CardHeader className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-3xl font-bold text-white mb-1'>
                    1500
                  </CardTitle>
                  <CardDescription className='text-white/90 text-sm'>
                    Enrolled Topics
                  </CardDescription>
                </div>
                <div className='flex-shrink-0'>
                  <img src='/assets/enroll.svg' alt='Enrolled' className='w-18 h-18' />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Topics In Progress Card */}
          <Card className='bg-gradient-to-br from-purple-400 to-purple-500 text-white border-0'>
            <CardHeader className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-3xl font-bold text-white mb-1'>
                    800
                  </CardTitle>
                  <CardDescription className='text-white/90 text-sm'>
                    Topics In Progress
                  </CardDescription>
                </div>
                <div className='flex-shrink-0'>
                  <img src='/assets/multimedia.svg' alt='In Progress' className='w-18 h-18' />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Total Watch Time Card */}
          <Card className='bg-gradient-to-br from-green-400 to-green-500 text-white border-0'>
            <CardHeader className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-3xl font-bold text-white mb-1'>
                    500
                  </CardTitle>
                  <CardDescription className='text-white/90 text-sm'>
                    Total Watch Time
                  </CardDescription>
                </div>
                <div className='flex-shrink-0'>
                  <img src='/assets/book.svg' alt='Watch Time' className='w-18 h-18' />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3' style={{ gridAutoRows: 'min-content' }}>
          {/* Updates section - spans 1 column with full height to match right side */}
          <div className='md:col-span-1 md:row-span-2'>
            <div className='h-full min-h-[600px]'>{bar_stats}</div>
          </div>
          
          {/* Earnings and Monthly Progress - side by side with equal heights */}
          <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch'>
            <div className='h-full'>{area_stats}</div>
            <div className='h-full'>{pie_stats}</div>
          </div>
          
          {/* Monthly Report - full width below the two cards */}
          <div className='md:col-span-2 w-full'>
            {/* sales parallel routes */}
            {sales}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
