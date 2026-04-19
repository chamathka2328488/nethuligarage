<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Customer;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles  = Vehicle::with('customer')->get();
        $customers = Customer::select('id', 'f_name', 'l_name')->get();

        return Inertia::render('vehicle/index', [
            'vehicles'  => $vehicles,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'reg_no'      => 'required|string|max:20|unique:vehicles',
            'make'        => 'required|string|max:50',
            'model'       => 'required|string|max:50',
            'year'        => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'color'       => 'nullable|string|max:30',
            'engine_no'   => 'nullable|string|max:50',
            'chassis_no'  => 'nullable|string|max:50',
        ]);

        Vehicle::create($validated);

        return redirect()->route('vehicle.index')
                         ->with('success', 'Vehicle added successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'reg_no'      => 'required|string|max:20|unique:vehicles,reg_no,' . $id,
            'make'        => 'required|string|max:50',
            'model'       => 'required|string|max:50',
            'year'        => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'color'       => 'nullable|string|max:30',
            'engine_no'   => 'nullable|string|max:50',
            'chassis_no'  => 'nullable|string|max:50',
        ]);

        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($validated);

        return redirect()->route('vehicle.index')
                         ->with('success', 'Vehicle updated successfully!');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->route('vehicle.index')
                         ->with('success', 'Vehicle deleted successfully!');
    }
}