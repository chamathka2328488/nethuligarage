<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'vehicle_id',
        'customer_id',
        'mechanic_name',
        'description',
        'status',
        'date_in',
        'date_out',
        'labour_charge',
        'notes',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(JobOrderItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}