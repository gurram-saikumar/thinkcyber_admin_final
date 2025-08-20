'use client';

import { MonthlyProgress } from './monthly-progress';

export function PieGraph() {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <MonthlyProgress />
    </div>
  );
}
