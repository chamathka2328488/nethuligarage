<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\JobOrder;
use App\Models\Customer;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['jobOrder.vehicle', 'customer'])->get();

        // Only completed jobs that don't have an invoice yet
        $jobOrders = JobOrder::with(['vehicle', 'customer'])
                        ->whereDoesntHave('invoice')
                        ->where('status', 'completed')
                        ->get();

        return Inertia::render('invoice/index', [
            'invoices'  => $invoices,
            'jobOrders' => $jobOrders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_order_id'   => 'required|integer|exists:job_orders,id|unique:invoices,job_order_id',
            'customer_id'    => 'required|integer|exists:customers,id',
            'parts_total'    => 'required|numeric|min:0',
            'labour_charge'  => 'required|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'total_amount'   => 'required|numeric|min:0',
            'payment_status' => 'required|in:pending,paid',
            'invoice_date'   => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        Invoice::create($validated);

        return redirect()->route('invoice.index')
                         ->with('success', 'Invoice created successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid',
            'discount'       => 'nullable|numeric|min:0',
            'total_amount'   => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($id);
        $invoice->update($validated);

        return redirect()->route('invoice.index')
                         ->with('success', 'Invoice updated successfully!');
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->route('invoice.index')
                         ->with('success', 'Invoice deleted successfully!');
    }
}