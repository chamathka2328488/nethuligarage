<?php
// FILE: database/migrations/2025_10_01_160852_create_vehicles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('customer_id');
            $table->string('reg_no', 20)->unique();
            $table->string('make', 50);
            $table->string('model', 50);
            $table->smallInteger('year');          // ← NOT $table->year() - fixes validation issue
            $table->string('color', 30)->nullable();
            $table->string('engine_no', 50)->nullable();
            $table->string('chassis_no', 50)->nullable();
            $table->timestamps();

            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};