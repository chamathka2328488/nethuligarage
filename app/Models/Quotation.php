<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'vehicle_id',
        'customer_id',
        'insurance_company',
        'insurance_policy_no',
        'insurance_contact',
        'damage_description',
        'parts_total',
        'labour_charge',
        'total_amount',
        'status',
        'quotation_date',
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
        return $this->hasMany(QuotationItem::class);
    }

    public function images()
    {
        return $this->hasMany(QuotationImage::class);
    }
}