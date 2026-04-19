<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'quotation_id',
        'part_name',
        'quantity',
        'unit_price',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}