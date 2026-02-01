import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    const userId = '1';
    await prisma.user.upsert({
        where: { email: 'tejasdivekar9057@gmail.com' },
        update: {},
        create: {
            id: userId,
            email: 'tejasdivekar9057@gmail.com',
            clerkId: 'demo_user_clerk_id', // Added dummy ID to satisfy DB constraint
            clerkId: 'user_demo_tejas_9057', // Placeholder for seeding
            name: 'Tejas Divekar',
            riskTolerance: 0.6,
        },
    });

    const portfolioData = [
        { symbol: 'RELIANCE', quantity: 10, entryPrice: 2450.50, entryDate: new Date('2023-10-15'), currentPrice: 2600.25, pnl: 1497.50, pnlPercent: 6.11, riskScore: 0.35, exposure: 26002.50, sector: 'Energy' },
        { symbol: 'TCS', quantity: 5, entryPrice: 3200.00, entryDate: new Date('2023-11-01'), currentPrice: 3100.10, pnl: -499.50, pnlPercent: -3.12, riskScore: 0.25, exposure: 15500.50, sector: 'IT' },
        { symbol: 'INFY', quantity: 15, entryPrice: 1450.00, entryDate: new Date('2023-09-20'), currentPrice: 1500.20, pnl: 753.00, pnlPercent: 3.46, riskScore: 0.30, exposure: 22503.00, sector: 'IT' },
        { symbol: 'HDFCBANK', quantity: 20, entryPrice: 1600.00, entryDate: new Date('2023-10-05'), currentPrice: 1550.40, pnl: -992.00, pnlPercent: -3.10, riskScore: 0.20, exposure: 31008.00, sector: 'Banking' },
        { symbol: 'ICICIBANK', quantity: 25, entryPrice: 850.00, entryDate: new Date('2023-08-25'), currentPrice: 920.15, pnl: 1753.75, pnlPercent: 8.25, riskScore: 0.28, exposure: 23003.75, sector: 'Banking' },
    ];

    for (const item of portfolioData) {
        await prisma.portfolio.upsert({
            where: { userId_symbol: { userId, symbol: item.symbol } },
            update: {
                quantity: item.quantity,
                currentPrice: item.currentPrice,
                pnl: item.pnl,
                pnlPercent: item.pnlPercent,
            },
            create: {
                userId,
                symbol: item.symbol,
                quantity: item.quantity,
                entryPrice: item.entryPrice,
                entryDate: item.entryDate,
                currentPrice: item.currentPrice,
                pnl: item.pnl,
                pnlPercent: item.pnlPercent,
                riskScore: item.riskScore,
                exposure: item.exposure,
                sector: item.sector,
            },
        });
    }
    console.log('✅ Seeding completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
