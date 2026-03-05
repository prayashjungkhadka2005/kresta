import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "db";
import { calculateEarnings, PLATFORM_FEE_RATE } from "shared";

const prisma = new PrismaClient();

export class OrderController {
    /**
     * POST /api/orders/track
     * Receives conversion events from the Tracker (pixel or server-to-server)
     */
    static async trackConversion(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { refCode, eventName, payload } = request.body as {
                refCode: string;
                eventName: string;
                payload?: { saleAmount?: number; couponCode?: string; customerName?: string; customerPhone?: string };
            };

            if (!refCode || eventName !== 'purchase') {
                return reply.code(400).send({ error: "Invalid conversion event parameters" });
            }

            const saleAmount = payload?.saleAmount;
            if (!saleAmount || saleAmount <= 0) {
                return reply.code(400).send({ error: "Valid saleAmount is required for purchase events" });
            }

            // 1. Validate the Affiliate Link
            const affiliateLink = await prisma.affiliateLink.findUnique({
                where: { refCode },
                include: { product: true },
            });

            if (!affiliateLink) {
                return reply.code(404).send({ error: "Affiliate tracking code not found" });
            }

            // 2. Perform Financial Mathematics
            const {
                totalCommission,
                platformFee,
                creatorEarning,
                tdsAmount
            } = calculateEarnings(
                saleAmount,
                Number(affiliateLink.product.commissionRate),
                PLATFORM_FEE_RATE
            );

            // 3. Create the Order and Award the Creator
            const [order] = await prisma.$transaction([
                // Create Order
                prisma.order.create({
                    data: {
                        affiliateLinkId: affiliateLink.id,
                        productId: affiliateLink.productId,
                        brandId: affiliateLink.product.brandId,
                        creatorId: affiliateLink.creatorId,
                        customerName: payload.customerName,
                        customerPhone: payload.customerPhone,
                        saleAmount,
                        commissionAmount: totalCommission,
                        platformFee,
                        creatorEarning,
                        tdsAmount,
                        couponCode: payload.couponCode,
                        status: 'PENDING', // All tracked orders start as Pending until Brand confirmation
                    }
                }),
                // Update Creator's Pending Balance
                prisma.creator.update({
                    where: { id: affiliateLink.creatorId },
                    data: {
                        pendingBalance: { increment: creatorEarning }
                    }
                }),
                // Update Affiliate Link Stats
                prisma.affiliateLink.update({
                    where: { id: affiliateLink.id },
                    data: {
                        totalSales: { increment: 1 },
                        totalEarned: { increment: creatorEarning }
                    }
                })
            ]);

            return reply.code(201).send({ success: true, orderId: order.id });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: "Internal Server Error during conversion tracking" });
        }
    }
}
