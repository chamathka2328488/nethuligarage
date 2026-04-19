<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // ── Dashboard — all roles ─────────────────────────────────────────────────
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Notifications — all roles ─────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // ── Customers — all roles can view, only owner/admin can modify ───────────
    Route::get('/customers', [CustomerController::class, 'index'])->name('customer.index');
    Route::middleware('role:owner,admin')->group(function () {
        Route::post('/customers',        [CustomerController::class, 'store'])->name('customer.store');
        Route::put('/customers/{id}',    [CustomerController::class, 'update'])->name('customer.update');
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])->name('customer.destroy');
    });

    // ── Vehicles — all roles can view, only owner/admin can modify ────────────
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicle.index');
    Route::middleware('role:owner,admin')->group(function () {
        Route::post('/vehicles',        [VehicleController::class, 'store'])->name('vehicle.store');
        Route::put('/vehicles/{id}',    [VehicleController::class, 'update'])->name('vehicle.update');
        Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy'])->name('vehicle.destroy');
    });

    // ── Inventory — all roles can view, only owner/admin can modify ───────────
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::middleware('role:owner,admin')->group(function () {
        Route::post('/inventory',        [InventoryController::class, 'store'])->name('inventory.store');
        Route::put('/inventory/{id}',    [InventoryController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{id}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    });

    // ── Job Orders — all roles can view & create, only owner/admin can delete ─
    Route::get('/joborders',      [JobOrderController::class, 'index'])->name('joborder.index');
    Route::post('/joborders',     [JobOrderController::class, 'store'])->name('joborder.store');
    Route::put('/joborders/{id}', [JobOrderController::class, 'update'])->name('joborder.update');
    Route::middleware('role:owner,admin')->group(function () {
        Route::delete('/joborders/{id}', [JobOrderController::class, 'destroy'])->name('joborder.destroy');
    });

    // ── Invoices — owner/admin only ───────────────────────────────────────────
    Route::middleware('role:owner,admin')->group(function () {
        Route::get('/invoices',          [InvoiceController::class, 'index'])->name('invoice.index');
        Route::post('/invoices',         [InvoiceController::class, 'store'])->name('invoice.store');
        Route::put('/invoices/{id}',     [InvoiceController::class, 'update'])->name('invoice.update');
        Route::delete('/invoices/{id}',  [InvoiceController::class, 'destroy'])->name('invoice.destroy');
    });

    // ── Quotations — all roles can view & create, only owner/admin can delete ─
    Route::get('/quotations',      [QuotationController::class, 'index'])->name('quotation.index');
    Route::post('/quotations',     [QuotationController::class, 'store'])->name('quotation.store');
    Route::put('/quotations/{id}', [QuotationController::class, 'update'])->name('quotation.update');
    Route::middleware('role:owner,admin')->group(function () {
        Route::delete('/quotations/{id}', [QuotationController::class, 'destroy'])->name('quotation.destroy');
    });

    // ── Reports — owner/admin only ────────────────────────────────────────────
    Route::middleware('role:owner,admin')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('report.index');
    });

    // ── User Management — owner only ──────────────────────────────────────────
    Route::middleware('role:owner')->group(function () {
        Route::get('/users',         [UserController::class, 'index'])->name('user.index');
        Route::post('/users',        [UserController::class, 'store'])->name('user.store');
        Route::put('/users/{id}',    [UserController::class, 'update'])->name('user.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('user.destroy');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';