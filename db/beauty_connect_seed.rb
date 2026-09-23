# ==========================================================================
# BeautyNest — Category / Subcategory / Service + City Pricing seed
# Source: updated Google Sheet (Category, Sub-category, Service Name,
#         Duration, Lucknow Price, Banaras Price, Prayagraj Price)
#
# WHAT THIS DOES
#   1. Creates Categories -> Subcategories -> Services (duration only,
#      no images — image_url is left untouched/nil).
#   2. Creates the 3 Cities: Lucknow, Banaras, Prayagraj.
#   3. Creates one ServiceCityPrice row per (service, city) pair with the
#      exact price from the sheet, matching your service_city_prices table.
#   4. Sets each Service's own `base_price` (NOT NULL in your schema) to
#      its Lucknow price as a default — the real customer-facing price
#      per city should come from service_city_prices, not this column.
#
# RUN-ONCE GUARD
#   This script writes a row to your existing `settings` table
#   (key: "seed:beautyconnect_city_pricing_v1") the first time it
#   completes successfully. On every subsequent run it checks for that
#   row first and exits immediately without touching any data — so
#   running `rails db:seed` (or this file directly) multiple times is
#   safe and will NOT re-run the seed logic.
#
#   To force a re-run anyway (e.g. after fixing a typo in the sheet),
#   either delete that settings row or run with FORCE_RESEED=true:
#     FORCE_RESEED=true bundle exec rails runner beautyconnect_city_pricing_seed.rb
#
# HOW TO RUN
#   bundle exec rails runner beautyconnect_city_pricing_seed.rb
#   (or paste into db/seeds.rb and run `bin/rails db:seed`)
# ==========================================================================

SEED_KEY = "seed:beautyconnect_city_pricing_v1".freeze

already_run = Setting.find_by(key: SEED_KEY)
if already_run && ENV["FORCE_RESEED"] != "true"
  puts "[seed] '#{SEED_KEY}' already ran at #{already_run.value} — skipping."
  puts "[seed] Re-run with FORCE_RESEED=true if you intentionally want to re-apply it:"
  puts "         FORCE_RESEED=true bundle exec rails runner beautyconnect_city_pricing_seed.rb"
