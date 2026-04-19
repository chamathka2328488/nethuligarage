import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { NotificationBell } from '@/components/notification-bell';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 dark:border-sidebar-border">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Notification bell — right side */}
            <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
    );
}