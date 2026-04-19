import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Nethuli Garage — Management System" />

            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">

                {/* ── Nav ── */}
                <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {/* Wrench icon */}
                        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-white text-base tracking-tight">Nethuli Garage</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
                            >
                                Staff Login
                            </Link>
                        )}
                    </div>
                </nav>

                {/* ── Hero ── */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        Garage Management System
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-3xl">
                        Nethuli Garage
                        <span className="block text-orange-500 mt-1">Management System</span>
                    </h1>

                    <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
                        A complete digital solution for managing customers, vehicles, job orders,
                        inventory, invoices and quotations — all in one place.
                    </p>

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors"
                        >
                            Open Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors"
                        >
                            Login to System
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    )}
                </main>

                {/* ── Feature cards ── */}
                <section className="px-8 pb-16 max-w-6xl mx-auto w-full">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ),
                                title: 'Customers',
                                desc: 'Manage customer records and history',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2M13 16l2 2m-2-2V6" />
                                    </svg>
                                ),
                                title: 'Vehicles',
                                desc: 'Track all serviced vehicles',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                ),
                                title: 'Job Orders',
                                desc: 'Create and track service jobs',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                ),
                                title: 'Inventory',
                                desc: 'Manage parts and stock levels',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                ),
                                title: 'Invoices',
                                desc: 'Generate and track payments',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                ),
                                title: 'Quotations',
                                desc: 'Accident vehicle quotes with images',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                title: 'Reports',
                                desc: 'Expense and inventory insights',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                ),
                                title: 'Notifications',
                                desc: 'Stock and payment alerts',
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-orange-500/30 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400 mb-3 group-hover:bg-orange-500/25 transition-colors">
                                    {feature.icon}
                                </div>
                                <p className="font-medium text-sm text-white mb-1">{feature.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-white/10 px-8 py-5 flex items-center justify-between text-xs text-gray-600">
                    <span>Nethuli Garage — 136, A1 Stanley Thilakarathna Mawatha, Nugegoda</span>
                    <span>IT5106 Software Development Project · 2025</span>
                </footer>

            </div>
        </>
    );
}