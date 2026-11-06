<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: "API de E-commerce Segura",
    version: "1.0.0",
    description: "API RESTful para gestión de clientes, catálogo de productos y procesamiento de compras con Stripe."
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
#[OA\Server(
    url: "http://localhost:8030",
    description: "Servidor local de desarrollo"
)]
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
