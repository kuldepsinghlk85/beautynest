import { PrismaClient, RoleType, Gender, KycStatus, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BeautyNest Database for Varanasi (Kashi)...');

  // 1. Clean existing records
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusLog.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.gPSTracking.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.address.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.beauticianSkill.deleteMany();
  await prisma.beautician.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.serviceImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.oTPVerification.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 2. Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Full administrative access',
    },
  });

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'BeautyNest Admin',
      email: 'admin@beautynest.in',
      phoneNumber: '+919999900000',
      passwordHash,
      role: RoleType.ADMIN,
      gender: Gender.FEMALE,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
  });

  await prisma.roleAssignment.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 4. Create Service Categories (From Spreadsheet)
  const categoriesData = [
    {
      name: 'Facial & Clean Up',
      slug: 'facial',
      description: 'Glow rituals, deep cleansing, anti-aging, and Korean glass skin care at doorstep in Varanasi',
      iconUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      displayOrder: 1,
    },
    {
      name: 'Waxing Services',
      slug: 'waxing',
      description: 'Hygienic cartridge wax, full body waxing, Rica Italian wax & sensitive skin care',
      iconUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
      displayOrder: 2,
    },
    {
      name: 'Bleach & D-Tan',
      slug: 'bleach-dtan',
      description: 'Sun tan removal, Sara oxy de-tan, Raaga body pack, and gold radiance bleach',
      iconUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80',
      displayOrder: 3,
    },
    {
      name: 'Hair Care & Spa',
      slug: 'hair-care',
      description: 'L’Oreal hair spa, keratin protein straightening, botoplex botox and root touchup',
      iconUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&q=80',
      displayOrder: 4,
    },
    {
      name: 'Mani-Pedi & Nails',
      slug: 'manicure-pedicure',
      description: 'Deluxe rose petal mani-pedi, crystal spa jelly pedicure, and gel nail extensions',
      iconUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&q=80',
      displayOrder: 5,
    },
    {
      name: 'Threading & Grooming',
      slug: 'threading',
      description: 'Sterilized organic eyebrow threading, upper lip, chin and full face grooming',
      iconUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
      displayOrder: 6,
    },
    {
      name: 'Body Spa & Polishing',
      slug: 'body-spa',
      description: 'Swedish full body massage, deep tissue therapy, and sea salt glow body polishing',
      iconUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
      displayOrder: 7,
    },
    {
      name: 'Bridal & Party Makeup',
      slug: 'bridal-makeup',
      description: 'Royal Kashi HD bridal airbrush makeup, sangeet glam, and lehenga draping',
      iconUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
      displayOrder: 8,
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.serviceCategory.create({ data: cat });
    createdCategories[cat.slug] = created;
  }

  // 5. Create Services
  const servicesData = [
    {
      categorySlug: 'facial',
      name: 'Korean Glass Skin Hydra Ritual',
      slug: 'korean-facial-ritual',
      shortDesc: 'Multi-step glass skin routine with peptide ampoules and hydration mask',
      about: 'The ultimate Korean glass skin doorstep treatment in Varanasi. Restores deep skin radiance, detoxifies pores, and delivers intense cellular hydration.',
      benefits: ['Instant dewy glow', 'Deep pore detoxification', 'Collagen boost', 'Lymphatic face sculpting'],
      processSteps: ['Double cleanse', 'Enzyme peel', 'Essence infusion', 'Sheet mask with jade roller', 'Ceramide barrier finish'],
      price: 899.00,
      originalPrice: 1699.00,
      discountPercent: 47,
      durationMinutes: 65,
      isBestseller: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 11563,
      imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=800&q=80',
    },
    {
      categorySlug: 'facial',
      name: 'O3+ Whitening & Brightening Facial',
      slug: 'o3-whitening-brightening',
      shortDesc: 'Award-winning O3+ professional brightening facial with peel-off rubber algae mask',
      about: 'Authentic 6-step O3+ Whitening Facial kit applied by certified specialists.',
      benefits: ['Reduces dark spots & blemishes', 'Original sealed single-use kit', 'Cooling algae rubber mask'],
      processSteps: ['O3+ Cleanser', 'Micro-derma scrub', 'Whitening cream massage', 'Serum infusion', 'Peel-off algae mask'],
      price: 1499.00,
      originalPrice: 2499.00,
      discountPercent: 40,
      durationMinutes: 75,
      isBestseller: true,
      isFeatured: true,
      rating: 4.95,
      reviewCount: 9450,
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    },
    {
      categorySlug: 'waxing',
      name: 'Full Body Waxing with Brightening Serum',
      slug: 'full-body-waxing',
      shortDesc: 'Painless cartridge waxing for full arms, underarms, and full legs with post-wax soothing oil',
      about: 'Ultra-hygienic disposable waxing session using imported strip wax. Leaves skin satin smooth with no redness.',
      benefits: ['99% painless technique', 'Prevents ingrown hair', 'Includes organic after-wax calming elixir'],
      processSteps: ['Skin sanitation', 'Pre-wax soothing powder', 'Precision wax pull', 'Post-wax chamomile oil massage'],
      price: 999.00,
      originalPrice: 1999.00,
      discountPercent: 50,
      durationMinutes: 75,
      isBestseller: true,
      isFeatured: true,
      rating: 4.85,
      reviewCount: 9140,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    },
    {
      categorySlug: 'hair-care',
      name: 'L’Oreal Mythic Oil Hair Spa Advanced Repair',
      slug: 'hair-spa-repair',
      shortDesc: 'Deep conditioning argan oil masque, scalp ozone steam & 20-min acupressure massage',
      about: 'Revives chemically treated, dry, and frizzy hair. Restores shine and relaxes tired muscles.',
      benefits: ['Intense frizz control', 'Scalp micro-circulation boost', 'Deep stress relief'],
      processSteps: ['Scalp analysis', 'Cleansing shampoo', 'Keratin repair mask', 'Warm steam session', 'Blow dry styling'],
      price: 789.00,
      originalPrice: 1499.00,
      discountPercent: 47,
      durationMinutes: 60,
      isBestseller: true,
      isFeatured: true,
      rating: 4.93,
      reviewCount: 8250,
      imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80',
    },
    {
      categorySlug: 'bleach-dtan',
      name: 'Sara Oxy D-Tan Face & Neck Therapy',
      slug: 'sara-oxy-dtan-face',
      shortDesc: 'Instant sun-tan removal with Sara botanical oxy D-Tan mask and vitamin C serum',
      about: 'Removes stubborn sun-tanning caused by outdoor sun exposure in Varanasi.',
      benefits: ['Instantly clears 1 to 2 shades of tan', 'Gentle on sensitive skin', 'Infused with eucalyptus and mint'],
      processSteps: ['Cleansing', 'D-Tan application', '15-min deep action', 'Wet sponge wipe & SPF moisturize'],
      price: 399.00,
      originalPrice: 699.00,
      discountPercent: 43,
      durationMinutes: 30,
      isBestseller: true,
      isFeatured: true,
      rating: 4.88,
      reviewCount: 7600,
      imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    },
    {
      categorySlug: 'bridal-makeup',
      name: 'Royal Kashi HD Bridal Airbrush Makeup + Draping',
      slug: 'bridal-makeup-hd',
      shortDesc: 'Luxury HD waterproof wedding makeup, mink lashes, hairstyling and royal dupatta draping',
      about: 'Top-tier bridal transformation crafted by certified master artists using MAC, Huda Beauty, and Dior cosmetics.',
      benefits: ['Waterproof for 16 hours', 'Customized to lehenga & skin tone', 'Includes luxury lashes & accessories'],
      processSteps: ['Skin prep', 'HD contouring', 'Eye artistry & lashes', 'Intricate hairstyling', 'Royal dupatta setting'],
      price: 4999.00,
      originalPrice: 7999.00,
      discountPercent: 38,
      durationMinutes: 120,
      isBestseller: true,
      isFeatured: true,
      rating: 4.99,
      reviewCount: 3810,
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    },
  ];

  const createdServices: Record<string, any> = {};
  for (const s of servicesData) {
    const cat = createdCategories[s.categorySlug];
    const service = await prisma.service.create({
      data: {
        categoryId: cat.id,
        name: s.name,
        slug: s.slug,
        shortDesc: s.shortDesc,
        about: s.about,
        benefits: s.benefits,
        processSteps: s.processSteps,
        price: s.price,
        originalPrice: s.originalPrice,
        discountPercent: s.discountPercent,
        durationMinutes: s.durationMinutes,
        isBestseller: s.isBestseller,
        isFeatured: s.isFeatured,
        rating: s.rating,
        reviewCount: s.reviewCount,
        images: {
          create: [{ imageUrl: s.imageUrl, isPrimary: true }],
        },
      },
    });
    createdServices[s.slug] = service;
  }

  // 6. Create 20 Beauticians situated across Varanasi Areas
  const varanasiBeauticiansData = [
    { name: 'Sunita Sharma', phone: '+919839012341', area: 'Sigra', exp: 8, rating: 4.95, jobs: 1240, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
    { name: 'Pooja Maurya', phone: '+919839012342', area: 'Lanka (BHU)', exp: 6, rating: 4.92, jobs: 890, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
    { name: 'Anjali Gupta', phone: '+919839012343', area: 'Assi Ghat', exp: 5, rating: 4.88, jobs: 640, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    { name: 'Neha Pandey', phone: '+919839012344', area: 'Godowlia', exp: 7, rating: 4.96, jobs: 1120, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
    { name: 'Rekha Vishwakarma', phone: '+919839012345', area: 'Bhelupur', exp: 9, rating: 4.98, jobs: 1450, photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80' },
    { name: 'Priya Singh', phone: '+919839012346', area: 'Varanasi Cantt', exp: 4, rating: 4.85, jobs: 480, photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
    { name: 'Archana Yadav', phone: '+919839012347', area: 'Shivpur', exp: 6, rating: 4.89, jobs: 720, photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80' },
    { name: 'Kavita Mishra', phone: '+919839012348', area: 'Mahmoorganj', exp: 8, rating: 4.94, jobs: 1050, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
    { name: 'Shalini Verma', phone: '+919839012349', area: 'Orderly Bazar', exp: 5, rating: 4.86, jobs: 530, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
    { name: 'Suman Srivastava', phone: '+919839012350', area: 'Pandeypur', exp: 7, rating: 4.91, jobs: 910, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
    { name: 'Ritu Tripathi', phone: '+919839012351', area: 'Sarnath', exp: 6, rating: 4.90, jobs: 770, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80' },
    { name: 'Poonam Tiwari', phone: '+919839012352', area: 'Durgakund', exp: 10, rating: 4.99, jobs: 1620, photo: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&q=80' },
    { name: 'Mamta Jaiswal', phone: '+919839012353', area: 'Luxa', exp: 4, rating: 4.82, jobs: 410, photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80' },
    { name: 'Vandana Patel', phone: '+919839012354', area: 'Rathyatra', exp: 7, rating: 4.93, jobs: 990, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
    { name: 'Babita Dubey', phone: '+919839012355', area: 'Maldahiya', exp: 5, rating: 4.87, jobs: 620, photo: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80' },
    { name: 'Preeti Rawat', phone: '+919839012356', area: 'Chowk', exp: 6, rating: 4.89, jobs: 810, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80' },
    { name: 'Deepa Sen', phone: '+919839012357', area: 'Nadesar', exp: 4, rating: 4.83, jobs: 460, photo: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&q=80' },
    { name: 'Meena Chaurasia', phone: '+919839012358', area: 'Paharia', exp: 8, rating: 4.95, jobs: 1180, photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80' },
    { name: 'Swati Agrawal', phone: '+919839012359', area: 'Ramnagar', exp: 5, rating: 4.88, jobs: 670, photo: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=400&q=80' },
    { name: 'Garima Pathak', phone: '+919839012360', area: 'Dashashwamedh', exp: 7, rating: 4.92, jobs: 940, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
  ];

  const createdBeauticians: any[] = [];
  for (let i = 0; i < varanasiBeauticiansData.length; i++) {
    const b = varanasiBeauticiansData[i];
    const bUser = await prisma.user.create({
      data: {
        fullName: b.name,
        phoneNumber: b.phone,
        email: `${b.name.toLowerCase().replace(/\s+/g, '.')}@beautynest.in`,
        role: RoleType.BEAUTICIAN,
        gender: Gender.FEMALE,
        avatarUrl: b.photo,
      },
    });

    const beautician = await prisma.beautician.create({
      data: {
        userId: bUser.id,
        bio: `Certified doorstep salon expert in ${b.area}, Varanasi with ${b.exp} years of specialized salon experience.`,
        experienceYears: b.exp,
        rating: b.rating,
        totalRatings: Math.round(b.jobs * 0.4),
        isOnline: i < 15,
        isVerified: true,
        kycStatus: KycStatus.APPROVED,
        currentLat: 25.3176 + (i * 0.003 - 0.03),
        currentLng: 82.9739 + (i * 0.003 - 0.03),
        baseCity: 'Varanasi',
        area: b.area,
        totalJobs: b.jobs,
        completionRate: 99.2,
        skills: {
          create: [
            { categoryId: createdCategories['facial'].id, proficiency: 5 },
            { categoryId: createdCategories['waxing'].id, proficiency: 5 },
            { categoryId: createdCategories['hair-care'].id, proficiency: 5 },
          ],
        },
      },
    });
    createdBeauticians.push(beautician);
  }

  // 7. Create Customer User (Priya Verma in Sigra, Varanasi)
  const customerUser = await prisma.user.create({
    data: {
      fullName: 'Priya Verma',
      phoneNumber: '+919876543210',
      email: 'priya.verma@example.com',
      role: RoleType.CUSTOMER,
      gender: Gender.FEMALE,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
  });

  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      city: 'Varanasi',
      referralCode: 'KASHI2026',
      totalBookings: 5,
      totalSpent: 4890.00,
      wallet: {
        create: {
          balance: 200.00,
        },
      },
    },
  });

  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      title: 'Home',
      addressLine1: 'Flat 302, Ganga Heights, Near Sigra Stadium',
      addressLine2: 'Sigra',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      postalCode: '221010',
      latitude: 25.3176,
      longitude: 82.9739,
      isDefault: true,
    },
  });

  // 8. Create Sample Booking in Varanasi
  await prisma.booking.create({
    data: {
      bookingNumber: 'BK-6887',
      customerId: customer.id,
      beauticianId: createdBeauticians[0].id, // Sunita Sharma
      addressId: address.id,
      status: BookingStatus.ASSIGNED,
      scheduledDate: new Date(),
      scheduledTimeSlot: '11:30 AM - 12:30 PM',
      serviceStartOtp: '4821',
      subTotal: 899.00,
      discountAmount: 0.00,
      taxAmount: 50.00,
      totalAmount: 949.00,
      specialNotes: 'Please carry O3+ kit and herbal peel for doorstep facial in Sigra.',
      bookingServices: {
        create: [
          {
            serviceId: createdServices['korean-facial-ritual'].id,
            unitPrice: 899.00,
            quantity: 1,
            totalPrice: 899.00,
          },
        ],
      },
      payment: {
        create: {
          amount: 949.00,
          method: PaymentMethod.RAZORPAY_UPI,
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
        },
      },
      statusLogs: {
        create: [
          { status: BookingStatus.PENDING, note: 'Booking created by customer in Varanasi' },
          { status: BookingStatus.ASSIGNED, note: 'Auto-assigned to Sunita Sharma (Sigra, Varanasi)' },
        ],
      },
    },
  });

  // 9. Create Promotional Coupons for Varanasi
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME200',
        title: 'Flat ₹200 Off on First Varanasi Booking',
        description: 'Exclusive welcome voucher for ladies in Varanasi',
        discountPercent: 50,
        maxDiscount: 200.00,
        minOrderValue: 499.00,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        isActive: true,
      },
      {
        code: 'KASHIGLOW',
        title: '25% Off on Korean Facials & Hair Spa',
        description: 'Get radiant festive glow delivered at home in Varanasi',
        discountPercent: 25,
        maxDiscount: 350.00,
        minOrderValue: 799.00,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        isActive: true,
      },
    ],
  });

  console.log(`✅ BeautyNest Varanasi Database seeded successfully with 20 Beauticians and full catalog!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
