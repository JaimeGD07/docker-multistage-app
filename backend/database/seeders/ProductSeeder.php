<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Laptop Gamer RTX 4060',
                'description' => 'Laptop para gaming con 16GB RAM, RTX 4060, procesador Intel i7.',
                'price' => 1299.99,
                'stock' => 15,
                'image_url' => 'https://picsum.photos/seed/laptop/400/300',
            ],
            [
                'name' => 'Mouse Inalámbrico Ergonómico',
                'description' => 'Mouse inalámbrico con sensor óptico de alta precisión.',
                'price' => 29.99,
                'stock' => 100,
                'image_url' => 'https://picsum.photos/seed/mouse/400/300',
            ],
            [
                'name' => 'Teclado Mecánico RGB',
                'description' => 'Teclado mecánico con switches azules e iluminación RGB.',
                'price' => 79.99,
                'stock' => 50,
                'image_url' => 'https://picsum.photos/seed/keyboard/400/300',
            ],
            [
                'name' => 'Monitor 27" 144Hz',
                'description' => 'Monitor gaming Full HD con panel IPS y 144Hz de refresco.',
                'price' => 249.99,
                'stock' => 20,
                'image_url' => 'https://picsum.photos/seed/monitor/400/300',
            ],
            [
                'name' => 'Audífonos Bluetooth Cancelación de Ruido',
                'description' => 'Audífonos over-ear con cancelación activa de ruido y 30h de batería.',
                'price' => 89.99,
                'stock' => 40,
                'image_url' => 'https://picsum.photos/seed/headphones/400/300',
            ],
            [
                'name' => 'Webcam Full HD 1080p',
                'description' => 'Webcam con enfoque automático y micrófono integrado.',
                'price' => 49.99,
                'stock' => 60,
                'image_url' => 'https://picsum.photos/seed/webcam/400/300',
            ],
            [
                'name' => 'SSD NVMe 1TB',
                'description' => 'Disco de estado sólido NVMe con velocidades de lectura de hasta 3500MB/s.',
                'price' => 89.99,
                'stock' => 35,
                'image_url' => 'https://picsum.photos/seed/ssd/400/300',
            ],
            [
                'name' => 'Silla Ergonómica de Oficina',
                'description' => 'Silla ajustable con soporte lumbar, ideal para largas jornadas.',
                'price' => 189.99,
                'stock' => 12,
                'image_url' => 'https://picsum.photos/seed/chair/400/300',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
