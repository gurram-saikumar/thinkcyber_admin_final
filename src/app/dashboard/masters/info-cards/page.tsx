import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InfoCardsPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Information Cards Management</h1>
          <p className='text-muted-foreground'>
            Manage informational cards displayed throughout the platform
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Information Cards</CardTitle>
            <CardDescription>Configure cards for various sections of the website</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-center py-10 text-muted-foreground'>
              Information Cards management interface will be implemented here
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
