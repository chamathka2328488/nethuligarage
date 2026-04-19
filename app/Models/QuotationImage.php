<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationImage extends Model
{
    protected $primaryKey = 'id';

    protected $fillable = [
        'quotation_id',
        'image_path',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}