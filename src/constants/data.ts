import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Topics',
    url: '#',
    icon: 'book',
    shortcut: ['t', 't'],
    isActive: false,
    items: [
      {
        title: 'New Topic',
        url: '/dashboard/topics/new',
        icon: 'plus',
        shortcut: ['n', 't']
      },
      {
        title: 'All Topics',
        url: '/dashboard/topics',
        icon: 'list',
        shortcut: ['a', 't']
      }
    ]
  },
  {
    title: 'Users',
    url: '#',
    icon: 'users',
    shortcut: ['u', 'u'],
    isActive: false,
    items: [
      {
        title: 'Users List',
        url: '/dashboard/users',
        icon: 'userList',
        shortcut: ['u', 'l']
      }
    ]
  },
  {
    title: 'Masters',
    url: '#',
    icon: 'settings',
    shortcut: ['m', 'm'],
    isActive: false,
    items: [
      {
        title: 'Home Page',
        url: '/dashboard/masters/home',
        icon: 'home',
        shortcut: ['h', 'p']
      }, 
        {
        title: 'Categories',
        url: '/dashboard/masters/categories',
        icon: 'folder',
        shortcut: ['c', 'a']
      },
      {
        title: 'Sub-Categories',
        url: '/dashboard/masters/sub-categories',
        icon: 'folderOpen',
        shortcut: ['s', 'c']
      }, 
      {
        title: 'Terms and Conditions',
        url: '/dashboard/masters/terms',
        icon: 'fileText',
        shortcut: ['t', 'c']
      },
      {
        title: 'Privacy',
        url: '/dashboard/masters/privacy',
        icon: 'shield',
        shortcut: ['p', 'r']
      } 
    
    ]
  },
  {
    title: 'Reports',
    url: '#',
    icon: 'chartBar',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [
      {
        title: 'User Analytics',
        url: '/dashboard/reports/analytics',
        icon: 'analytics',
        shortcut: ['u', 'a']
      },
      {
        title: 'Earnings',
        url: '/dashboard/reports/earnings',
        icon: 'dollarSign',
        shortcut: ['e', 'a']
      },
      {
        title: 'Invoices',
        url: '/dashboard/reports/invoices',
        icon: 'receipt',
        shortcut: ['i', 'n']
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
