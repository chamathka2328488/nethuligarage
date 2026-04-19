<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'item_name',
        'part_number',
        'category',
        'quantity',
        'low_stock_threshold',
        'unit_price',
        'supplier_name',
        'supplier_contact',
        'notes',
    ];

    // Accessor: returns stock status label
    public function getStockStatusAttribute(): string
    {
        if ($this->quantity === 0) return 'out_of_stock';
        if ($this->quantity <= $this->low_stock_threshold) return 'low_stock';
        return 'in_stock';
    }

    public function jobOrderItems()
    {
        return $this->hasMany(JobOrderItem::class);
    }
}