<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\Vehicle;
use App\Models\Customer;
use App\Models\InventoryItem;
use Inertia\Inertia;

class JobOrderController extends Controller
{
    public function index()
    {
        $jobOrders = JobOrder::with([
            'vehicle',
            'customer',
            'items.inventoryItem',
        ])->latest()->get();

        $vehicles  = Vehicle::with('customer')->get();
        $customers = Customer::select('id', 'f_name', 'l_name')->get();
        $inventory = InventoryItem::where('quantity', '>', 0)
                        ->select('id', 'item_name', 'unit_price', 'quantity')
                        ->get();

        return Inertia::render('joborder/index', [
            'jobOrders' => $jobOrders,
            'vehicles'  => $vehicles,
            'customers' => $customers,
            'inventory' => $inventory,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id'                => 'required|integer|exists:vehicles,id',
            'customer_id'               => 'required|integer|exists:customers,id',
            'mechanic_name'             => 'nullable|string|max:100',
            'description'               => 'required|string',
            'status'                    => 'required|in:pending,in_progress,completed',
            'date_in'                   => 'required|date',
            'date_out'                  => 'nullable|date|after_or_equal:date_in',
            'labour_charge'             => 'required|numeric|min:0',
            'notes'                     => 'nullable|string',
            'items'                     => 'nullable|array',
            'items.*.inventory_item_id' => 'required|integer|exists:inventory_items,id',
            'items.*.quantity_used'     => 'required|integer|min:1',
            'items.*.unit_price'        => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $job = JobOrder::create([
                'vehicle_id'    => $validated['vehicle_id'],
                'customer_id'   => $validated['customer_id'],
                'mechanic_name' => $validated['mechanic_name'] ?? null,
                'description'   => $validated['description'],
                'status'        => $validated['status'],
                'date_in'       => $validated['date_in'],
                'date_out'      => $validated['date_out'] ?? null,
                'labour_charge' => $validated['labour_charge'],
                'notes'         => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    JobOrderItem::create([
                        'job_order_id'      => $job->id,
                        'inventory_item_id' => $item['inventory_item_id'],
                        'quantity_used'     => $item['quantity_used'],
                        'unit_price'        => $item['unit_price'],
                    ]);

                    // Deduct stock
                    InventoryItem::where('id', $item['inventory_item_id'])
                        ->decrement('quantity', $item['quantity_used']);
                }
            }
        });

        return redirect()->route('joborder.index')
                         ->with('success', 'Job order created successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'vehicle_id'    => 'required|integer|exists:vehicles,id',
            'customer_id'   => 'required|integer|exists:customers,id',
            'mechanic_name' => 'nullable|string|max:100',
            'description'   => 'required|string',
            'status'        => 'required|in:pending,in_progress,completed',
            'date_in'       => 'required|date',
            'date_out'      => 'nullable|date|after_or_equal:date_in',
            'labour_charge' => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $job = JobOrder::findOrFail($id);
        $job->update([
            'vehicle_id'    => $validated['vehicle_id'],
            'customer_id'   => $validated['customer_id'],
            'mechanic_name' => $validated['mechanic_name'] ?? null,
            'description'   => $validated['description'],
            'status'        => $validated['status'],
            'date_in'       => $validated['date_in'],
            'date_out'      => $validated['date_out'] ?? null,
            'labour_charge' => $validated['labour_charge'],
            'notes'         => $validated['notes'] ?? null,
        ]);

        return redirect()->route('joborder.index')
                         ->with('success', 'Job order updated successfully!');
    }

    public function destroy($id)
    {
        $job = JobOrder::findOrFail($id);
        $job->delete();

        return redirect()->route('joborder.index')
                         ->with('success', 'Job order deleted successfully!');
    }
}