<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        // Only create if no owner exists
        if (!User::where('role', 'owner')->exists()) {
            User::create([
                'name'              => 'Garage Owner',
                'email'             => 'owner@nethuligarage.lk',
                'password'          => Hash::make('password123'),
                'role'              => 'owner',
                'email_verified_at' => now(),
            ]);

            $this->command->info('Owner account created: owner@nethuligarage.lk / password123');
            $this->command->warn('Please change the password after first login!');
        } else {
            $this->command->info('Owner account already exists — skipped.');
        }
    }
}