<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->increments('id');
            $table->string('item_name', 100);
            $table->string('part_number', 50)->nullable();
            $table->string('category', 50)->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->string('supplier_name', 100)->nullable();
            $table->string('supplier_contact', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};