else
  ActiveRecord::Base.transaction do
    # Helper to map category/subcategory/service names to valid Service::TAGS (%w[facial korean-glow mani-padi])
    def determine_service_tag(cat_name, subcat_name, service_name)
      text = "#{cat_name} #{subcat_name} #{service_name}".downcase
      if text.match?(/facial|cleanup|skin|bleach|de-tan/)
        "facial"
      elsif text.match?(/nail|mani|pedi/)
        "mani-padi"
      else
        "korean-glow"
      end
    end

    # ------------------------------------------------------------------------
    # 1. Raw data: [category, subcategory, service_name, duration_min,
    #               lucknow_price, banaras_price, prayagraj_price]
    # ------------------------------------------------------------------------
    SERVICES_DATA = [
      ["Facial & Cleanup", "Cleanup",       "Basic Cleanup",                  30,  250,  250,  250],
      ["Facial & Cleanup", "Cleanup",       "Fruit Cleanup",                  40,  350,  300,  300],
      ["Facial & Cleanup", "Cleanup",       "De-Tan Cleanup",                 45,  400,  350,  350],
      ["Facial & Cleanup", "Facial",        "Fruit Facial",                   60,  500,  450,  450],
      ["Facial & Cleanup", "Facial",        "Gold Facial",                    70,  800,  700,  650],
      ["Facial & Cleanup", "Facial",        "Diamond Facial",                 75,  900,  800,  750],
      ["Facial & Cleanup", "Facial",        "Pearl Facial",                   70,  750,  700,  650],
      ["Facial & Cleanup", "Facial",        "Vitamin-C Facial",               60,  650,  600,  550],
      ["Facial & Cleanup", "Facial",        "O3+ Facial",                     70,  900,  800,  750],
      ["Facial & Cleanup", "Facial",        "Anti-Ageing Facial",             75, 1000,  900,  850],
      ["Facial & Cleanup", "Facial",        "Acne Care Facial",               70,  800,  700,  650],
      ["Facial & Cleanup", "Facial",        "Hydrating Facial",               60,  650,  600,  550],
      ["Facial & Cleanup", "Advanced Skin", "Hydra Facial",                   75, 1500, 1400, 1300],
      ["Facial & Cleanup", "Advanced Skin", "LED Photo Facial",               60, 1200, 1100, 1000],
      ["Facial & Cleanup", "Advanced Skin", "Skin Brightening Treatment",     60, 1000,  900,  850],
      ["Facial & Cleanup", "Advanced Skin", "Skin Lifting Facial",            75, 1200, 1100, 1000],
      ["Facial & Cleanup", "Advanced Skin", "Pigmentation Care Facial",       75, 1200, 1100, 1000],
      ["Facial & Cleanup", "Advanced Skin", "Dehydrated Skin Therapy",        60,  900,  850,  800],
      ["Bleach & De-Tan",  "Bleach",        "Face Bleach",                    25,  200,  180,  180],
      ["Bleach & De-Tan",  "Bleach",        "Oxy Bleach Face",                30,  300,  280,  250],
      ["Bleach & De-Tan",  "Bleach",        "Vitamin-C Bleach Face",          30,  300,  280,  250],
      ["Bleach & De-Tan",  "Bleach",        "Underarm Bleach",                20,  200,  180,  180],
      ["Bleach & De-Tan",  "Bleach",        "Full Arms Bleach",               30,  350,  300,  300],
      ["Bleach & De-Tan",  "Bleach",        "Full Legs Bleach",               35,  450,  400,  350],
      ["Bleach & De-Tan",  "De-Tan",        "Face De-Tan",                    30,  300,  280,  250],
      ["Bleach & De-Tan",  "De-Tan",        "Hands De-Tan",                   25,  250,  220,  220],
      ["Bleach & De-Tan",  "De-Tan",        "Feet De-Tan",                    25,  250,  220,  220],
      ["Bleach & De-Tan",  "De-Tan",        "Full Arms De-Tan",               35,  400,  350,  350],
      ["Bleach & De-Tan",  "De-Tan",        "Full Legs De-Tan",               40,  500,  450,  400],
      ["Bleach & De-Tan",  "De-Tan",        "Back De-Tan",                    40,  500,  450,  400],
      ["Bleach & De-Tan",  "De-Tan",        "Full Body De-Tan",               90, 1200, 1100, 1000],
      ["Threading",        "Threading",     "Eyebrow Threading",              10,   80,   60,   60],
      ["Threading",        "Threading",     "Upper Lip Threading",             5,   50,   40,   40],
      ["Threading",        "Threading",     "Chin Threading",                  7,   60,   50,   50],
      ["Threading",        "Threading",     "Forehead Threading",              7,   60,   50,   50],
      ["Threading",        "Threading",     "Full Face Threading",            25,  200,  180,  160],
      ["Threading",        "Threading",     "Side Locks Threading",           10,   80,   70,   70],
      ["Waxing",           "Regular Wax",   "Half Arms Wax",                  20,  200,  180,  180],
      ["Waxing",           "Regular Wax",   "Full Arms Wax",                  30,  300,  280,  250],
      ["Waxing",           "Regular Wax",   "Half Legs Wax",                  25,  250,  220,  220],
      ["Waxing",           "Regular Wax",   "Full Legs Wax",                  35,  400,  350,  350],
      ["Waxing",           "Regular Wax",   "Underarms Wax",                  15,  150,  130,  120],
      ["Waxing",           "Regular Wax",   "Bikini Line Wax",                20,  300,  280,  250],
      ["Waxing",           "Regular Wax",   "Full Body Wax",                  90,  900,  800,  750],
      ["Waxing",           "Rica Wax",      "Rica Full Arms Wax",             30,  450,  400,  380],
      ["Waxing",           "Rica Wax",      "Rica Full Legs Wax",             40,  600,  550,  500],
      ["Waxing",           "Rica Wax",      "Rica Underarms Wax",             15,  250,  220,  220],
      ["Waxing",           "Rica Wax",      "Rica Bikini Line Wax",           25,  400,  350,  350],
      ["Waxing",           "Rica Wax",      "Rica Full Body Wax",            100, 1400, 1250, 1150],
      ["Waxing",           "Chocolate Wax", "Chocolate Full Arms Wax",        30,  350,  320,  300],
      ["Waxing",           "Chocolate Wax", "Chocolate Full Legs Wax",        40,  500,  450,  400],
      ["Waxing",           "Chocolate Wax", "Chocolate Underarms Wax",        15,  200,  180,  180],
      ["Waxing",           "Roll-On Wax",   "Roll-On Full Arms Wax",          30,  400,  350,  350],
      ["Waxing",           "Roll-On Wax",   "Roll-On Full Legs Wax",          40,  550,  500,  450],
      ["Waxing",           "Roll-On Wax",   "Roll-On Full Body Wax",         100, 1200, 1100, 1000],
      ["Manicure",         "Basic",         "Classic Manicure",               40,  300,  280,  250],
      ["Manicure",         "Premium",       "Luxury Manicure",                55,  500,  450,  400],
      ["Manicure",         "Premium",       "Spa Manicure",                   60,  600,  550,  500],
      ["Manicure",         "Nail Polish",   "Classic Nail Paint",             25,  150,  120,  120],
      ["Manicure",         "Nail Polish",   "Gel Nail Polish",                45,  500,  450,  400],
      ["Manicure",         "Nail Care",     "Nail Extension Removal",         30,  250,  220,  200],
      ["Pedicure",         "Basic",         "Classic Pedicure",               50,  400,  350,  350],
      ["Pedicure",         "Premium",       "Luxury Pedicure",                65,  600,  550,  500],
      ["Pedicure",         "Premium",       "Spa Pedicure",                   70,  700,  650,  600],
      ["Pedicure",         "Specialty",     "French Pedicure",                60,  500,  450,  400],
      ["Pedicure",         "Specialty",     "Callus Care Pedicure",           60,  550,  500,  450],
      ["Body Care",        "Scrub",         "Full Body Scrub",                60,  700,  650,  600],
      ["Body Care",        "Scrub",         "Back Scrub",                     30,  350,  300,  300],
      ["Body Care",        "Scrub",         "Hands Scrub",                    20,  200,  180,  180],
      ["Body Care",        "Scrub",         "Legs Scrub",                     30,  300,  280,  250],
      ["Body Care",        "Polish",        "Full Body Polish",               75,  900,  800,  750],
      ["Body Care",        "Polish",        "Back Polish",                    35,  450,  400,  350],
      ["Body Care",        "Polish",        "Hand & Feet Polish",             40,  400,  350,  350],
      ["Hair",             "Haircut",       "Women's Basic Haircut",          45,  400,  350,  300],
      ["Hair",             "Haircut",       "Women's Advanced Haircut",       60,  700,  600,  550],
      ["Hair",             "Haircut",       "Kids Haircut",                   30,  250,  220,  200],
      ["Hair",             "Haircut",       "Men's Haircut",                  30,  250,  200,  200],
      ["Hair",             "Haircut",       "Men's Beard Trim",               20,  150,  120,  120],
      ["Hair",             "Styling",       "Blow Dry",                       30,  300,  280,  250],
      ["Hair",             "Styling",       "Hair Straightening/Styling",     45,  500,  450,  400],
      ["Hair",             "Styling",       "Party Hair Styling",             60,  800,  700,  650],
      ["Hair",             "Colour",        "Root Touch-Up",                  60,  700,  650,  600],
      ["Hair",             "Colour",        "Global Hair Colour",            120, 1500, 1300, 1200],
      ["Hair",             "Colour",        "Global Hair Colour - Long Hair", 150, 2000, 1800, 1600],
      ["Hair",             "Colour",        "Highlights",                    120, 1500, 1300, 1200],
      ["Hair",             "Colour",        "Balayage",                      180, 2500, 2200, 2000],
      ["Hair",             "Treatment",     "Hair Spa Basic",                 60,  700,  650,  600],
      ["Hair",             "Treatment",     "Keratin Hair Spa",               75, 1000,  900,  850],
      ["Hair",             "Treatment",     "Anti-Dandruff Hair Spa",         60,  800,  700,  650],
      ["Hair",             "Treatment",     "Hair Fall Care Spa",             60,  900,  800,  750],
      ["Hair",             "Treatment",     "Deep Conditioning Treatment",    45,  700,  600,  550],
      ["Hair",             "Treatment",     "Keratin/Smoothing Treatment",   180, 2500, 2300, 2000],
      ["Massage & Spa",    "Massage",       "Head Massage",                   30,  250,  220,  200],
      ["Massage & Spa",    "Massage",       "Back Massage",                   30,  350,  300,  280],
      ["Massage & Spa",    "Massage",       "Foot Reflexology",               40,  400,  350,  320],
      ["Massage & Spa",    "Massage",       "Swedish Massage",                60,  900,  800,  750],
      ["Massage & Spa",    "Massage",       "Deep Tissue Massage",            60, 1000,  900,  850],
      ["Massage & Spa",    "Massage",       "Thai Massage",                   60,  900,  800,  750],
      ["Massage & Spa",    "Massage",       "Potli Massage",                  60, 1000,  900,  850],
    ].freeze

    CITY_NAMES = %w[Lucknow Banaras Prayagraj].freeze

    # -- 2. Cities -------------------------------------------------------------
    cities = CITY_NAMES.each_with_object({}) do |city_name, memo|
      city = City.find_by(slug: city_name.parameterize) || City.find_or_initialize_by(name: city_name)
      city.name    = city_name
      city.slug  ||= city_name.parameterize
      city.state   = "Uttar Pradesh"
      city.status ||= "active"
      city.save!
      memo[city_name] = city
    end
    puts "[seed] Cities ready: #{cities.keys.join(', ')}"

    # -- 3. Categories, Subcategories, Services, per-city prices ----------------
    category_cache        = {}
    subcategory_cache     = {}
    created_categories    = 0
    created_subcategories = 0
    created_services      = 0
    updated_services      = 0
    created_prices        = 0
    updated_prices        = 0

    SERVICES_DATA.each_with_index do |row, idx|
      cat_name, subcat_name, service_name, duration, lucknow_price, banaras_price, prayagraj_price = row

      category = category_cache[cat_name] ||= begin
        cat = Category.find_by(slug: cat_name.parameterize) || Category.find_or_initialize_by(name: cat_name)
        is_new = cat.new_record?
        cat.name        = cat_name
        cat.slug      ||= cat_name.parameterize
        cat.description ||= "#{cat_name} services"
        cat.status      ||= "active"
        cat.position      = category_cache.size if is_new
        cat.save!
        created_categories += 1 if is_new
        cat
      end

      subcat_key = "#{cat_name}/#{subcat_name}"
      subcategory = subcategory_cache[subcat_key] ||= begin
        sub_slug = "#{cat_name}-#{subcat_name}".parameterize
        sub = Subcategory.find_by(slug: sub_slug) ||
              category.subcategories.find_by(name: subcat_name) ||
              Subcategory.new(slug: sub_slug, category: category)
        is_new = sub.new_record?
        sub.name        = subcat_name
        sub.category    = category
        sub.description ||= "#{subcat_name} under #{cat_name}"
        sub.status      ||= "active"
        sub.position      = subcategory_cache.size if is_new
        sub.save!
        created_subcategories += 1 if is_new
        sub
      end

      # Find by slug, then within subcategory by name, then globally by name, or initialize new
      service = Service.find_by(slug: service_name.parameterize) ||
                subcategory.services.find_by(name: service_name) ||
                Service.find_by(name: service_name) ||
                Service.new(slug: service_name.parameterize)
      is_new = service.new_record?
      service.name               = service_name
      service.subcategory        = subcategory
      service.description      ||= "#{service_name} — #{subcat_name} (#{cat_name})"
      service.duration_minutes   = duration
      service.base_price         = lucknow_price
      service.discount_price     = nil if service.discount_price.present? && service.discount_price >= lucknow_price
      service.status           ||= "active"
      service.tag                = determine_service_tag(cat_name, subcat_name, service_name)
      service.position           = idx
      service.save!
      is_new ? (created_services += 1) : (updated_services += 1)

      { "Lucknow" => lucknow_price, "Banaras" => banaras_price, "Prayagraj" => prayagraj_price }.each do |city_name, price|
        scp = ServiceCityPrice.find_or_initialize_by(service: service, city: cities.fetch(city_name))
        was_new = scp.new_record?
        scp.base_price = price
        # Guard against check constraint: discount_price must be < base_price
        scp.discount_price = nil if scp.discount_price.present? && scp.discount_price >= price
        scp.status    ||= "active"
        scp.save!
        was_new ? (created_prices += 1) : (updated_prices += 1)
      end
    end

    puts "[seed] Categories: #{created_categories} created / #{category_cache.size} total"
    puts "[seed] Subcategories: #{created_subcategories} created / #{subcategory_cache.size} total"
    puts "[seed] Services: #{created_services} created, #{updated_services} updated / #{SERVICES_DATA.size} total"
    puts "[seed] Service city prices: #{created_prices} created, #{updated_prices} updated / #{SERVICES_DATA.size * CITY_NAMES.size} rows expected"

    # -- 4. Mark this seed as done so it never re-runs by accident --------------
    lock = Setting.find_or_initialize_by(key: SEED_KEY)
    lock.value = Time.current.iso8601
    lock.save!
    puts "[seed] Locked '#{SEED_KEY}' at #{lock.value} — future runs will skip unless FORCE_RESEED=true."
  end
end
