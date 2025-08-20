'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const earningsData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 8 },
  { month: 'Mar', value: 14 },
  { month: 'Apr', value: 10 },
  { month: 'May', value: 16 },
  { month: 'Jun', value: 13 },
  { month: 'Jul', value: 15 }
];

export function EarningsGraph() {
  return (
    <Card className='w-full h-[300px] flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold mb-1'>Earnings</CardTitle>
            <p className='text-sm text-muted-foreground'>2021</p>
          </div>
          <Button variant='ghost' size='sm' className='text-sm text-muted-foreground'>
            Monthly
            <ChevronDown className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pb-4 flex-1 flex flex-col'>
        <div className='mb-4'>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-red-500 rounded-full mr-2'></div>
            <span className='text-2xl font-bold'>15 M</span>
          </div>
        </div>
        <div className='flex-1 min-h-[120px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={earningsData}>
              <XAxis 
                dataKey='month' 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis hide />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#ef4444'
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
