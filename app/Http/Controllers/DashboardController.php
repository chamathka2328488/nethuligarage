<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\JobOrder;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Quotation;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_customers'       => Customer::count(),
            'total_vehicles'        => Vehicle::count(),
            'total_job_orders'      => JobOrder::count(),
            'pending_jobs'          => JobOrder::where('status', 'pending')->count(),
            'in_progress_jobs'      => JobOrder::where('status', 'in_progress')->count(),
            'completed_jobs'        => JobOrder::where('status', 'completed')->count(),
            'total_inventory_items' => InventoryItem::count(),
            'low_stock_items'       => InventoryItem::whereColumn('quantity', '<=', 'low_stock_threshold')
                                            ->where('quantity', '>', 0)->count(),
            'out_of_stock_items'    => InventoryItem::where('quantity', 0)->count(),
            'total_invoices'        => Invoice::count(),
            'pending_invoices'      => Invoice::where('payment_status', 'pending')->count(),
            'total_quotations'      => Quotation::count(),
        ];

        $recent_jobs = JobOrder::with(['vehicle', 'customer'])
            ->latest()
            ->take(6)
            ->get();

        $low_stock_items = InventoryItem::whereColumn('quantity', '<=', 'low_stock_threshold')
            ->orderBy('quantity')
            ->take(6)
            ->get(['id', 'item_name', 'quantity', 'low_stock_threshold']);

        return Inertia::render('dashboard', [
            'stats'           => $stats,
            'recent_jobs'     => $recent_jobs,
            'low_stock_items' => $low_stock_items,
        ]);
    }
}