#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase, createIndexes, dropIndexes, getDatabaseStats } from '../utils/database';
import { seedDatabase, clearDatabase } from '../utils/seedData';

// Load environment variables
dotenv.config();

const command = process.argv[2];

async function runCommand() {
  try {
    await connectDatabase();
    
    switch (command) {
      case 'seed':
        console.log('🌱 Seeding database with initial data...');
        await seedDatabase();
        break;
        
      case 'clear':
        console.log('🗑️ Clearing all data from database...');
        const confirm = process.argv[3];
        if (confirm !== '--confirm') {
          console.log('⚠️ This will delete all data. Use --confirm flag to proceed.');
          console.log('Example: npm run db:clear -- --confirm');
          process.exit(1);
        }
        await clearDatabase();
        break;
        
      case 'reset':
        console.log('🔄 Resetting database (clear + seed)...');
        const confirmReset = process.argv[3];
        if (confirmReset !== '--confirm') {
          console.log('⚠️ This will delete all data and reseed. Use --confirm flag to proceed.');
          console.log('Example: npm run db:reset -- --confirm');
          process.exit(1);
        }
        await clearDatabase();
        await seedDatabase();
        break;
        
      case 'indexes':
        console.log('🔍 Creating database indexes...');
        await createIndexes();
        break;
        
      case 'drop-indexes':
        console.log('🗑️ Dropping database indexes...');
        await dropIndexes();
        break;
        
      case 'stats':
        console.log('📊 Getting database statistics...');
        const stats = await getDatabaseStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
        
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  seed          - Seed database with initial data');
        console.log('  clear         - Clear all data (requires --confirm)');
        console.log('  reset         - Clear and reseed database (requires --confirm)');
        console.log('  indexes       - Create database indexes');
        console.log('  drop-indexes  - Drop database indexes');
        console.log('  stats         - Show database statistics');
        process.exit(1);
    }
    
    console.log('✅ Operation completed successfully');
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

runCommand();