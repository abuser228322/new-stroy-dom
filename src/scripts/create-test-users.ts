import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { hashPassword } from '../lib/auth';
import { eq } from 'drizzle-orm';

async function createTestUsers() {
  console.log('Creating test users...\n');

  // Пароли для тестовых пользователей
  const testUsers = [
    {
      username: 'superadmin',
      password: 'Super123!',
      role: 'SUPERADMIN' as const,
      firstName: 'Главный',
      lastName: 'Админ',
      email: 'superadmin@stroydom30.ru',
    },
    {
      username: 'admin',
      password: 'Admin123!',
      role: 'ADMIN' as const,
      firstName: 'Админ',
      lastName: 'Тестовый',
      email: 'admin@stroydom30.ru',
    },
    {
      username: 'moderator',
      password: 'Moder123!',
      role: 'MODER' as const,
      firstName: 'Модератор',
      lastName: 'Тестовый',
      email: 'moder@stroydom30.ru',
    },
  ];

  for (const userData of testUsers) {
    // Проверяем, существует ли пользователь
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, userData.username),
    });

    if (existingUser) {
      console.log(`User "${userData.username}" already exists, updating role...`);
      await db.update(users)
        .set({ role: userData.role })
        .where(eq(users.username, userData.username));
      console.log(`  Updated role to ${userData.role}`);
      continue;
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(userData.password);

    // Создаём пользователя
    await db.insert(users).values({
      username: userData.username,
      passwordHash: passwordHash,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      isActive: true,
    });

    console.log(`✓ Created user: ${userData.username}`);
    console.log(`  Password: ${userData.password}`);
    console.log(`  Role: ${userData.role}`);
    console.log('');
  }

  console.log('\n=== Test Users Credentials ===');
  console.log('');
  console.log('SUPERADMIN:');
  console.log('  Login: superadmin');
  console.log('  Password: Super123!');
  console.log('');
  console.log('ADMIN:');
  console.log('  Login: admin');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('MODERATOR:');
  console.log('  Login: moderator');
  console.log('  Password: Moder123!');
  console.log('');
  console.log('Done!');
  
  process.exit(0);
}

createTestUsers().catch(console.error);
