import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'library.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }

  try {
    // Hash passwords
    const adminPassword = await bcryptjs.hash('admin123', 10);
    const userPassword = await bcryptjs.hash('user123', 10);

    // Insert demo users
    db.run(
      'INSERT OR IGNORE INTO users (username, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', adminPassword, 'Admin User', 'admin', 'admin@library.com', '1234567890'],
      (err) => {
        if (err) console.error('Error inserting admin:', err);
        else console.log('✅ Admin user created/exists');
      }
    );

    db.run(
      'INSERT OR IGNORE INTO users (username, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['user', userPassword, 'Regular User', 'user', 'user@library.com', '0987654321'],
      (err) => {
        if (err) console.error('Error inserting user:', err);
        else console.log('✅ Regular user created/exists');
      }
    );

    // Add sample data
    const today = new Date().toISOString().split('T')[0];

    db.run(
      'INSERT OR IGNORE INTO members (name, email, phone, membership_type, membership_start_date, membership_end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['John Doe', 'john@example.com', '1111111111', '6 months', today, new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0], 'active'],
      (err) => {
        if (err) console.error('Error inserting member:', err);
        else console.log('✅ Sample member created');
      }
    );

    db.run(
      'INSERT OR IGNORE INTO books (title, author, isbn, serial_no, status) VALUES (?, ?, ?, ?, ?)',
      ['The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'BOOK001', 'available'],
      (err) => {
        if (err) console.error('Error inserting book:', err);
        else console.log('✅ Sample book created');
      }
    );

    db.run(
      'INSERT OR IGNORE INTO books (title, author, isbn, serial_no, status) VALUES (?, ?, ?, ?, ?)',
      ['To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'BOOK002', 'available'],
      (err) => {
        if (err) console.error('Error inserting book:', err);
        else console.log('✅ Sample book 2 created');
      }
    );

    setTimeout(() => {
      console.log('\n✅ Database seeding completed!');
      db.close();
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
