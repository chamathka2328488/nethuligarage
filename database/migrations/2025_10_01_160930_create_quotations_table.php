<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('vehicle_id');
            $table->unsignedInteger('customer_id');
            $table->string('insurance_company', 100)->nullable();
            $table->string('insurance_policy_no', 50)->nullable();
            $table->string('insurance_contact', 50)->nullable();
            $table->text('damage_description');
            $table->decimal('parts_total', 10, 2)->default(0);
            $table->decimal('labour_charge', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->date('quotation_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('vehicle_id')
                  ->references('id')->on('vehicles')
                  ->onDelete('cascade');

            $table->foreign('customer_id')
                  ->references('id')->on('customers')
                  ->onDelete('cascade');
        });

        Schema::create('quotation_items', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('quotation_id');
            $table->string('part_name', 100);
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();

            $table->foreign('quotation_id')
                  ->references('id')->on('quotations')
                  ->onDelete('cascade');
        });

        Schema::create('quotation_images', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('quotation_id');
            $table->string('image_path', 255);
            $table->timestamps();

            $table->foreign('quotation_id')
                  ->references('id')->on('quotations')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_images');
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
    }
};