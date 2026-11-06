<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    #[OA\Post(
        path: "/api/orders/{order}/pay",
        summary: "Generar un intento de pago con Stripe para una orden",
        tags: ["Pagos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "order", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "PaymentIntent creado exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "client_secret", type: "string"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 403, description: "No autorizado para pagar esta orden"),
            new OA\Response(response: 422, description: "Esta orden ya fue procesada"),
            new OA\Response(response: 502, description: "Error al comunicarse con Stripe"),
        ]
    )]

    public function createIntent(Order $order)
    {
        if ($order->user_id !== Auth::guard('api')->id()) {
            abort(403, 'No autorizado para pagar esta orden');
        }

        if ($order->status !== 'pending') {
            abort(422, 'Esta orden ya fue procesada');
        }

        try {
            $intent = PaymentIntent::create([
                'amount' => (int) round($order->total * 100), // Stripe usa centavos
                'currency' => 'usd',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'order_id' => $order->id,
                ],
            ]);
        } catch (ApiErrorException $e) {
            return response()->json([
                'message' => 'Error al comunicarse con Stripe',
                'error' => $e->getMessage(),
            ], 502);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'stripe_payment_intent_id' => $intent->id,
            'amount' => $order->total,
            'currency' => 'usd',
            'status' => 'pending',
        ]);

        return response()->json([
            'client_secret' => $intent->client_secret,
            'payment' => $payment,
        ]);
    }

    #[OA\Post(
        path: "/api/orders/{order}/confirm",
        summary: "Confirmar el estado de un pago con Stripe",
        tags: ["Pagos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "order", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Estado de la orden y el pago sincronizado"),
            new OA\Response(response: 401, description: "No autenticado"),
            new OA\Response(response: 403, description: "No autorizado para confirmar esta orden"),
            new OA\Response(response: 404, description: "No existe un intento de pago para esta orden"),
            new OA\Response(response: 502, description: "Error al consultar el estado del pago"),
        ]
    )]

    public function confirm(Order $order)
    {
        if ($order->user_id !== Auth::guard('api')->id()) {
            abort(403, 'No autorizado para confirmar esta orden');
        }

        $payment = $order->payment;

        if (! $payment) {
            abort(404, 'No existe un intento de pago para esta orden');
        }

        try {
            $intent = PaymentIntent::retrieve($payment->stripe_payment_intent_id);
        } catch (ApiErrorException $e) {
            return response()->json([
                'message' => 'Error al consultar el estado del pago',
                'error' => $e->getMessage(),
            ], 502);
        }

        DB::transaction(function () use ($intent, $payment, $order) {
            if ($intent->status === 'succeeded') {
                $payment->update(['status' => 'succeeded']);
                $order->update(['status' => 'paid']);
            } else {
                $payment->update(['status' => 'failed']);
                $order->update(['status' => 'failed']);
            }
        });

        return response()->json([
            'order' => $order->fresh(),
            'payment' => $payment->fresh(),
        ]);
    }
}
