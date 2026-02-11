require('dotenv').config();
const mongoose = require('mongoose');
const Puja = require('../src/models/Puja');
const Pujari = require('../src/models/Pujari');
const Admin = require('../src/models/Admin');
const PujaItemTemplate = require('../src/models/PujaItemTemplate');
const env = require('../src/config/env');

const MONGODB_URI = env.MONGODB_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const shouldReset = process.argv.includes('--reset');
    if (shouldReset) {
      console.log('Resetting database...');
      await Puja.deleteMany({});
      await Pujari.deleteMany({});
      await Admin.deleteMany({});
      await PujaItemTemplate.deleteMany({});
      console.log('Database cleared.');
    }

    // ========================================
    // SEED PUJAS
    // ========================================
    const existingPujas = await Puja.countDocuments();
    if (existingPujas > 0 && !shouldReset) {
      console.log(`Pujas already seeded (${existingPujas} found). Skipping...`);
    } else {
      const pujas = [
        // BOOKABLE PUJAS
        {
          name: 'Archana',
          slug: 'archana',
          description: 'Archana is a special worship ritual where the devotee\'s name and birth star are chanted along with the 108 or 1008 names of the deity. It is one of the most common and accessible puja forms, ideal for seeking divine blessings for health, prosperity, and well-being.',
          shortDescription: 'Sacred name chanting ritual for divine blessings and well-being',
          category: 'general',
          pujaType: 'bookable',
          duration: '30 minutes',
          durationMinutes: 30,
          basePrice: 501,
          whatsIncluded: ['Pandit ji for puja', 'Mantra chanting', 'Prasad distribution', 'Aarti'],
          requiresItems: 'optional',
          displayOrder: 1,
        },
        {
          name: 'Abhishekam',
          slug: 'abhishekam',
          description: 'Abhishekam is a sacred bathing ritual performed on the deity\'s idol using milk, water, honey, curd, and other holy substances. This powerful ceremony purifies the atmosphere and brings spiritual energy, prosperity, and divine grace to the devotee\'s home.',
          shortDescription: 'Sacred bathing ritual of the deity for purification and prosperity',
          category: 'general',
          pujaType: 'bookable',
          duration: '1 hour',
          durationMinutes: 60,
          basePrice: 1501,
          whatsIncluded: ['Pandit ji for puja', 'Abhishekam materials', 'Mantra chanting', 'Prasad', 'Aarti'],
          requiresItems: 'yes',
          displayOrder: 2,
        },
        {
          name: 'Hanuman Puja',
          slug: 'hanuman-puja',
          description: 'Hanuman Puja is dedicated to Lord Hanuman, the embodiment of strength, devotion, and courage. This puja helps remove obstacles, ward off evil influences, and bring courage and stability. Especially recommended on Tuesdays and Saturdays for maximum benefit.',
          shortDescription: 'Worship of Lord Hanuman for strength, courage, and obstacle removal',
          category: 'devotional',
          pujaType: 'bookable',
          duration: '1.5 hours',
          durationMinutes: 90,
          basePrice: 2101,
          whatsIncluded: ['Pandit ji for puja', 'Hanuman Chalisa recitation', 'Sindoor offering', 'Prasad', 'Aarti', 'Puja samagri'],
          requiresItems: 'yes',
          displayOrder: 3,
        },
        {
          name: 'Sai Baba Puja',
          slug: 'sai-baba-puja',
          description: 'Sai Baba Puja is a devotional ceremony honoring Shirdi Sai Baba, who taught the importance of love, forgiveness, and charity. This puja promotes inner peace, harmony in relationships, and helps overcome difficulties in life. Suitable for devotees of all faiths.',
          shortDescription: 'Devotional ceremony for peace, harmony, and spiritual guidance',
          category: 'devotional',
          pujaType: 'bookable',
          duration: '1 hour',
          durationMinutes: 60,
          basePrice: 1501,
          whatsIncluded: ['Pandit ji for puja', 'Sai Satcharitra parayana', 'Dhoop aarti', 'Prasad', 'Udi distribution'],
          requiresItems: 'yes',
          displayOrder: 4,
        },
        {
          name: 'Navagraha Shanti Puja',
          slug: 'navagraha-shanti-puja',
          description: 'Navagraha Shanti Puja is performed to pacify the nine celestial bodies (planets) and reduce their malefic effects. This general shanti puja brings balance, removes planetary doshas, and improves overall fortune in career, health, and relationships.',
          shortDescription: 'Planetary peace ceremony to balance cosmic influences',
          category: 'shanti',
          pujaType: 'bookable',
          duration: '2 hours',
          durationMinutes: 120,
          basePrice: 3501,
          whatsIncluded: ['Pandit ji for puja', 'Navagraha mantra jaap', 'Havan', 'Prasad', 'Aarti', 'Full puja samagri'],
          requiresItems: 'yes',
          displayOrder: 5,
        },
        {
          name: 'Dhanvantari Puja',
          slug: 'dhanvantari-puja',
          description: 'Dhanvantari Puja is dedicated to Lord Dhanvantari, the divine physician and god of Ayurveda. This puja is highly recommended for those facing health issues or seeking good health for their family. It invokes healing energies and promotes physical and mental well-being.',
          shortDescription: 'Health and healing puja dedicated to the divine physician',
          category: 'health',
          pujaType: 'bookable',
          duration: '1.5 hours',
          durationMinutes: 90,
          basePrice: 2501,
          whatsIncluded: ['Pandit ji for puja', 'Dhanvantari mantra jaap', 'Ayurvedic offerings', 'Havan', 'Prasad', 'Aarti'],
          requiresItems: 'yes',
          displayOrder: 6,
        },
        {
          name: 'Shanti Homam',
          slug: 'shanti-homam',
          description: 'Shanti Homam is a sacred fire ceremony performed to bring peace, prosperity, and harmony. The fire ritual purifies the environment, removes negative energies, and invites divine blessings. This homam is ideal for new beginnings, resolving family conflicts, or overcoming a period of difficulty.',
          shortDescription: 'Sacred fire ceremony for peace, prosperity, and harmony',
          category: 'homam',
          pujaType: 'bookable',
          duration: '2.5 hours',
          durationMinutes: 150,
          basePrice: 5001,
          whatsIncluded: ['Experienced Pandit ji', 'Havan kund setup', 'All homam samagri', 'Ghee & sacred herbs', 'Mantra chanting', 'Prasad', 'Aarti'],
          requiresItems: 'yes',
          displayOrder: 7,
        },
        // COMING SOON PUJAS (Muhurat Required)
        {
          name: 'Griha Pravesh',
          slug: 'griha-pravesh',
          description: 'Griha Pravesh is the sacred house-warming ceremony performed when entering a new home. This ritual purifies the new dwelling, invites positive energies, and ensures prosperity and happiness for the family. Requires muhurat (auspicious timing) calculation.',
          shortDescription: 'Sacred house-warming ceremony for your new home',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '3-4 hours',
          durationMinutes: 210,
          basePrice: 7501,
          whatsIncluded: ['To be customized based on muhurat'],
          requiresItems: 'yes',
          displayOrder: 10,
        },
        {
          name: 'Bhoomi Puja',
          slug: 'bhoomi-puja',
          description: 'Bhoomi Puja is the ground-breaking ceremony performed before starting construction. It seeks blessings from Mother Earth and Vastu Purusha for a safe, timely, and prosperous construction. An essential ritual for any new building project.',
          shortDescription: 'Ground-breaking ceremony before construction begins',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '2-3 hours',
          durationMinutes: 150,
          basePrice: 5501,
          whatsIncluded: ['To be customized based on muhurat'],
          requiresItems: 'yes',
          displayOrder: 11,
        },
        {
          name: 'Naamkaran',
          slug: 'naamkaran',
          description: 'Naamkaran is the Hindu naming ceremony for a newborn baby. This beautiful tradition is performed on an auspicious day to officially name the child, seeking blessings from the divine for the child\'s health, prosperity, and bright future.',
          shortDescription: 'Traditional naming ceremony for your newborn',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '1.5-2 hours',
          durationMinutes: 105,
          basePrice: 3501,
          whatsIncluded: ['To be customized based on muhurat'],
          requiresItems: 'yes',
          displayOrder: 12,
        },
        {
          name: 'Mundan Ceremony',
          slug: 'mundan-ceremony',
          description: 'Mundan (Chudakarana) is the first head-shaving ceremony of a child, typically performed between the first and third year. This sanskar is believed to cleanse the child of past life karma and promote healthy hair growth and overall well-being.',
          shortDescription: 'First head-shaving ceremony for your child\'s well-being',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '1.5-2 hours',
          durationMinutes: 105,
          basePrice: 3001,
          whatsIncluded: ['To be customized based on muhurat'],
          requiresItems: 'yes',
          displayOrder: 13,
        },
        {
          name: 'Wedding Puja',
          slug: 'wedding-puja',
          description: 'Wedding Puja encompasses the complete set of Hindu marriage rituals including Ganesh Puja, Mandap Puja, Kanyadaan, Saptapadi, and more. Our experienced pandits ensure every ritual is performed with proper Vedic traditions.',
          shortDescription: 'Complete Hindu wedding ceremony with full Vedic rituals',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '4-6 hours',
          durationMinutes: 300,
          basePrice: 15001,
          whatsIncluded: ['To be customized based on requirements'],
          requiresItems: 'yes',
          displayOrder: 14,
        },
        {
          name: 'Business Opening Puja',
          slug: 'business-opening-puja',
          description: 'Business Opening Puja is performed to invoke divine blessings when starting a new business or opening a new office/shop. This ceremony ensures prosperity, removes obstacles, and sets a positive foundation for business success.',
          shortDescription: 'Auspicious ceremony for new business venture success',
          category: 'muhurat',
          pujaType: 'coming_soon',
          duration: '2-3 hours',
          durationMinutes: 150,
          basePrice: 5001,
          whatsIncluded: ['To be customized based on muhurat'],
          requiresItems: 'yes',
          displayOrder: 15,
        },
      ];

      const createdPujas = await Puja.insertMany(pujas);
      console.log(`✅ ${createdPujas.length} pujas seeded successfully`);

      // Seed item templates for bookable pujas
      const bookablePujas = createdPujas.filter((p) => p.pujaType === 'bookable');
      const itemTemplates = [
        {
          puja: bookablePujas.find((p) => p.slug === 'archana')._id,
          templateName: 'Default Archana Items',
          isDefault: true,
          items: [
            { name: 'Flowers', quantity: '1 bundle', notes: 'Fresh flowers' },
            { name: 'Kumkum', quantity: '1 packet', notes: '' },
            { name: 'Turmeric', quantity: '50 grams', notes: '' },
            { name: 'Incense sticks', quantity: '1 packet', notes: '' },
            { name: 'Camphor', quantity: '1 packet', notes: '' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'abhishekam')._id,
          templateName: 'Default Abhishekam Items',
          isDefault: true,
          items: [
            { name: 'Milk', quantity: '1 litre', notes: 'Full cream' },
            { name: 'Curd', quantity: '250 grams', notes: '' },
            { name: 'Honey', quantity: '100 ml', notes: '' },
            { name: 'Sugar', quantity: '100 grams', notes: '' },
            { name: 'Panchamrit mix', quantity: '1 set', notes: '' },
            { name: 'Flowers', quantity: '2 bundles', notes: 'Fresh' },
            { name: 'Sandalwood paste', quantity: '1 packet', notes: '' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'hanuman-puja')._id,
          templateName: 'Default Hanuman Puja Items',
          isDefault: true,
          items: [
            { name: 'Sindoor', quantity: '100 grams', notes: 'Must be bright red' },
            { name: 'Jasmine oil', quantity: '100 ml', notes: '' },
            { name: 'Betel leaves', quantity: '11 pieces', notes: '' },
            { name: 'Laddoo', quantity: '5 pieces', notes: 'Bundi laddoo' },
            { name: 'Flowers (red)', quantity: '1 bundle', notes: 'Red flowers preferred' },
            { name: 'Ghee', quantity: '250 ml', notes: 'Pure cow ghee' },
            { name: 'Incense sticks', quantity: '1 packet', notes: '' },
            { name: 'Camphor', quantity: '1 packet', notes: '' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'sai-baba-puja')._id,
          templateName: 'Default Sai Baba Puja Items',
          isDefault: true,
          items: [
            { name: 'Udi (sacred ash)', quantity: '50 grams', notes: '' },
            { name: 'Flowers', quantity: '1 bundle', notes: 'White flowers preferred' },
            { name: 'Dhoop', quantity: '1 packet', notes: '' },
            { name: 'Incense sticks', quantity: '1 packet', notes: 'Sandalwood' },
            { name: 'Prasad items', quantity: '1 set', notes: '' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'navagraha-shanti-puja')._id,
          templateName: 'Default Navagraha Shanti Items',
          isDefault: true,
          items: [
            { name: 'Navagraha set', quantity: '1 set', notes: '9 types of grains' },
            { name: 'Navagraha flowers', quantity: '9 types', notes: '' },
            { name: 'Navagraha cloth', quantity: '9 pieces', notes: '9 colors' },
            { name: 'Oil lamps', quantity: '9 pieces', notes: '' },
            { name: 'Ghee', quantity: '500 ml', notes: '' },
            { name: 'Samagri set', quantity: '1 set', notes: 'Complete havan samagri' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'dhanvantari-puja')._id,
          templateName: 'Default Dhanvantari Puja Items',
          isDefault: true,
          items: [
            { name: 'Tulsi leaves', quantity: '1 bundle', notes: 'Fresh holy basil' },
            { name: 'Amla', quantity: '5 pieces', notes: '' },
            { name: 'Neem leaves', quantity: '1 bundle', notes: '' },
            { name: 'Ghee', quantity: '250 ml', notes: '' },
            { name: 'Honey', quantity: '100 ml', notes: '' },
            { name: 'Havan samagri', quantity: '1 set', notes: '' },
          ],
        },
        {
          puja: bookablePujas.find((p) => p.slug === 'shanti-homam')._id,
          templateName: 'Default Shanti Homam Items',
          isDefault: true,
          items: [
            { name: 'Havan kund', quantity: '1', notes: 'Medium size' },
            { name: 'Mango wood', quantity: '2 kg', notes: 'Dried' },
            { name: 'Ghee', quantity: '1 litre', notes: 'Pure cow ghee' },
            { name: 'Havan samagri', quantity: '500 grams', notes: 'Premium mix' },
            { name: 'Sacred herbs', quantity: '1 set', notes: '21 types' },
            { name: 'Camphor', quantity: '2 packets', notes: '' },
            { name: 'Flowers', quantity: '2 bundles', notes: '' },
            { name: 'Coconut', quantity: '2 pieces', notes: 'With husk' },
          ],
        },
      ];

      await PujaItemTemplate.insertMany(itemTemplates);
      console.log(`✅ ${itemTemplates.length} item templates seeded`);
    }

    // ========================================
    // SEED PUJARIS
    // ========================================
    const existingPujaris = await Pujari.countDocuments();
    if (existingPujaris > 0 && !shouldReset) {
      console.log(`Pujaris already seeded (${existingPujaris} found). Skipping...`);
    } else {
      const allPujas = await Puja.find({ pujaType: 'bookable' });

      const pujaris = [
        {
          name: 'Pandit Ramesh Sharma',
          mobile: '9876543210',
          email: 'ramesh.sharma@example.com',
          experience: '15+ years',
          languages: ['Hindi', 'Sanskrit', 'Telugu'],
          supportedPujas: allPujas.map((p) => p._id),
          serviceAreas: [
            { city: 'Hyderabad', pincodes: ['500001', '500002', '500003', '500004', '500005', '500010', '500020', '500030', '500040', '500050'] },
          ],
          notes: 'Senior pandit, available all days',
        },
        {
          name: 'Pandit Suresh Iyer',
          mobile: '9876543211',
          email: 'suresh.iyer@example.com',
          experience: '10+ years',
          languages: ['Kannada', 'Sanskrit', 'Tamil', 'English'],
          supportedPujas: allPujas.slice(0, 5).map((p) => p._id),
          serviceAreas: [
            { city: 'Bangalore', pincodes: ['560001', '560002', '560003', '560004', '560005', '560010', '560020', '560030', '560040', '560050'] },
          ],
          notes: 'Specializes in Vedic rituals',
        },
        {
          name: 'Pandit Arun Tiwari',
          mobile: '9876543212',
          email: 'arun.tiwari@example.com',
          experience: '20+ years',
          languages: ['Hindi', 'Marathi', 'Sanskrit'],
          supportedPujas: allPujas.map((p) => p._id),
          serviceAreas: [
            { city: 'Mumbai', pincodes: ['400001', '400002', '400003', '400004', '400005', '400010', '400020', '400030', '400040', '400050'] },
          ],
          notes: 'Expert in Homam and fire rituals',
        },
      ];

      const createdPujaris = await Pujari.insertMany(pujaris);
      console.log(`✅ ${createdPujaris.length} pujaris seeded successfully`);
    }

    // ========================================
    // SEED ADMIN
    // ========================================
    const existingAdmin = await Admin.countDocuments();
    if (existingAdmin > 0 && !shouldReset) {
      console.log(`Admin already seeded (${existingAdmin} found). Skipping...`);
    } else {
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@bookmypujari.com',
        passwordHash: 'admin123',
        role: 'super_admin',
      });
      await admin.save();
      console.log('✅ Admin user seeded');
      console.log('   Email: admin@bookmypujari.com');
      console.log('   Password: admin123');
    }

    console.log('\n🎉 Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
