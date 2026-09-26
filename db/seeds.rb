# frozen_string_literal: true

# =============================================================================
# Seed Strategy: find_or_initialize_by so db:seed is idempotent on re-runs.
# =============================================================================

# ── 1. Admin ──────────────────────────────────────────────────────────────────
[
  { email: "admin@beautynest.test", password: "Admin@1234", phone: "+919999999997" },
  { email: "admin@beautynest.internal", password: "Admin@123456", phone: "+919999999996" }
].each do |adm_data|
  admin = User.find_or_initialize_by(email: adm_data[:email])
  admin.assign_attributes(
    name:                  "BeautyNest Admin",
    phone:                 adm_data[:phone],
    password:              adm_data[:password],
    password_confirmation: adm_data[:password],
    role:   "admin",
    status: "active"
  )
  admin.save!
  puts "Admin: #{admin.email}"
end

# ── 1b. Cities ────────────────────────────────────────────────────────────────
cities_data = [
  { name: "Mumbai",    state: "Maharashtra" },
  { name: "Delhi",     state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" },
  { name: "Pune",      state: "Maharashtra" }
]
cities = {}
cities_data.each do |cd|
  city = City.find_or_initialize_by(name: cd[:name])
  city.assign_attributes(state: cd[:state], status: "active")
  city.save!
  cities[cd[:name]] = city
  puts "City: #{city.name}"
end

# ── 2. Workers ────────────────────────────────────────────────────────────────
today_name = Time.current.strftime("%A")
other_days = WorkerProfile::DAYS_OF_WEEK.reject { |d| d.casecmp?(today_name) }

[
  { email: "worker.a@beautynest.test", name: "Priya Beautician", phone: "+919811100011", password: "Worker@1234",
    city: "Mumbai", bio: "Certified beauty expert with 5 years of salon experience.", experience: 5,
    aadhaar_number: "999999999991",
    available_days: WorkerProfile::DAYS_OF_WEEK, # All 7 days -> 🟢 Available Today
    is_available: true,
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },

  { email: "worker.b@beautyconnect.test", name: "Sunita Stylist", phone: "+919811100012", password: "Worker@1234",
    city: "Delhi", bio: "Bridal makeup specialist and hair styling professional.", experience: 7,
    aadhaar_number: "999999999992",
    available_days: ["Monday", "Wednesday", "Friday", today_name].uniq, # Includes today -> 🟢 Available Today
    is_available: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" },

  { email: "worker@beautyconnect.internal", name: "Sunita Worker", phone: "+919811100089", password: "Worker@123456",
    city: "Mumbai", bio: "Master stylist and licensed esthetician.", experience: 6,
    aadhaar_number: "999999999990",
    available_days: ["Monday", "Wednesday", "Friday", today_name].uniq, # Includes today -> 🟢 Available Today
    is_available: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" },

  { email: "worker.b@beautynest.test", name: "Sunita Stylist",   phone: "+919811100013", password: "Worker@1234",
    city: "Delhi",  bio: "Bridal makeup specialist and hair styling professional.",   experience: 7,
    available_days: ["Monday", "Wednesday", "Friday", today_name].uniq, # Includes today -> 🟢 Available Today
    aadhaar_number: "999999999995",
    is_available: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" },
  { email: "worker@beautynest.internal", name: "Sunita Worker", phone: "+919811100088", password: "Worker@123456",
    city: "Mumbai", bio: "Master stylist and licensed esthetician.", experience: 6,
    aadhaar_number: "999999999993",
    available_days: other_days, # Omits today -> 🔴 Unavailable Today (Off Duty)
    is_available: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80" }
].each do |w|
  user = User.find_or_initialize_by(email: w[:email])
  user.assign_attributes(
    name: w[:name], phone: w[:phone],
    password: w[:password], password_confirmation: w[:password],
    role: "worker", status: "active",
    avatar_url: w[:avatar_url]
  )
  user.save!

  city_record = cities[w[:city]]

  # Address record
  Address.find_or_create_by!(user: user, city: w[:city]) do |a|
    a.line1      = "Main Road"
    a.pincode    = "400001"
    a.is_default = true
    a.city_id    = city_record&.id
  end

  # Worker profile
  wp = WorkerProfile.find_or_initialize_by(user: user)
  wp.assign_attributes(
    bio:              w[:bio],
    experience_years: w[:experience],
    is_available:     w[:is_available],
    available_days:   w[:available_days],
    time_slot:        "Full Day (Throughout the Day)",
    city_id:          city_record&.id,
    aadhaar_number:   w[:aadhaar_number]
  )
  wp.save!
  puts "Worker: #{user.email} (Available today: #{wp.available_today? ? 'YES [Green]' : 'NO [Red]'})"
end

worker_a = User.find_by!(email: "worker.a@beautynest.test")
worker_b = User.find_by!(email: "worker.b@beautynest.test")

# ── 3. Customers ──────────────────────────────────────────────────────────────
customers_data = [
  { email: "customer1@example.com", name: "Kavita Sharma",  phone: "+919876500001", city: "Mumbai",    worker: worker_a,
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
  { email: "customer2@example.com", name: "Ananya Gupta",   phone: "+919876500002", city: "Mumbai",    worker: worker_a,
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" },
  { email: "customer3@example.com", name: "Meera Nair",     phone: "+919876500003", city: "Pune",      worker: worker_a,
    avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" },
  { email: "customer4@example.com", name: "Divya Pillai",   phone: "+919876500004", city: "Delhi",     worker: worker_b,
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
  { email: "customer5@example.com", name: "Sneha Kapoor",   phone: "+919876500005", city: "Delhi",     worker: worker_b,
    avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80" },
  { email: "customer6@example.com", name: "Pooja Verma",    phone: "+919876500006", city: "Bangalore", worker: worker_b,
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { email: "customer@beautynest.internal", name: "Ananya Customer", phone: "+919876500079", password: "Customer@123456",
    city: "Mumbai", worker: worker_a,
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" }
]

customers_data.each do |c|
  cust = User.find_or_initialize_by(email: c[:email])
  password = c[:password] || "Password@123"
  cust.assign_attributes(
    name: c[:name], phone: c[:phone],
    password: password, password_confirmation: password,
    role: "customer", status: "active",
    avatar_url: c[:avatar_url]
  )
  cust.save!

  addr = Address.find_or_create_by!(user: cust, city: c[:city]) do |a|
    a.line1      = "Ring Road"
    a.pincode    = "400001"
    a.is_default = true
    a.city_id    = cities[c[:city]]&.id
  end

  booking = Booking.find_or_create_by!(customer: cust, worker: c[:worker]) do |b|
    b.status          = "completed"
    b.scheduled_at    = 2.days.ago
    b.address         = addr
    b.subtotal_amount = 1499.00
    b.total_amount    = 1499.00
  end

  puts "Customer: #{cust.name} (#{cust.email})"
end

# ── 4. Coupon ─────────────────────────────────────────────────────────────────
Coupon.find_or_create_by!(code: "WELCOME20") do |c|
  c.description      = "20% off on first booking"
  c.discount_type    = "percentage"
  c.discount_value   = 20
  c.max_discount     = 500.0
  c.min_order_amount = 500.0
  c.status           = "active"
end
puts "Coupon: WELCOME20"

Coupon.find_or_create_by!(code: "FLAT200") do |c|
  c.description      = "₹200 flat discount on orders above ₹1000"
  c.discount_type    = "flat"
  c.discount_value   = 200
  c.min_order_amount = 1000.0
  c.status           = "active"
end
puts "Coupon: FLAT200"

# ── 5. Categories & Services ──────────────────────────────────────────────────
puts "\nSeeding Categories & Services..."

catalog = [
  {
    name: "Salon for Women", description: "Premium beauty & grooming services tailored for women.",
    featured: true, position: 1,
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    sub_categories: [
      {
        name: "Hair Care", description: "Cuts, colour, and styling by expert stylists.", position: 1,
        image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Hair Cut & Blowdry",    base_price: 499,  duration_minutes: 60,  featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80" },
          { name: "Keratin Treatment",     base_price: 2999, discount_price: 2499, duration_minutes: 120, featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80" },
          { name: "Global Colour",         base_price: 1999, duration_minutes: 90,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80" },
          { name: "Hair Spa & Deep Mask",  base_price: 999,  discount_price: 799,  duration_minutes: 75,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80" }
        ]
      },
      {
        name: "Skin & Facials", description: "Hydrating, brightening and anti-aging facial treatments.", position: 2,
        image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Classic Facial",        base_price: 799,  duration_minutes: 60,  featured: false, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1512290900672-1f48643807a0?auto=format&fit=crop&w=800&q=80" },
          { name: "Gold Facial",           base_price: 1299, discount_price: 999,  duration_minutes: 75,  featured: true, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80" },
          { name: "Tan Removal Treatment", base_price: 999,  duration_minutes: 60,  featured: false, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" },
          { name: "Anti-Ageing Facial",    base_price: 1799, duration_minutes: 90,  featured: false, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80" }
        ]
      },
      {
        name: "Nail Art", description: "Gel, acrylic, and nail art by certified nail artists.", position: 3,
        image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Gel Nail Extensions",   base_price: 1499, discount_price: 1199, duration_minutes: 90,  featured: true, tag: "mani-padi",
            image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80" },
          { name: "French Manicure",       base_price: 599,  duration_minutes: 45,  featured: false, tag: "mani-padi",
            image_url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80" },
          { name: "Nail Art Design",       base_price: 299,  duration_minutes: 30,  featured: false, tag: "mani-padi",
            image_url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80" }
        ]
      }
    ]
  },
  {
    name: "Salon for Men", description: "Classic barbering and modern grooming for men.", featured: true, position: 2,
    image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    sub_categories: [
      {
        name: "Hair & Beard", description: "Precision cuts, shaves and beard styling.", position: 1,
        image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Haircut & Styling",     base_price: 299,  duration_minutes: 30,  featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80" },
          { name: "Beard Trim & Shape",    base_price: 199,  duration_minutes: 20,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80" },
          { name: "Hot Towel Shave",       base_price: 349,  duration_minutes: 40,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" },
          { name: "Haircut + Beard Combo", base_price: 449,  discount_price: 399,  duration_minutes: 45,  featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80" }
        ]
      },
      {
        name: "Men Skin Care", description: "Facials and skin treatments designed for men.", position: 2,
        image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Men Facial",            base_price: 699,  duration_minutes: 60,  featured: false, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1512290900672-1f48643807a0?auto=format&fit=crop&w=800&q=80" },
          { name: "De-Tan Face & Neck",    base_price: 499,  duration_minutes: 45,  featured: false, tag: "facial",
            image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" }
        ]
      }
    ]
  },
  {
    name: "Spa & Wellness", description: "Relax and rejuvenate with holistic spa treatments.", featured: true, position: 3,
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    sub_categories: [
      {
        name: "Body Massages", description: "Swedish, deep tissue and Ayurvedic massages.", position: 1,
        image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Swedish Relaxing Massage", base_price: 1499, duration_minutes: 60,  featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" },
          { name: "Deep Tissue Massage",      base_price: 1799, duration_minutes: 90,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80" },
          { name: "Balinese Massage",         base_price: 1999, discount_price: 1699, duration_minutes: 90,  featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80" },
          { name: "Couple Spa Package",       base_price: 3499, discount_price: 2999, duration_minutes: 120, featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80" }
        ]
      },
      {
        name: "Bridal Packages", description: "Complete bridal beauty packages for your special day.", position: 2,
        image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Bridal Makeup HD",      base_price: 4999, discount_price: 4499, duration_minutes: 180, featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80" },
          { name: "Bridal Saree Draping",  base_price: 999,  duration_minutes: 45,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80" },
          { name: "Pre-Bridal Package",    base_price: 7999, discount_price: 6999, duration_minutes: 300, featured: true, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80" }
        ]
      }
    ]
  },
  {
    name: "Home Cleaning", description: "Professional home cleaning and hygiene services.", featured: false, position: 4,
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    sub_categories: [
      {
        name: "Deep Cleaning", description: "Kitchen, bathroom and full-home deep cleaning.", position: 1,
        image_url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
        services: [
          { name: "Kitchen Deep Clean",    base_price: 1299, duration_minutes: 120, featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
          { name: "Bathroom Sanitisation", base_price: 799,  duration_minutes: 60,  featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
          { name: "Full Home Deep Clean",  base_price: 2999, discount_price: 2499, duration_minutes: 240, featured: false, tag: "korean-glow",
            image_url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80" }
        ]
      }
    ]
  }
]

catalog.each do |cat_data|
  sub_data = cat_data.delete(:sub_categories) || []
  parent = Category.find_or_initialize_by(name: cat_data[:name])
  parent.assign_attributes(cat_data.merge(status: "active"))
  parent.save!
  puts "  Category: #{parent.name}"

  sub_data.each do |sub|
    services_data = sub.delete(:services) || []
    sub.delete(:image_url) # Omit image_url from subcategory
    sub_cat = Subcategory.find_or_initialize_by(name: sub[:name], category: parent)
    sub_cat.assign_attributes(sub.merge(status: "active"))
    sub_cat.save!
    puts "    Subcategory: #{sub_cat.name}"

    services_data.each do |svc|
      service = Service.find_or_initialize_by(name: svc[:name], subcategory: sub_cat)
      svc_attributes = svc.merge(
        status: "active",
        about: svc[:about] || "Indulge in a premium #{svc[:name].downcase} delivered at your doorstep by verified specialists using top-tier sanitized products.",
        benefits: svc[:benefits] || [
          "Instant natural radiance and deep skin nourishment",
          "Professional single-use sealed hygiene kit",
          "Customized care tailored by certified beauty experts",
          "Stress-relieving facial acupressure and gentle massage"
        ],
        process: svc[:process] || [
          "1. Consultation & Skin / Hair Analysis",
          "2. Pre-service preparation & sanitisation",
          "3. Core treatment application & gentle massage",
          "4. Soothing finishing serum & post-care guidance"
        ]
      )
      service.assign_attributes(svc_attributes)
      service.save!
      puts "      Service: #{service.name} [#{service.tag}] (#{service.display_price})"
    end
  end
end

# ── 6. Add booking_items to existing seed bookings ────────────────────────────
puts "\nAdding booking items to seed bookings..."
hair_cut = Service.find_by(name: "Hair Cut & Blowdry")
facial   = Service.find_by(name: "Classic Facial")

Booking.all.each_with_index do |booking, i|
  next if booking.booking_items.any?
  svc = i.even? ? hair_cut : facial
  next unless svc
  BookingItem.create!(
    booking:                  booking,
    service:                  svc,
    service_name_snapshot:    svc.name,
    price_snapshot:           svc.effective_price,
    duration_minutes_snapshot: svc.duration_minutes,
    quantity:                 1
  )
  booking.update_columns(
    subtotal_amount: svc.effective_price,
    total_amount:    svc.effective_price
  )
end

# ── 7. City Price Overrides ───────────────────────────────────────────────────
puts "\nSeeding City Price Overrides..."
mumbai = cities["Mumbai"]
delhi  = cities["Delhi"]
keratin = Service.find_by(name: "Keratin Treatment")
if keratin && mumbai
  ServiceCityPrice.find_or_create_by!(service: keratin, city: mumbai) do |scp|
    scp.base_price = 3299.00
    scp.discount_price = 2699.00
    scp.status = "active"
  end
  puts "  Price Override: #{keratin.name} in Mumbai (₹2699)"
end
if keratin && delhi
  ServiceCityPrice.find_or_create_by!(service: keratin, city: delhi) do |scp|
    scp.base_price = 3499.00
    scp.discount_price = 2899.00
    scp.status = "active"
  end
  puts "  Price Override: #{keratin.name} in Delhi (₹2899)"
end

# ── 8. Historical 6-Month Bookings & Analytics Data ────────────────────────────
puts "\nSeeding 6-Month Historical Bookings and Payments..."
all_customers = User.customers.to_a
all_workers   = User.workers.to_a
all_services  = Service.active.to_a

if all_customers.any? && all_workers.any? && all_services.any?
  now = Time.current

  # Backfill missing booking_numbers and payments on initial seed bookings
  Booking.where(booking_number: [nil, ""]).find_each do |b|
    b.update_columns(booking_number: rand(100_000..999_999).to_s)
  end

  Booking.where(service_status: "completed").find_each do |b|
    next if b.payments.any?
    b.payments.create!(
      amount:          b.total_amount,
      method:          "cash",
      status:          "completed",
      transaction_ref: "TXN-LEGACY-#{b.id.to_s[0..6]}",
      paid_at:         b.scheduled_at || b.created_at,
      created_at:      b.created_at,
      updated_at:      b.updated_at
    )
  end

  # Rolling 6-month historical distribution
  historical_config = [
    { months_ago: 5, completed: 5, cancelled: 1, pending: 0, active: 0 },
    { months_ago: 4, completed: 7, cancelled: 1, pending: 0, active: 0 },
    { months_ago: 3, completed: 10, cancelled: 2, pending: 0, active: 0 },
    { months_ago: 2, completed: 13, cancelled: 2, pending: 0, active: 0 },
    { months_ago: 1, completed: 16, cancelled: 2, pending: 1, active: 0 },
    { months_ago: 0, completed: 6,  cancelled: 1, pending: 2, active: 3 }
  ]

  historical_config.each do |cfg|
    target_month = (now - cfg[:months_ago].months)
    month_prefix = target_month.strftime("%y%m")

    statuses_pool = ([:completed] * cfg[:completed]) +
                    ([:cancelled] * cfg[:cancelled]) +
                    ([:pending] * cfg[:pending]) +
                    ([:active] * cfg[:active])

    statuses_pool.each_with_index do |st, idx|
      b_num = "#{month_prefix}#{format('%03d', idx + 1)}"
      next if Booking.exists?(booking_number: b_num)

      customer = all_customers[idx % all_customers.size]
      worker   = all_workers[idx % all_workers.size]
      service  = all_services[(idx * 3) % all_services.size]
      address  = customer.addresses.first || Address.first

      day_of_month = [((idx + 1) * 3) % 27 + 1, 28].min
      date = target_month.change(day: day_of_month, hour: 10 + (idx % 8), min: [0, 30][idx % 2])

      b_status, s_status = case st
                           when :completed then ["confirmed", "completed"]
                           when :active    then ["confirmed", "in_progress"]
                           when :pending   then ["pending", "pending"]
                           when :cancelled then ["cancelled", "cancelled"]
                           end

      price = service.effective_price

      booking = Booking.create!(
        booking_number:  b_num,
        customer:        customer,
        worker:          worker,
        address:         address,
        booking_status:  b_status,
        service_status:  s_status,
        subtotal_amount: price,
        total_amount:    price,
        discount_amount: 0.0,
        scheduled_at:    date,
        created_at:      [date, now - 1.hour].min,
        updated_at:      [date, now - 1.hour].min
      )

      BookingItem.create!(
        booking:                   booking,
        service:                   service,
        service_name_snapshot:     service.name,
        price_snapshot:            price,
        duration_minutes_snapshot: service.duration_minutes,
        quantity:                  1,
        created_at:                date
      )

      pay_status, pay_method = case st
                               when :completed then ["completed", %w[upi card cash].sample]
                               when :active    then ["pending", %w[upi cod].sample]
                               when :pending   then ["pending", "cod"]
                               when :cancelled then ["refunded", "upi"]
                               end

      Payment.create!(
        booking:         booking,
        amount:          price,
        method:          pay_method,
        status:          pay_status,
        transaction_ref: pay_status == "completed" ? "TXN-#{b_num}-#{rand(1000..9999)}" : nil,
        paid_at:         pay_status == "completed" ? date : nil,
        created_at:      date,
        updated_at:      date
      )
    end
  end
  puts "  Historical bookings & payments seeded successfully!"
end

# ── 9. Service & Booking Reviews ─────────────────────────────────────────────
puts "\nSeeding Sample Customer Reviews for Services & Bookings..."
sample_reviews = [
  { rating: 5, comment: "Absolutely loved the service! The beautician was super hygienic and gentle. My skin feels fresh and glowing." },
  { rating: 5, comment: "On time and very professional! The products used were top quality and sealed." },
  { rating: 4, comment: "Great experience at home. Clean work and very polite specialist. Would definitely book again!" },
  { rating: 5, comment: "The massage technique was incredible. Felt like a luxury salon experience right in my living room." }
]

Booking.where(service_status: "completed").includes(:customer, :worker, :services, :booking_items).each_with_index do |b, idx|
  next if b.review.present?
  svc = b.services.first || b.booking_items.first&.service
  next if svc && Review.exists?(customer_id: b.customer_id, service_id: svc.id)

  rev_data = sample_reviews[idx % sample_reviews.size]
  Review.create!(
    booking:  b,
    customer: b.customer,
    worker:   b.worker,
    service:  svc,
    rating:   rev_data[:rating],
    comment:  rev_data[:comment]
  )
end

puts "\nSeed complete!"
puts "Admin credentials: admin@beautynest.test / Admin@1234"
puts "Worker A: worker.a@beautynest.test / Worker@1234"
puts "Worker B: worker.b@beautynest.test / Worker@1234"

