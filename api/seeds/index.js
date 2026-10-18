/**
 * @file apps/api/seeds/index.js
 * @description Master database seed script for MyBigBazaar platform core
 */

import colors from 'colors';
import { connectDB, closeDB } from '../config/db.js';
import seedCategories from './seedCategories.js';
import seedAdmin from './seedAdmin.js';
import seedSampleData from './seedSampleData.js';

const runSeeds = async () => {
  console.log('=================================================='.cyan);
  console.log('       MyBigBazaar Master Database Seeder         '.bgBlue.white);
  console.log('=================================================='.cyan);

  const conn = await connectDB();
  if (!conn) {
    console.error('[SEED] Could not connect to database. Aborting seed.'.red);
    process.exit(1);
  }

  try {
    await seedCategories();
    await seedAdmin();
    await seedSampleData();

    console.log('\n=================================================='.green);
    console.log('   ✓ Database Seeding Completed Successfully!     '.bgGreen.black);
    console.log('==================================================\n'.green);
  } catch (err) {
    console.error('[SEED] Seeding error:'.red, err);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

runSeeds();
