import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Nethuli Garage" />

            <div className="min-h-screen bg-[#111] text-white flex flex-col">

                {/* Nav */}
                <nav className="flex items-center justify-between px-8 py-4 border-b border-white/8">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Nethuli Garage" className="h-8 w-auto" />
                        <span className="text-sm font-medium text-white/80">Nethuli Garage</span>
                    </div>

                    {auth.user ? (
                        <Link href="/dashboard" className="px-4 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="px-4 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
                            Login
                        </Link>
                    )}
                </nav>

                {/* Hero */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <img src="/logo.png" alt="Nethuli Garage Logo" className="h-20 w-auto mb-6 opacity-90" />

                    <p className="text-orange-500 text-xs font-medium tracking-widest uppercase mb-4">Garage Management System</p>

                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                        Nethuli Garage
                    </h1>

                    <p className="text-white/40 text-base max-w-md mb-8 leading-relaxed">
                        A digital system to manage customers, vehicles, job orders,
                        inventory, invoices and quotations.
                    </p>

                    {auth.user ? (
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors">
                            Open Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors">
                            Login to System
                        </Link>
                    )}
                </main>

            

                {/* Footer */}
                <footer className="border-t border-white/8 px-8 py-4 text-center text-xs text-white/20">
                    136, A1 Stanley Thilakarathna Mawatha, Nugegoda · IT5106 · 2025
                </footer>

            </div>
        </>
    );
}