<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Returns all active notifications as JSON.
     * Called by the frontend bell component via fetch.
     */
    public function index(): JsonResponse
    {
        $notifications = [];

        // ── Low stock alerts ───────────────────────────────────────────────────
        $lowStock = InventoryItem::whereColumn('quantity', '<=', 'low_stock_threshold')
            ->where('quantity', '>', 0)
            ->get(['id', 'item_name', 'quantity', 'low_stock_threshold']);

        foreach ($lowStock as $item) {
            $notifications[] = [
                'id'      => 'low_stock_' . $item->id,
                'type'    => 'warning',
                'title'   => 'Low Stock',
                'message' => "{$item->item_name} is running low ({$item->quantity} left, min {$item->low_stock_threshold})",
                'link'    => '/inventory',
            ];
        }

        // ── Out of stock alerts ────────────────────────────────────────────────
        $outOfStock = InventoryItem::where('quantity', 0)->get(['id', 'item_name']);

        foreach ($outOfStock as $item) {
            $notifications[] = [
                'id'      => 'out_stock_' . $item->id,
                'type'    => 'danger',
                'title'   => 'Out of Stock',
                'message' => "{$item->item_name} is completely out of stock",
                'link'    => '/inventory',
            ];
        }

        // ── Unpaid invoice reminders ───────────────────────────────────────────
        // Invoices pending for more than 7 days
        $overdueInvoices = Invoice::with(['customer', 'jobOrder.vehicle'])
            ->where('payment_status', 'pending')
            ->where('invoice_date', '<=', now()->subDays(7)->toDateString())
            ->get();

        foreach ($overdueInvoices as $inv) {
            $customerName = $inv->customer
                ? "{$inv->customer->f_name} {$inv->customer->f_name}"
                : "Customer #{$inv->customer_id}";
            $regNo = $inv->jobOrder?->vehicle?->reg_no ?? '';
            $days  = now()->diffInDays($inv->invoice_date);

            $notifications[] = [
                'id'      => 'invoice_' . $inv->id,
                'type'    => 'danger',
                'title'   => 'Payment Overdue',
                'message' => "Invoice #{$inv->id} for {$customerName}" . ($regNo ? " ({$regNo})" : '') . " — {$days} days overdue",
                'link'    => '/invoices',
            ];
        }

        // ── Invoices pending but less than 7 days ──────────────────────────────
        $pendingInvoices = Invoice::with(['customer', 'jobOrder.vehicle'])
            ->where('payment_status', 'pending')
            ->where('invoice_date', '>', now()->subDays(7)->toDateString())
            ->get();

        foreach ($pendingInvoices as $inv) {
            $customerName = $inv->customer
                ? "{$inv->customer->f_name} {$inv->customer->l_name}"
                : "Customer #{$inv->customer_id}";
            $regNo = $inv->jobOrder?->vehicle?->reg_no ?? '';

            $notifications[] = [
                'id'      => 'pending_inv_' . $inv->id,
                'type'    => 'info',
                'title'   => 'Payment Pending',
                'message' => "Invoice #{$inv->id} for {$customerName}" . ($regNo ? " ({$regNo})" : '') . " is awaiting payment",
                'link'    => '/invoices',
            ];
        }

        return response()->json([
            'notifications' => $notifications,
            'count'         => count($notifications),
        ]);
    }
}