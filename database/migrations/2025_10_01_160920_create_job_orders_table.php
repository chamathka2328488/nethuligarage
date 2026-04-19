<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('vehicle_id');
            $table->unsignedInteger('customer_id');
            $table->string('mechanic_name', 100)->nullable();
            $table->text('description');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->date('date_in');
            $table->date('date_out')->nullable();
            $table->decimal('labour_charge', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('vehicle_id')
                  ->references('id')->on('vehicles')
                  ->onDelete('cascade');

            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->onDelete('cascade');
        });

        Schema::create('job_order_items', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('job_order_id');
            $table->unsignedInteger('inventory_item_id');
            $table->integer('quantity_used');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();

            $table->foreign('job_order_id')
                  ->references('id')->on('job_orders')
                  ->onDelete('cascade');

            $table->foreign('inventory_item_id')
                  ->references('id')->on('inventory_items')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_order_items');
        Schema::dropIfExists('job_orders');
    }
};