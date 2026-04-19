<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::all();

        return Inertia::render('customer/index', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'f_name'    => 'required|string|max:255',
            'l_name'    => 'required|string|max:255',
            'email'     => 'required|email|unique:customers',
            'mobile_no' => 'required|string|max:20',
        ]);

        Customer::create($validated);

        return redirect()->route('customer.index')
                         ->with('success', 'Customer added successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'f_name'    => 'required|string|max:50',
            'l_name'    => 'required|string|max:50',
            'email'     => 'required|email|unique:customers,email,' . $id,
            'mobile_no' => 'required|string|max:20',
        ]);

        $customer = Customer::findOrFail($id);
        $customer->update($validated);

        return redirect()->route('customer.index')
                         ->with('success', 'Customer updated successfully!');
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return redirect()->route('customer.index')
                         ->with('success', 'Customer deleted successfully!');
    }
}