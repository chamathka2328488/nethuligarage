<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// 1. Added this import
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 2. Added this logic to force HTTPS on Railway
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}