<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'f_name',
        'l_name',
        'email',
        'mobile_no',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function jobOrders()
    {
        return $this->hasMany(JobOrder::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }
}