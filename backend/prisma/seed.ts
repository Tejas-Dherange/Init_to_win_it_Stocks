import { PrismaClient } from '@prisma/client';
import { csvDataLoader } from '../src/services/data-sources/CSVDataLoader';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create Default User
    const userId = '1';
    const user = await prisma.user.upsert({
        where: { email: 'demo@riskmind.ai' },
        update: {},
        create: {
            id: userId,
            email: 'demo@riskmind.ai',
            name: 'Demo Trader',
            password: 'hashed_password_here', // In production, hash this!
            riskTolerance: 0.6,
        },
    });
    console.log(`👤 Created/Found User: ${user.name}`);

    // 2. Load Portfolio from CSV
    const portfolioData = await csvDataLoader.loadPortfolio(userId);
    console.log(`📦 Found ${portfolioData.length} portfolio items in CSV.`);

    for (const item of portfolioData) {
        // Check if position exists
        const existing = await prisma.portfolio.findUnique({
            where: {
                userId_symbol: {
                    userId: userId,
                    symbol: item.symbol,
                },
            },
        });

        if (!existing) {
            await prisma.portfolio.create({
                data: {
                    userId: userId,
                    symbol: item.symbol,
                    quantity: parseInt(item.quantity, 10),
                    entryPrice: parseFloat(item.entry_price),
                    entryDate: new Date(item.entry_date), // Ensure CSV date format matches or parse it
                    currentPrice: parseFloat(item.current_price),
                    pnl: parseFloat(item.pnl),
                    pnlPercent: parseFloat(item.pnl_percent),
                    riskScore: parseFloat(item.risk_score),
                    exposure: parseFloat(item.exposure),
                    sector: item.sector,
                },
            });
            console.log(`   + Added position: ${item.symbol}`);
        } else {
            console.log(`   = Skipped existing position: ${item.symbol}`);
        }
    }

    // 3. Seed Stock Ticks (Optional, strictly for history if needed, but app reads ticks from CSV mostly)
    // Logic: For now, we mainly rely on CSV for ticks, but we could seed them into DB if we switch to DB-based TickLoader.
    // Skipping to keep seed fast and focused on User/Portfolio.

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
