import { PrismaClient, WebsiteStatus } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();
  // "exports": {
  //   "./client": "./src/client.ts",
  //   ".": "./src/index.ts"
  // },
/**
 * Seed Users
 * Creates test users with different scenarios
 */
async function seedUsers() {
  console.log("🌱 Seeding Users...");

  const users = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      clerkId: "user_test_clerk_001",
      email: "john.doe@example.com",
      password: null, // Clerk users don't have passwords
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      clerkId: "user_test_clerk_002",
      email: "jane.smith@example.com",
      password: null,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      clerkId: "user_test_clerk_003",
      email: "bob.wilson@example.com",
      password: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { clerkId: user.clerkId },
      update: {},
      create: user,
    });
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

/**
 * Seed Validators
 * Creates validators in different geographic locations
 */
async function seedValidators() {
  console.log("🌱 Seeding Validators...");

  const validators = [
    {
      id: "650e8400-e29b-41d4-a716-446655440001",
      publicKey: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      ipAddress: "192.168.1.101",
      location: "US-East (Virginia)",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440002",
      publicKey: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      ipAddress: "192.168.1.102",
      location: "US-West (California)",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440003",
      publicKey: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      ipAddress: "192.168.1.103",
      location: "EU-West (Ireland)",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440004",
      publicKey: "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
      ipAddress: "192.168.1.104",
      location: "AP-Southeast (Singapore)",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440005",
      publicKey: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
      ipAddress: "192.168.1.105",
      location: "AP-Northeast (Tokyo)",
    },
  ];

  for (const validator of validators) {
    await prisma.validator.upsert({
      where: { publicKey: validator.publicKey },
      update: {},
      create: validator,
    });
  }

  console.log(`✅ Created ${validators.length} validators`);
  return validators;
}

/**
 * Seed Websites
 * Creates test websites for users
 */
async function seedWebsites(users: any[]) {
  console.log("🌱 Seeding Websites...");

  const websites = [
    // User 1 websites
    {
      id: "750e8400-e29b-41d4-a716-446655440001",
      url: "https://google.com",
      userId: users[0].id,
      disabled: false,
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440002",
      url: "https://github.com",
      userId: users[0].id,
      disabled: false,
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440003",
      url: "https://vercel.com",
      userId: users[0].id,
      disabled: false,
    },
    // User 2 websites
    {
      id: "750e8400-e29b-41d4-a716-446655440004",
      url: "https://amazon.com",
      userId: users[1].id,
      disabled: false,
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440005",
      url: "https://netflix.com",
      userId: users[1].id,
      disabled: false,
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440006",
      url: "https://stripe.com",
      userId: users[1].id,
      disabled: true, // Disabled website
    },
    // User 3 websites
    {
      id: "750e8400-e29b-41d4-a716-446655440007",
      url: "https://openai.com",
      userId: users[2].id,
      disabled: false,
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440008",
      url: "https://cloudflare.com",
      userId: users[2].id,
      disabled: false,
    },
  ];

  for (const website of websites) {
    await prisma.website.upsert({
      where: { id: website.id },
      update: {},
      create: website,
    });
  }

  console.log(`✅ Created ${websites.length} websites`);
  return websites;
}

/**
 * Seed Website Ticks
 * Creates realistic monitoring data for the last 30 minutes
 */
async function seedWebsiteTicks(websites: any[], validators: any[]) {
  console.log("🌱 Seeding Website Ticks...");

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  let tickCount = 0;

  // Create ticks for each website
  for (const website of websites) {
    // Skip disabled websites
    if (website.disabled) continue;

    // Generate ticks every 2 minutes for the last 30 minutes (15 ticks per validator)
    for (let i = 0; i < 15; i++) {
      const tickTime = new Date(thirtyMinutesAgo.getTime() + i * 2 * 60 * 1000);

      // Each validator checks the website
      for (const validator of validators) {
        // Simulate realistic scenarios
        let status: WebsiteStatus;
        let latency: number;

        // Most ticks are Good, with some variation
        const randomValue = Math.random();

        if (randomValue < 0.85) {
          // 85% Good status
          status = WebsiteStatus.Good;
          latency = 50 + Math.random() * 150; // 50-200ms
        } else if (randomValue < 0.95) {
          // 10% Good but slower
          status = WebsiteStatus.Good;
          latency = 200 + Math.random() * 300; // 200-500ms
        } else {
          // 5% Bad status
          status = WebsiteStatus.Bad;
          latency = 1000 + Math.random() * 4000; // 1000-5000ms (timeout)
        }

        // Special case: Simulate downtime for one website
        if (website.url === "https://stripe.com" && i >= 10 && i <= 12) {
          status = WebsiteStatus.Bad;
          latency = 5000;
        }

        const tick = {
          websiteId: website.id,
          validatorId: validator.id,
          timestamp: tickTime,
          status,
          latency,
          createdAt: tickTime,
        };

        await prisma.websiteTick.create({
          data: tick,
        });

        tickCount++;
      }
    }
  }

  console.log(`✅ Created ${tickCount} website ticks`);
}

/**
 * Main seed function
 */
async function main() {
  console.log("🚀 Starting database seed...\n");

  try {
    // Seed in order due to foreign key constraints
    const users = await seedUsers();
    const validators = await seedValidators();
    const websites = await seedWebsites(users);
    await seedWebsiteTicks(websites, validators);

    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Execute the seed function
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
