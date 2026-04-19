<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'customer_id',
        'reg_no',
        'make',
        'model',
        'year',
        'color',
        'engine_no',
        'chassis_no',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }
}