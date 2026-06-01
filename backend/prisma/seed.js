"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../src/config/database");
async function main() {
    console.log('🌱 Starting database seeding...');
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Cleaning existing data...');
    await database_1.prisma.user.deleteMany();
    await database_1.prisma.role.deleteMany();
    // Seed Roles
    console.log('👥 Seeding roles...');
    const adminRole = await database_1.prisma.role.create({
        data: {
            name: client_1.RoleType.ADMIN,
            description: 'Administrator with full access',
        },
    });
    const userRole = await database_1.prisma.role.create({
        data: {
            name: client_1.RoleType.USER,
            description: 'Regular user with limited access',
        },
    });
    const moderatorRole = await database_1.prisma.role.create({
        data: {
            name: client_1.RoleType.MODERATOR,
            description: 'Moderator with elevated permissions',
        },
    });
    console.log('✅ Roles created:', { adminRole, userRole, moderatorRole });
    // Seed Admin User
    console.log('👤 Seeding admin user...');
    const hashedPassword = await bcryptjs_1.default.hash('Admin@123', 10);
    const adminUser = await database_1.prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            status: client_1.UserStatus.ACTIVE,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            roleId: adminRole.id,
        },
    });
    console.log('✅ Admin user created:', {
        email: adminUser.email,
        role: adminRole.name,
    });
    // Seed Regular Users
    console.log('👥 Seeding regular users...');
    const regularUsers = await Promise.all([
        database_1.prisma.user.create({
            data: {
                email: 'user1@example.com',
                password: await bcryptjs_1.default.hash('User@123', 10),
                firstName: 'John',
                lastName: 'Doe',
                status: client_1.UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                roleId: userRole.id,
            },
        }),
        database_1.prisma.user.create({
            data: {
                email: 'user2@example.com',
                password: await bcryptjs_1.default.hash('User@123', 10),
                firstName: 'Jane',
                lastName: 'Smith',
                status: client_1.UserStatus.ACTIVE,
                emailVerified: false,
                roleId: userRole.id,
            },
        }),
        database_1.prisma.user.create({
            data: {
                email: 'moderator@example.com',
                password: await bcryptjs_1.default.hash('Mod@123', 10),
                firstName: 'Mike',
                lastName: 'Moderator',
                status: client_1.UserStatus.ACTIVE,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                roleId: moderatorRole.id,
            },
        }),
    ]);
    console.log(`✅ Created ${regularUsers.length} regular users`);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   User: user1@example.com / User@123');
    console.log('   Moderator: moderator@example.com / Mod@123');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await database_1.prisma.$disconnect();
});
