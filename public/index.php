<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
// ADDED ../ HERE
require __DIR__.'/../vendor/autoload.php'; 

// ADDED ../ HERE
$app = require_once __DIR__.'/../bootstrap/app.php'; 

$app->handleRequest(Request::capture());