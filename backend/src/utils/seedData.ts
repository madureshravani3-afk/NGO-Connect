import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, NGO, Donation } from '../models';

/**
 * Seed initial admin user
 */
export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        email: process.env.ADMIN_EMAIL || 'admin@donorngo.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+91-9999999999'
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

/**
 * Seed sample donor users
 */
export const seedSampleDonors = async (): Promise<void> => {
  try {
    // Check if specific sample donors exist
    const johnExists = await User.findOne({ email: 'john.doe@example.com' });
    const janeExists = await User.findOne({ email: 'jane.smith@example.com' });
    
    if (!johnExists || !janeExists) {
      const sampleDonors = [
        {
          email: 'john.doe@example.com',
          password: 'password123',
          role: 'donor' as const,
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+91-9876543210',
            address: {
              street: '123 MG Road',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560001',
              coordinates: {
                lat: 12.9716,
                lng: 77.5946
              }
            }
          }
        },
        {
          email: 'jane.smith@example.com',
          password: 'password123',
          role: 'donor' as const,
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+91-9876543211',
            address: {
              street: '456 Brigade Road',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560025',
              coordinates: {
                lat: 12.9698,
                lng: 77.6205
              }
            }
          }
        }
      ];
      
      // Create users one by one to trigger pre-save middleware
      for (const donorData of sampleDonors) {
        const donor = new User(donorData);
        await donor.save();
      }
      console.log('✅ Sample donor users created successfully');
    } else {
      console.log('ℹ️ Donor users already exist');
    }
  } catch (error) {
    console.error('❌ Error seeding sample donors:', error);
    throw error;
  }
};

/**
 * Seed sample NGO users and organizations
 */
export const seedSampleNGOs = async (): Promise<void> => {
  try {
    // Check if specific sample NGO users exist
    const helpingHandsExists = await User.findOne({ email: 'contact@helpinghands.org' });
    const careForAllExists = await User.findOne({ email: 'info@careforall.org' });
    
    if (!helpingHandsExists || !careForAllExists) {
      // Create NGO users
      const ngoUsers = [
        {
          email: 'contact@helpinghands.org',
          password: 'password123',
          role: 'ngo' as const,
          profile: {
            firstName: 'Helping',
            lastName: 'Hands',
            phone: '+91-9876543212',
            address: {
              street: '789 Residency Road',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560025',
              coordinates: {
                lat: 12.9698,
                lng: 77.6205
              }
            }
          }
        },
        {
          email: 'info@careforall.org',
          password: 'password123',
          role: 'ngo' as const,
          profile: {
            firstName: 'Care',
            lastName: 'For All',
            phone: '+91-9876543213',
            address: {
              street: '321 Commercial Street',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560001',
              coordinates: {
                lat: 12.9716,
                lng: 77.5946
              }
            }
          }
        }
      ];
      
      // Create NGO users one by one to trigger pre-save middleware
      const createdNGOUsers = [];
      for (const ngoUserData of ngoUsers) {
        const ngoUser = new User(ngoUserData);
        await ngoUser.save();
        createdNGOUsers.push(ngoUser);
      }
      
      // Create NGO organizations
      const ngoOrganizations = [
        {
          userId: createdNGOUsers[0]._id,
          organizationName: 'Helping Hands Foundation',
          registrationNumber: 'HHF2020001',
          categories: ['food', 'clothing', 'education'],
          documents: [
            {
              type: 'registration_certificate',
              fileId: new mongoose.Types.ObjectId().toString(),
              filename: 'helping_hands_registration.pdf'
            },
            {
              type: 'tax_exemption',
              fileId: new mongoose.Types.ObjectId().toString(),
              filename: 'helping_hands_tax_exemption.pdf'
            }
          ],
          verificationStatus: 'pending' as const,
          pickupService: true,
          serviceRadius: 15,
          description: 'Dedicated to helping underprivileged communities with food, clothing, and education support.'
        },
        {
          userId: createdNGOUsers[1]._id,
          organizationName: 'Care For All Society',
          registrationNumber: 'CFA2019002',
          categories: ['healthcare', 'education', 'food'],
          documents: [
            {
              type: 'registration_certificate',
              fileId: new mongoose.Types.ObjectId().toString(),
              filename: 'care_for_all_registration.pdf'
            },
            {
              type: 'pan_card',
              fileId: new mongoose.Types.ObjectId().toString(),
              filename: 'care_for_all_pan.pdf'
            }
          ],
          verificationStatus: 'pending' as const,
          pickupService: false,
          serviceRadius: 10,
          description: 'Focused on healthcare and education initiatives for rural and urban poor.'
        }
      ];
      
      await NGO.insertMany(ngoOrganizations);
      console.log('✅ Sample NGO users and organizations created successfully');
    } else {
      console.log('ℹ️ NGO users already exist');
    }
  } catch (error) {
    console.error('❌ Error seeding sample NGOs:', error);
    throw error;
  }
};

/**
 * Seed sample donations
 */
export const seedSampleDonations = async (): Promise<void> => {
  try {
    const donationCount = await Donation.countDocuments();
    
    if (donationCount === 0) {
      const donors = await User.find({ role: 'donor' }).limit(2);
      
      if (donors.length > 0) {
        const sampleDonations: any[] = [
          {
            donorId: donors[0]._id,
            title: 'Fresh Vegetables and Fruits',
            description: 'Surplus vegetables and fruits from our garden. Good quality and fresh.',
            category: 'food' as const,
            quantity: '10 kg mixed vegetables, 5 kg fruits',
            images: [],
            location: {
              address: '123 MG Road, Bangalore, Karnataka 560001',
              coordinates: {
                lat: 12.9716,
                lng: 77.5946
              }
            },
            pickupOption: 'both' as const,
            foodExpiry: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
            status: 'available' as const,
            urgency: 'high' as const
          },
          {
            donorId: donors[0]._id,
            title: 'Winter Clothing Collection',
            description: 'Gently used winter clothes including jackets, sweaters, and blankets.',
            category: 'clothing' as const,
            quantity: '20 pieces of clothing',
            images: [],
            location: {
              address: '123 MG Road, Bangalore, Karnataka 560001',
              coordinates: {
                lat: 12.9716,
                lng: 77.5946
              }
            },
            pickupOption: 'pickup' as const,
            status: 'available' as const,
            urgency: 'medium' as const
          }
        ];
        
        if (donors.length > 1) {
          sampleDonations.push({
            donorId: donors[1]._id,
            title: 'Educational Books and Stationery',
            description: 'Collection of textbooks, notebooks, and stationery items for school children.',
            category: 'books' as const,
            quantity: '50 books, 100 notebooks, stationery items',
            images: [],
            location: {
              address: '456 Brigade Road, Bangalore, Karnataka 560025',
              coordinates: {
                lat: 12.9698,
                lng: 77.6205
              }
            },
            pickupOption: 'both' as const,
            status: 'available' as const,
            urgency: 'medium' as const
          });
        }
        
        await Donation.insertMany(sampleDonations);
        console.log('✅ Sample donations created successfully');
      } else {
        console.log('⚠️ No donor users found, skipping donation seeding');
      }
    } else {
      console.log('ℹ️ Donations already exist');
    }
  } catch (error) {
    console.error('❌ Error seeding sample donations:', error);
    throw error;
  }
};

/**
 * Run all seeding operations
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedAdminUser();
    await seedSampleDonors();
    await seedSampleNGOs();
    await seedSampleDonations();
    
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Clear all data (useful for testing)
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🗑️ Clearing database...');
    
    await User.deleteMany({});
    await NGO.deleteMany({});
    await Donation.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};