<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('job_order_id')->unique();
            $table->unsignedInteger('customer_id');
            $table->decimal('parts_total', 10, 2)->default(0);
            $table->decimal('labour_charge', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->date('invoice_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('job_order_id')
                  ->references('id')->on('job_orders')
                  ->onDelete('cascade');

            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};