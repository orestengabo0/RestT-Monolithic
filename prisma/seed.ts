import { RoleType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Seed Roles
  console.log('👥 Seeding roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: RoleType.ADMIN,
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: RoleType.USER,
      description: 'Regular user with limited access',
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: RoleType.MODERATOR,
      description: 'Moderator with elevated permissions',
    },
  });

  console.log('✅ Roles created:', { adminRole, userRole, moderatorRole });

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: UserStatus.ACTIVE,
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
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: await bcrypt.hash('User@123', 10),
        firstName: 'John',
        lastName: 'Doe',
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        roleId: userRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: await bcrypt.hash('User@123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        status: UserStatus.ACTIVE,
        emailVerified: false,
        roleId: userRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@example.com',
        password: await bcrypt.hash('Mod@123', 10),
        firstName: 'Mike',
        lastName: 'Moderator',
        status: UserStatus.ACTIVE,
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
    await prisma.$disconnect();
  });
