<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrderItem extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'job_order_id',
        'inventory_item_id',
        'quantity_used',
        'unit_price',
    ];

    public function jobOrder()
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}