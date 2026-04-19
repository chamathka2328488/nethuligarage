<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'job_order_id',
        'customer_id',
        'parts_total',
        'labour_charge',
        'discount',
        'total_amount',
        'payment_status',
        'invoice_date',
        'notes',
    ];

    public function jobOrder()
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}