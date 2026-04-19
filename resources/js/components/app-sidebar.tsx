import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Car,
    Receipt,
    PackageOpen,
    Notebook,
    ClipboardList,
    BarChart2,
    UserCog,
} from 'lucide-react';
import AppLogo from './app-logo';

interface SharedData {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: 'owner' | 'admin' | 'mechanic';
        };
    };
}

const allNavItems: NavItem[] = [
    { title: 'Dashboard',   href: '/dashboard',  icon: LayoutGrid  },
    { title: 'Customers',   href: '/customers',  icon: Users       },
    { title: 'Vehicles',    href: '/vehicles',   icon: Car         },
    { title: 'Job Orders',  href: '/joborders',  icon: ClipboardList },
    { title: 'Inventory',   href: '/inventory',  icon: PackageOpen },
    { title: 'Invoices',    href: '/invoices',   icon: Receipt     },
    { title: 'Quotations',  href: '/quotations', icon: Notebook    },
    { title: 'Reports',     href: '/reports',    icon: BarChart2   },
    { title: 'Users',       href: '/users',      icon: UserCog     },
];

// Items restricted by role
const ownerAdminOnly  = ['/invoices', '/reports'];
const ownerOnly       = ['/users'];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role ?? 'mechanic';

    const visibleNav = allNavItems.filter(item => {
        if (ownerOnly.includes(item.href))      return role === 'owner';
        if (ownerAdminOnly.includes(item.href)) return role === 'owner' || role === 'admin';
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Role badge under logo */}
                {auth?.user && (
                    <div className="px-3 pb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                            ${role === 'owner'    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                            ${role === 'admin'    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                            ${role === 'mechanic' ? 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300' : ''}
                        `}>
                            {role}
                        </span>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNav} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}