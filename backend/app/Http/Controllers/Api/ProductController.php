<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: "/api/products",
        summary: "Listar catálogo de productos",
        tags: ["Productos"],
        responses: [
            new OA\Response(response: 200, description: "Listado de productos"),
        ]
    )]

    public function index()
    {
        return response()->json(Product::all());
    }

    #[OA\Post(
        path: "/api/products",
        summary: "Crear un nuevo producto",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name", "price", "stock"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Laptop Gamer"),
                    new OA\Property(property: "description", type: "string", example: "16GB RAM, RTX 4060"),
                    new OA\Property(property: "price", type: "number", format: "float", example: 1299.99),
                    new OA\Property(property: "stock", type: "integer", example: 10),
                    new OA\Property(property: "image_url", type: "string", example: "https://example.com/img.jpg"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Producto creado exitosamente"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 422, description: "Error de validación"),
        ]
    )]

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        return response()->json($product, 201);
    }

    #[OA\Get(
        path: "/api/products/{product}",
        summary: "Ver detalle de un producto",
        tags: ["Productos"],
        parameters: [
            new OA\Parameter(name: "product", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Detalle del producto"),
            new OA\Response(response: 404, description: "Producto no encontrado"),
        ]
    )]

    public function show(Product $product)
    {
        return response()->json($product);
    }

    #[OA\Put(
        path: "/api/products/{product}",
        summary: "Actualizar un producto",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "product", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Laptop Gamer Pro"),
                    new OA\Property(property: "description", type: "string", example: "32GB RAM, RTX 4070"),
                    new OA\Property(property: "price", type: "number", format: "float", example: 1599.99),
                    new OA\Property(property: "stock", type: "integer", example: 5),
                    new OA\Property(property: "image_url", type: "string", example: "https://example.com/img.jpg"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Producto actualizado exitosamente"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 404, description: "Producto no encontrado"),
            new OA\Response(response: 422, description: "Error de validación"),
        ]
    )]

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return response()->json($product);
    }

    #[OA\Delete(
        path: "/api/products/{product}",
        summary: "Eliminar un producto",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "product", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Producto eliminado correctamente"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 404, description: "Producto no encontrado"),
        ]
    )]

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente',
        ]);
    }
}
