<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{

    #[OA\Post(
        path: "/api/orders",
        summary: "Crear una nueva orden de compra",
        tags: ["Órdenes"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["items"],
                properties: [
                    new OA\Property(
                        property: "items",
                        type: "array",
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: "product_id", type: "integer", example: 1),
                                new OA\Property(property: "quantity", type: "integer", example: 2),
                            ]
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Orden creada exitosamente"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 422, description: "Stock insuficiente o error de validación"),
        ]
    )]

    public function store(StoreOrderRequest $request)
    {
        $user = Auth::guard('api')->user();

        $order = DB::transaction(function () use ($request, $user) {
            $total = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(422, "Stock insuficiente para el producto: {$product->name}");
                }

                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ];

                $product->decrement('stock', $item['quantity']);
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
            ]);

            $order->items()->createMany($itemsData);

            return $order;
        });

        return response()->json($order->load('items.product'), 201);
    }

    #[OA\Get(
        path: "/api/orders",
        summary: "Ver historial de compras del usuario autenticado",
        tags: ["Órdenes"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Listado de órdenes del usuario"),
            new OA\Response(response: 401, description: "No autenticado"),
        ]
    )]

    public function index()
    {
        $orders = Auth::guard('api')->user()
            ->orders()
            ->with('items.product', 'payment')
            ->latest()
            ->get();

        return response()->json($orders);
    }

    #[OA\Get(
        path: "/api/orders/{order}",
        summary: "Ver detalle de una orden",
        tags: ["Órdenes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "order", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Detalle de la orden"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 403, description: "No autorizado para ver esta orden"),
            new OA\Response(response: 404, description: "Orden no encontrada"),
        ]
    )]

    public function show(Order $order)
    {
        if ($order->user_id !== Auth::guard('api')->id()) {
            abort(403, 'No autorizado para ver esta orden');
        }

        return response()->json($order->load('items.product', 'payment'));
    }
}
