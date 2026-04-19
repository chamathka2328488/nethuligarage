<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventoryItem;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $items = InventoryItem::all()->map(function ($item) {
            $item->stock_status = $item->stock_status;
            return $item;
        });

        return Inertia::render('inventory/index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name'           => 'required|string|max:100',
            'part_number'         => 'nullable|string|max:50',
            'category'            => 'nullable|string|max:50',
            'quantity'            => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'unit_price'          => 'required|numeric|min:0',
            'supplier_name'       => 'nullable|string|max:100',
            'supplier_contact'    => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ]);

        InventoryItem::create($validated);

        return redirect()->route('inventory.index')
                         ->with('success', 'Item added successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'item_name'           => 'required|string|max:100',
            'part_number'         => 'nullable|string|max:50',
            'category'            => 'nullable|string|max:50',
            'quantity'            => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'unit_price'          => 'required|numeric|min:0',
            'supplier_name'       => 'nullable|string|max:100',
            'supplier_contact'    => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($id);
        $item->update($validated);

        return redirect()->route('inventory.index')
                         ->with('success', 'Item updated successfully!');
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();

        return redirect()->route('inventory.index')
                         ->with('success', 'Item deleted successfully!');
    }
}