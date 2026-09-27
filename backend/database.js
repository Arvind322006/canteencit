const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'canteen.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initTables();
  }
});

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initTables() {
  try {
    // Users table
    await runQuery(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    await runQuery(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

    // Food Items table
    await runQuery(`CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      is_veg INTEGER DEFAULT 1,
      rating REAL DEFAULT 4.5,
      prep_time INTEGER DEFAULT 10,
      is_available INTEGER DEFAULT 1,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ingredients table (Inventory)
    await runQuery(`CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      low_threshold REAL NOT NULL,
      cost_per_unit REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Food Ingredients Mapping
    await runQuery(`CREATE TABLE IF NOT EXISTS food_ingredients (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL,
      ingredient_id TEXT NOT NULL,
      required_quantity REAL NOT NULL
    )`);

    // Pickup Slots
    await runQuery(`CREATE TABLE IF NOT EXISTS pickup_slots (
      id TEXT PRIMARY KEY,
      slot_time TEXT NOT NULL,
      max_capacity INTEGER NOT NULL DEFAULT 20,
      current_booked INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )`);

    // Orders
    await runQuery(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PLACED',
      pickup_slot TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PAID',
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      qr_code_data TEXT
    )`);

    // Order Items
    await runQuery(`CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      food_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )`);

    // Waste Records
    await runQuery(`CREATE TABLE IF NOT EXISTS waste_records (
      id TEXT PRIMARY KEY,
      waste_date TEXT NOT NULL,
      food_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      prepared_qty INTEGER NOT NULL,
      sold_qty INTEGER NOT NULL,
      remaining_qty INTEGER NOT NULL,
      wasted_qty INTEGER NOT NULL,
      reason TEXT NOT NULL,
      recommendation TEXT
    )`);

    // Notifications
    await runQuery(`CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Reviews
    await runQuery(`CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      food_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed Initial Data if empty
    await seedDatabase();
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

async function seedDatabase() {
  try {
    const userCount = await getQuery(`SELECT COUNT(*) as count FROM users`);
    if (userCount && userCount.count > 0) {
      console.log('Database already populated with initial data.');
      return;
    }

    console.log('Seeding fresh demo database data...');

    // Password hash
    const adminPass = await bcrypt.hash('admin123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    // Users
    await runQuery(`INSERT INTO users (id, name, email, password, role, phone) VALUES 
      ('usr_admin', 'Canteen Admin', 'admin@canteen.edu', '${adminPass}', 'ADMIN', '9876543210'),
      ('usr_student1', 'Rahul Sharma', 'rahul@college.edu', '${studentPass}', 'STUDENT', '9876543211'),
      ('usr_student2', 'Ananya Patel', 'ananya@college.edu', '${studentPass}', 'STUDENT', '9876543212'),
      ('usr_student3', 'Vikram Singh', 'vikram@college.edu', '${studentPass}', 'STUDENT', '9876543213')`);

    // Categories
    await runQuery(`INSERT INTO categories (id, name) VALUES 
      ('cat_1', 'Breakfast'),
      ('cat_2', 'Lunch'),
      ('cat_3', 'Snacks'),
      ('cat_4', 'Drinks')`);

    // Food Items
    const foodItems = [
      ['food_1', 'Special Chicken Biryani', 'Aromatic basmati rice cooked with tender marinated chicken & rich Indian spices, served with raita.', 140, 'Lunch', 0, 4.8, 15, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'],
      ['food_2', 'Hyderabadi Veg Biryani', 'Fragrant spiced rice loaded with fresh garden vegetables, paneer & caramelized onions.', 110, 'Lunch', 1, 4.6, 12, 1, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80'],
      ['food_3', 'Paneer Butter Masala & Roti', 'Rich creamy tomato gravy with soft cottage cheese cubes served with 3 butter rotis.', 130, 'Lunch', 1, 4.7, 15, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80'],
      ['food_4', 'Kerala Parotta & Curry (2 pcs)', 'Flaky, layered Malabar parottas served with spicy chickpea or vegetable kurma.', 70, 'Lunch', 1, 4.9, 10, 1, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'],
      ['food_5', 'Schezwan Egg Fried Rice', 'Wok-tossed rice with fluffy scrambled eggs, colorful peppers & spicy Schezwan sauce.', 95, 'Lunch', 0, 4.5, 12, 1, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80'],
      ['food_6', 'Crispy Golden Samosa (2 pcs)', 'Deep-fried crispy pastry stuffed with spiced potato & green peas, served with mint chutney.', 30, 'Snacks', 1, 4.4, 5, 1, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'],
      ['food_7', 'Crispy Vegetable Puffs', 'Flaky puff pastry stuffed with spicy savory potato filling. College favourite snack!', 25, 'Snacks', 1, 4.3, 3, 1, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80'],
      ['food_8', 'Chicken Kathi Roll', 'Griddle cooked flatbread stuffed with spicy grilled chicken tikka, onions & tangy sauce.', 85, 'Snacks', 0, 4.7, 8, 1, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'],
      ['food_9', 'Crispy Masala Dosa', 'Golden crispy rice crepe filled with spiced potato masala, served with coconut chutney & sambar.', 60, 'Breakfast', 1, 4.6, 10, 1, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80'],
      ['food_10', 'Idli Vada Combo', '2 Steamed soft idlis + 1 crunchy medu vada served with piping hot sambar & chutney.', 50, 'Breakfast', 1, 4.5, 5, 1, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'],
      ['food_11', 'Chilled Thick Cold Coffee', 'Rich espresso blended with chilled milk, vanilla cream & chocolate drizzle.', 50, 'Drinks', 1, 4.8, 4, 1, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'],
      ['food_12', 'Fresh Lemon Mint Cooler', 'Zesty fresh lemon juice infused with fresh mint leaves and soda.', 35, 'Drinks', 1, 4.6, 3, 1, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80']
    ];

    for (const f of foodItems) {
      await runQuery(`INSERT INTO food_items (id, name, description, price, category, is_veg, rating, prep_time, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, f);
    }

    // Ingredients
    const ingredients = [
      ['ing_1', 'Basmati Rice', 25.0, 'kg', 10.0, 80],
      ['ing_2', 'Fresh Chicken', 4.0, 'kg', 8.0, 220],
      ['ing_3', 'Refined Cooking Oil', 2.5, 'L', 5.0, 130],
      ['ing_4', 'Fresh Paneer', 12.0, 'kg', 5.0, 320],
      ['ing_5', 'All-Purpose Flour (Maida)', 18.0, 'kg', 8.0, 45],
      ['ing_6', 'Potatoes & Onions', 15.0, 'kg', 10.0, 30],
      ['ing_7', 'Fresh Milk', 6.0, 'L', 10.0, 55],
      ['ing_8', 'Biryani Spices & Herbs', 4.5, 'kg', 2.0, 400]
    ];

    for (const ing of ingredients) {
      await runQuery(`INSERT INTO ingredients (id, name, stock_quantity, unit, low_threshold, cost_per_unit) VALUES (?, ?, ?, ?, ?, ?)`, ing);
    }

    // Food Ingredients Mapping (for automatic inventory deduction)
    const foodIngs = [
      ['fi_1', 'food_1', 'ing_1', 0.25], // 250g rice per biryani
      ['fi_2', 'food_1', 'ing_2', 0.20], // 200g chicken per biryani
      ['fi_3', 'food_1', 'ing_3', 0.05], // 50ml oil
      ['fi_4', 'food_2', 'ing_1', 0.25], // 250g rice
      ['fi_5', 'food_3', 'ing_4', 0.15], // 150g paneer
      ['fi_6', 'food_4', 'ing_5', 0.15], // 150g flour for 2 parottas
      ['fi_7', 'food_6', 'ing_6', 0.10], // 100g potato per samosa order
      ['fi_8', 'food_11', 'ing_7', 0.25] // 250ml milk per cold coffee
    ];

    for (const fi of foodIngs) {
      await runQuery(`INSERT INTO food_ingredients (id, food_id, ingredient_id, required_quantity) VALUES (?, ?, ?, ?)`, fi);
    }

    // Pickup Slots
    const slots = [
      ['slot_1', '08:30 AM - 08:40 AM', 20, 4, 1],
      ['slot_2', '08:40 AM - 08:50 AM', 20, 8, 1],
      ['slot_3', '09:00 AM - 09:10 AM', 20, 15, 1],
      ['slot_4', '12:30 PM - 12:40 PM', 20, 19, 1],
      ['slot_5', '12:40 PM - 12:50 PM', 20, 14, 1],
      ['slot_6', '12:50 PM - 01:00 PM', 20, 6, 1],
      ['slot_7', '01:00 PM - 01:10 PM', 20, 2, 1],
      ['slot_8', '04:30 PM - 04:40 PM', 15, 5, 1],
      ['slot_9', '04:40 PM - 04:50 PM', 15, 3, 1]
    ];

    for (const s of slots) {
      await runQuery(`INSERT INTO pickup_slots (id, slot_time, max_capacity, current_booked, is_active) VALUES (?, ?, ?, ?, ?)`, s);
    }

    // Orders & Order Items
    const sampleOrders = [
      {
        id: 'CAN-2026-00101',
        user_id: 'usr_student1',
        user_name: 'Rahul Sharma',
        status: 'READY FOR PICKUP',
        pickup_slot: '12:30 PM - 12:40 PM',
        total_amount: 190,
        payment_method: 'UPI',
        payment_status: 'PAID',
        created_at: new Date(Date.now() - 35 * 60000).toISOString(),
        items: [
          { food_id: 'food_1', food_name: 'Special Chicken Biryani', price: 140, quantity: 1 },
          { food_id: 'food_11', food_name: 'Chilled Thick Cold Coffee', price: 50, quantity: 1 }
        ]
      },
      {
        id: 'CAN-2026-00102',
        user_id: 'usr_student2',
        user_name: 'Ananya Patel',
        status: 'PREPARING',
        pickup_slot: '12:40 PM - 12:50 PM',
        total_amount: 180,
        payment_method: 'CARD',
        payment_status: 'PAID',
        created_at: new Date(Date.now() - 20 * 60000).toISOString(),
        items: [
          { food_id: 'food_3', food_name: 'Paneer Butter Masala & Roti', price: 130, quantity: 1 },
          { food_id: 'food_10', food_name: 'Idli Vada Combo', price: 50, quantity: 1 }
        ]
      },
      {
        id: 'CAN-2026-00103',
        user_id: 'usr_student3',
        user_name: 'Vikram Singh',
        status: 'CONFIRMED',
        pickup_slot: '12:40 PM - 12:50 PM',
        total_amount: 140,
        payment_method: 'UPI',
        payment_status: 'PAID',
        created_at: new Date(Date.now() - 10 * 60000).toISOString(),
        items: [
          { food_id: 'food_1', food_name: 'Special Chicken Biryani', price: 140, quantity: 1 }
        ]
      },
      {
        id: 'CAN-2026-00104',
        user_id: 'usr_student1',
        user_name: 'Rahul Sharma',
        status: 'PLACED',
        pickup_slot: '12:50 PM - 01:00 PM',
        total_amount: 105,
        payment_method: 'CASH',
        payment_status: 'PENDING',
        created_at: new Date(Date.now() - 2 * 60000).toISOString(),
        items: [
          { food_id: 'food_4', food_name: 'Kerala Parotta & Curry (2 pcs)', price: 70, quantity: 1 },
          { food_id: 'food_12', food_name: 'Fresh Lemon Mint Cooler', price: 35, quantity: 1 }
        ]
      },
      {
        id: 'CAN-2026-00095',
        user_id: 'usr_student2',
        user_name: 'Ananya Patel',
        status: 'COMPLETED',
        pickup_slot: '09:00 AM - 09:10 AM',
        total_amount: 110,
        payment_method: 'UPI',
        payment_status: 'PAID',
        created_at: new Date(Date.now() - 240 * 60000).toISOString(),
        items: [
          { food_id: 'food_9', food_name: 'Crispy Masala Dosa', price: 60, quantity: 1 },
          { food_id: 'food_10', food_name: 'Idli Vada Combo', price: 50, quantity: 1 }
        ]
      },
      {
        id: 'CAN-2026-00090',
        user_id: 'usr_student3',
        user_name: 'Vikram Singh',
        status: 'COMPLETED',
        pickup_slot: '08:40 AM - 08:50 AM',
        total_amount: 280,
        payment_method: 'UPI',
        payment_status: 'PAID',
        created_at: new Date(Date.now() - 300 * 60000).toISOString(),
        items: [
          { food_id: 'food_1', food_name: 'Special Chicken Biryani', price: 140, quantity: 2 }
        ]
      }
    ];

    for (const ord of sampleOrders) {
      await runQuery(`INSERT INTO orders (id, user_id, user_name, status, pickup_slot, total_amount, payment_method, payment_status, created_at, qr_code_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [ord.id, ord.user_id, ord.user_name, ord.status, ord.pickup_slot, ord.total_amount, ord.payment_method, ord.payment_status, ord.created_at, JSON.stringify({ orderId: ord.id, user: ord.user_name })]);

      for (const item of ord.items) {
        await runQuery(`INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
          [`item_${Math.random().toString(36).substr(2, 8)}`, ord.id, item.food_id, item.food_name, item.price, item.quantity]);
      }
    }

    // Historical Orders for Demand Prediction calculations (Past 7 days)
    // We add entries to give Biryani, Parotta, Dosa, Rice historical order volumes
    const pastDates = [1, 2, 3, 4, 5, 6, 7];
    for (const daysAgo of pastDates) {
      const dateStr = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();
      const pastOrderId = `CAN-HIST-${daysAgo}`;
      await runQuery(`INSERT INTO orders (id, user_id, user_name, status, pickup_slot, total_amount, payment_method, payment_status, created_at, qr_code_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pastOrderId, 'usr_student1', 'Historical Student', 'COMPLETED', '12:30 PM - 12:40 PM', 500, 'UPI', 'PAID', dateStr, 'HIST']);

      // Biryani sales (Avg around 75-85 per day)
      await runQuery(`INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [`hist_${daysAgo}_1`, pastOrderId, 'food_1', 'Special Chicken Biryani', 140, Math.floor(70 + Math.random() * 20)]);

      // Veg Biryani sales (Avg around 40-50 per day)
      await runQuery(`INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [`hist_${daysAgo}_2`, pastOrderId, 'food_2', 'Hyderabadi Veg Biryani', 110, Math.floor(40 + Math.random() * 15)]);

      // Parotta sales (Avg around 50-60 per day)
      await runQuery(`INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [`hist_${daysAgo}_3`, pastOrderId, 'food_4', 'Kerala Parotta & Curry (2 pcs)', 70, Math.floor(45 + Math.random() * 15)]);

      // Samosa sales (Avg around 90-110 per day)
      await runQuery(`INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [`hist_${daysAgo}_4`, pastOrderId, 'food_6', 'Crispy Golden Samosa (2 pcs)', 30, Math.floor(85 + Math.random() * 25)]);
    }

    // Waste Records (Past 5 days)
    const wasteData = [
      ['w_1', '2026-09-26', 'food_1', 'Special Chicken Biryani', 100, 84, 16, 12, 'Over-preparation on low attendance day (Friday)', 'Reduce Biryani prep quantity by 10-15% on Fridays.'],
      ['w_2', '2026-09-26', 'food_6', 'Crispy Golden Samosa (2 pcs)', 120, 115, 5, 2, 'Slightly burnt during late afternoon batch', 'Monitor frying timer for afternoon batches.'],
      ['w_3', '2026-09-25', 'food_3', 'Paneer Butter Masala & Roti', 60, 48, 12, 10, 'Unused gravy at closing time', 'Prepare gravy in 2 smaller batches instead of 1 bulk batch.'],
      ['w_4', '2026-09-24', 'food_1', 'Special Chicken Biryani', 90, 88, 2, 2, 'Minor kitchen spill', 'Normal operational tolerance.'],
      ['w_5', '2026-09-23', 'food_4', 'Kerala Parotta & Curry (2 pcs)', 80, 62, 18, 15, 'Rainy weather reduced afternoon student turnout', 'Integrate weather forecast buffer in daily preparation planning.']
    ];

    for (const w of wasteData) {
      await runQuery(`INSERT INTO waste_records (id, waste_date, food_id, food_name, prepared_qty, sold_qty, remaining_qty, wasted_qty, reason, recommendation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, w);
    }

    // Notifications
    const nowIso = new Date().toISOString();
    await runQuery(`INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
      ('n_1', 'usr_student1', 'Order Ready for Pickup! 🍱', 'Your Order #CAN-2026-00101 is ready for pickup at Counter 2.', 0, '${nowIso}'),
      ('n_2', 'usr_student2', 'Order Confirmed! 👨‍🍳', 'Your Order #CAN-2026-00102 has been confirmed by kitchen staff.', 0, '${nowIso}')`);

    // Reviews
    await runQuery(`INSERT INTO reviews (id, user_id, user_name, food_id, food_name, rating, comment) VALUES
      ('r_1', 'usr_student1', 'Rahul Sharma', 'food_1', 'Special Chicken Biryani', 5, 'Absolutely delicious and piping hot! Chicken was so tender.'),
      ('r_2', 'usr_student2', 'Ananya Patel', 'food_4', 'Kerala Parotta & Curry (2 pcs)', 5, 'Soft flaky parottas with amazing spicy kurma. 10/10!')`);

    console.log('Database successfully seeded with realistic canteen data!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery
};
