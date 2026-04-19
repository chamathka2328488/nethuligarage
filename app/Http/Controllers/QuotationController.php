<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\QuotationImage;
use App\Models\Vehicle;
use App\Models\Customer;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index()
    {
        $quotations = Quotation::with(['vehicle', 'customer', 'items', 'images'])->get();
        $vehicles   = Vehicle::with('customer')->get();
        $customers  = Customer::select('id', 'f_name', 'l_name')->get();

        return Inertia::render('quotation/index', [
            'quotations' => $quotations,
            'vehicles'   => $vehicles,
            'customers'  => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id'          => 'required|integer|exists:vehicles,id',
            'customer_id'         => 'required|integer|exists:customers,id',
            'insurance_company'   => 'nullable|string|max:100',
            'insurance_policy_no' => 'nullable|string|max:50',
            'insurance_contact'   => 'nullable|string|max:50',
            'damage_description'  => 'required|string',
            'parts_total'         => 'required|numeric|min:0',
            'labour_charge'       => 'required|numeric|min:0',
            'total_amount'        => 'required|numeric|min:0',
            'status'              => 'required|in:draft,submitted,approved,rejected',
            'quotation_date'      => 'required|date',
            'notes'               => 'nullable|string',
            'items'               => 'nullable|array',
            'items.*.part_name'   => 'required|string|max:100',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'images'              => 'nullable|array',
            'images.*'            => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $quotation = Quotation::create([
                'vehicle_id'          => $validated['vehicle_id'],
                'customer_id'         => $validated['customer_id'],
                'insurance_company'   => $validated['insurance_company']   ?? null,
                'insurance_policy_no' => $validated['insurance_policy_no'] ?? null,
                'insurance_contact'   => $validated['insurance_contact']   ?? null,
                'damage_description'  => $validated['damage_description'],
                'parts_total'         => $validated['parts_total'],
                'labour_charge'       => $validated['labour_charge'],
                'total_amount'        => $validated['total_amount'],
                'status'              => $validated['status'],
                'quotation_date'      => $validated['quotation_date'],
                'notes'               => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    QuotationItem::create([
                        'quotation_id' => $quotation->id,
                        'part_name'    => $item['part_name'],
                        'quantity'     => $item['quantity'],
                        'unit_price'   => $item['unit_price'],
                    ]);
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('quotation_images', 'public');
                    QuotationImage::create([
                        'quotation_id' => $quotation->id,
                        'image_path'   => $path,
                    ]);
                }
            }
        });

        return redirect()->route('quotation.index')
                         ->with('success', 'Quotation created successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'vehicle_id'          => 'required|integer|exists:vehicles,id',
            'customer_id'         => 'required|integer|exists:customers,id',
            'insurance_company'   => 'nullable|string|max:100',
            'insurance_policy_no' => 'nullable|string|max:50',
            'insurance_contact'   => 'nullable|string|max:50',
            'damage_description'  => 'required|string',
            'parts_total'         => 'required|numeric|min:0',
            'labour_charge'       => 'required|numeric|min:0',
            'total_amount'        => 'required|numeric|min:0',
            'status'              => 'required|in:draft,submitted,approved,rejected',
            'quotation_date'      => 'required|date',
            'notes'               => 'nullable|string',
            'delete_image_ids'    => 'nullable|array',
            'delete_image_ids.*'  => 'integer|exists:quotation_images,id',
            'images'              => 'nullable|array',
            'images.*'            => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $quotation = Quotation::findOrFail($id);

        $quotation->update([
            'vehicle_id'          => $validated['vehicle_id'],
            'customer_id'         => $validated['customer_id'],
            'insurance_company'   => $validated['insurance_company']   ?? null,
            'insurance_policy_no' => $validated['insurance_policy_no'] ?? null,
            'insurance_contact'   => $validated['insurance_contact']   ?? null,
            'damage_description'  => $validated['damage_description'],
            'parts_total'         => $validated['parts_total'],
            'labour_charge'       => $validated['labour_charge'],
            'total_amount'        => $validated['total_amount'],
            'status'              => $validated['status'],
            'quotation_date'      => $validated['quotation_date'],
            'notes'               => $validated['notes'] ?? null,
        ]);

        // Delete removed images from disk and database
        if (!empty($validated['delete_image_ids'])) {
            $imagesToDelete = QuotationImage::whereIn('id', $validated['delete_image_ids'])
                ->where('quotation_id', $quotation->id)
                ->get();

            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }
        }

        // Add newly uploaded images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('quotation_images', 'public');
                QuotationImage::create([
                    'quotation_id' => $quotation->id,
                    'image_path'   => $path,
                ]);
            }
        }

        return redirect()->route('quotation.index')
                         ->with('success', 'Quotation updated successfully!');
    }

    public function destroy($id)
    {
        $quotation = Quotation::with('images')->findOrFail($id);

        foreach ($quotation->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $quotation->delete();

        return redirect()->route('quotation.index')
                         ->with('success', 'Quotation deleted successfully!');
    }
}