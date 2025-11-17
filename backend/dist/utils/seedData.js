"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDatabase = exports.seedDatabase = exports.seedSampleDonations = exports.seedSampleNGOs = exports.seedSampleDonors = exports.seedAdminUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const seedAdminUser = async () => {
    try {
        const adminExists = await models_1.User.findOne({ role: 'admin' });
        if (!adminExists) {
            const adminUser = new models_1.User({
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
        }
        else {
            console.log('ℹ️ Admin user already exists');
        }
    }
    catch (error) {
        console.error('❌ Error seeding admin user:', error);
        throw error;
    }
};
exports.seedAdminUser = seedAdminUser;
const seedSampleDonors = async () => {
    try {
        const johnExists = await models_1.User.findOne({ email: 'john.doe@example.com' });
        const janeExists = await models_1.User.findOne({ email: 'jane.smith@example.com' });
        if (!johnExists || !janeExists) {
            const sampleDonors = [
                {
                    email: 'john.doe@example.com',
                    password: 'password123',
                    role: 'donor',
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
                    role: 'donor',
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
            for (const donorData of sampleDonors) {
                const donor = new models_1.User(donorData);
                await donor.save();
            }
            console.log('✅ Sample donor users created successfully');
        }
        else {
            console.log('ℹ️ Donor users already exist');
        }
    }
    catch (error) {
        console.error('❌ Error seeding sample donors:', error);
        throw error;
    }
};
exports.seedSampleDonors = seedSampleDonors;
const seedSampleNGOs = async () => {
    try {
        const helpingHandsExists = await models_1.User.findOne({ email: 'contact@helpinghands.org' });
        const careForAllExists = await models_1.User.findOne({ email: 'info@careforall.org' });
        if (!helpingHandsExists || !careForAllExists) {
            const ngoUsers = [
                {
                    email: 'contact@helpinghands.org',
                    password: 'password123',
                    role: 'ngo',
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
                    role: 'ngo',
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
            const createdNGOUsers = [];
            for (const ngoUserData of ngoUsers) {
                const ngoUser = new models_1.User(ngoUserData);
                await ngoUser.save();
                createdNGOUsers.push(ngoUser);
            }
            const ngoOrganizations = [
                {
                    userId: createdNGOUsers[0]._id,
                    organizationName: 'Helping Hands Foundation',
                    registrationNumber: 'HHF2020001',
                    categories: ['food', 'clothing', 'education'],
                    documents: [
                        {
                            type: 'registration_certificate',
                            fileId: new mongoose_1.default.Types.ObjectId().toString(),
                            filename: 'helping_hands_registration.pdf'
                        },
                        {
                            type: 'tax_exemption',
                            fileId: new mongoose_1.default.Types.ObjectId().toString(),
                            filename: 'helping_hands_tax_exemption.pdf'
                        }
                    ],
                    verificationStatus: 'pending',
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
                            fileId: new mongoose_1.default.Types.ObjectId().toString(),
                            filename: 'care_for_all_registration.pdf'
                        },
                        {
                            type: 'pan_card',
                            fileId: new mongoose_1.default.Types.ObjectId().toString(),
                            filename: 'care_for_all_pan.pdf'
                        }
                    ],
                    verificationStatus: 'pending',
                    pickupService: false,
                    serviceRadius: 10,
                    description: 'Focused on healthcare and education initiatives for rural and urban poor.'
                }
            ];
            await models_1.NGO.insertMany(ngoOrganizations);
            console.log('✅ Sample NGO users and organizations created successfully');
        }
        else {
            console.log('ℹ️ NGO users already exist');
        }
    }
    catch (error) {
        console.error('❌ Error seeding sample NGOs:', error);
        throw error;
    }
};
exports.seedSampleNGOs = seedSampleNGOs;
const seedSampleDonations = async () => {
    try {
        const donationCount = await models_1.Donation.countDocuments();
        if (donationCount === 0) {
            const donors = await models_1.User.find({ role: 'donor' }).limit(2);
            if (donors.length > 0) {
                const sampleDonations = [
                    {
                        donorId: donors[0]._id,
                        title: 'Fresh Vegetables and Fruits',
                        description: 'Surplus vegetables and fruits from our garden. Good quality and fresh.',
                        category: 'food',
                        quantity: '10 kg mixed vegetables, 5 kg fruits',
                        images: [],
                        location: {
                            address: '123 MG Road, Bangalore, Karnataka 560001',
                            coordinates: {
                                lat: 12.9716,
                                lng: 77.5946
                            }
                        },
                        pickupOption: 'both',
                        foodExpiry: new Date(Date.now() + 6 * 60 * 60 * 1000),
                        status: 'available',
                        urgency: 'high'
                    },
                    {
                        donorId: donors[0]._id,
                        title: 'Winter Clothing Collection',
                        description: 'Gently used winter clothes including jackets, sweaters, and blankets.',
                        category: 'clothing',
                        quantity: '20 pieces of clothing',
                        images: [],
                        location: {
                            address: '123 MG Road, Bangalore, Karnataka 560001',
                            coordinates: {
                                lat: 12.9716,
                                lng: 77.5946
                            }
                        },
                        pickupOption: 'pickup',
                        status: 'available',
                        urgency: 'medium'
                    }
                ];
                if (donors.length > 1) {
                    sampleDonations.push({
                        donorId: donors[1]._id,
                        title: 'Educational Books and Stationery',
                        description: 'Collection of textbooks, notebooks, and stationery items for school children.',
                        category: 'books',
                        quantity: '50 books, 100 notebooks, stationery items',
                        images: [],
                        location: {
                            address: '456 Brigade Road, Bangalore, Karnataka 560025',
                            coordinates: {
                                lat: 12.9698,
                                lng: 77.6205
                            }
                        },
                        pickupOption: 'both',
                        status: 'available',
                        urgency: 'medium'
                    });
                }
                await models_1.Donation.insertMany(sampleDonations);
                console.log('✅ Sample donations created successfully');
            }
            else {
                console.log('⚠️ No donor users found, skipping donation seeding');
            }
        }
        else {
            console.log('ℹ️ Donations already exist');
        }
    }
    catch (error) {
        console.error('❌ Error seeding sample donations:', error);
        throw error;
    }
};
exports.seedSampleDonations = seedSampleDonations;
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        await (0, exports.seedAdminUser)();
        await (0, exports.seedSampleDonors)();
        await (0, exports.seedSampleNGOs)();
        await (0, exports.seedSampleDonations)();
        console.log('✅ Database seeding completed successfully');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
const clearDatabase = async () => {
    try {
        console.log('🗑️ Clearing database...');
        await models_1.User.deleteMany({});
        await models_1.NGO.deleteMany({});
        await models_1.Donation.deleteMany({});
        console.log('✅ Database cleared successfully');
    }
    catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
};
exports.clearDatabase = clearDatabase;
//# sourceMappingURL=seedData.js.map