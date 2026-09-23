# lib/dummy_data.rb
# Centralized dummy data for the Admin Control Panel frontend.
# Replace individual sections with real ActiveRecord queries when backend is ready.
module DummyData

  DASHBOARD_STATS = {
    total_customers:   1_248,
    total_workers:      186,
    total_bookings:   4_702,
    total_revenue:   "₹18,42,500",
    active_bookings:    234,
    pending_bookings:    89,
    completed_bookings: 4_204,
    cancelled_bookings: 175,
    new_customers_this_month: 94,
    bookings_this_month: 412,
    revenue_this_month: "₹1,84,200",
    monthly_labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    monthly_bookings: [310, 362, 398, 415, 388, 412],
    monthly_revenue:  [124000, 148000, 162000, 175000, 158000, 184200],
    booking_breakdown: { completed: 4204, pending: 89, cancelled: 175, active: 234 }
  }.freeze

  CUSTOMERS = [
    { id: 1,  name: "Priya Sharma",     email: "priya.sharma@gmail.com",    phone: "+91 98765 43210", city: "Mumbai",    status: "active",   bookings: 12, joined: "Jan 12, 2024", avatar_color: "ta-blue",   initials: "PS" },
    { id: 2,  name: "Ananya Gupta",     email: "ananya.g@outlook.com",      phone: "+91 87654 32109", city: "Delhi",     status: "active",   bookings:  8, joined: "Feb 3, 2024",  avatar_color: "ta-purple", initials: "AG" },
    { id: 3,  name: "Meera Nair",       email: "meera.nair@yahoo.com",      phone: "+91 76543 21098", city: "Bangalore", status: "active",   bookings: 21, joined: "Nov 5, 2023",  avatar_color: "ta-green",  initials: "MN" },
    { id: 4,  name: "Kavya Reddy",      email: "kavya.r@gmail.com",         phone: "+91 65432 10987", city: "Hyderabad", status: "inactive", bookings:  3, joined: "Mar 18, 2024", avatar_color: "ta-amber",  initials: "KR" },
    { id: 5,  name: "Divya Pillai",     email: "divya.pillai@gmail.com",    phone: "+91 54321 09876", city: "Chennai",   status: "active",   bookings: 15, joined: "Dec 28, 2023", avatar_color: "ta-pink",   initials: "DP" },
    { id: 6,  name: "Sneha Kapoor",     email: "sneha.k@icloud.com",        phone: "+91 43210 98765", city: "Pune",      status: "active",   bookings:  6, joined: "Apr 2, 2024",  avatar_color: "ta-teal",   initials: "SK" },
    { id: 7,  name: "Ishaan Mehta",     email: "ishaan.m@gmail.com",        phone: "+91 91234 56789", city: "Ahmedabad", status: "active",   bookings:  9, joined: "Jan 29, 2024", avatar_color: "ta-indigo", initials: "IM" },
    { id: 8,  name: "Riya Joshi",       email: "riya.joshi@gmail.com",      phone: "+91 82345 67890", city: "Kolkata",   status: "active",   bookings:  4, joined: "May 10, 2024", avatar_color: "ta-blue",   initials: "RJ" },
    { id: 9,  name: "Nisha Verma",      email: "nisha.v@hotmail.com",       phone: "+91 73456 78901", city: "Jaipur",    status: "inactive", bookings:  1, joined: "Jun 1, 2024",  avatar_color: "ta-purple", initials: "NV" },
    { id: 10, name: "Tanvi Banerjee",   email: "tanvi.b@gmail.com",         phone: "+91 64567 89012", city: "Mumbai",    status: "active",   bookings: 18, joined: "Oct 15, 2023", avatar_color: "ta-green",  initials: "TB" },
    { id: 11, name: "Aisha Siddiqui",   email: "aisha.s@gmail.com",         phone: "+91 55678 90123", city: "Lucknow",   status: "active",   bookings:  7, joined: "Mar 7, 2024",  avatar_color: "ta-amber",  initials: "AS" },
    { id: 12, name: "Pooja Dubey",      email: "pooja.d@gmail.com",         phone: "+91 46789 01234", city: "Bhopal",    status: "active",   bookings:  2, joined: "Jul 4, 2024",  avatar_color: "ta-pink",   initials: "PD" }
  ].freeze

  WORKERS = [
    { id: 1,  name: "Sunita Devi",    email: "sunita.devi@gmail.com",  phone: "+91 98111 22333", speciality: "Hair Styling",     rating: 4.9, reviews: 142, status: "active",   approval: "approved",  bookings: 284, joined: "Sep 5, 2023",  avatar_color: "ta-blue",   initials: "SD", city: "Mumbai"    },
    { id: 2,  name: "Lakshmi T.",     email: "lakshmi.t@gmail.com",    phone: "+91 97222 33444", speciality: "Skincare & Facial", rating: 4.8, reviews: 118, status: "active",   approval: "approved",  bookings: 241, joined: "Oct 12, 2023", avatar_color: "ta-purple", initials: "LT", city: "Chennai"   },
    { id: 3,  name: "Rani Malhotra",  email: "rani.m@gmail.com",       phone: "+91 96333 44555", speciality: "Nail Art",          rating: 4.7, reviews:  97, status: "active",   approval: "approved",  bookings: 196, joined: "Nov 20, 2023", avatar_color: "ta-green",  initials: "RM", city: "Delhi"     },
    { id: 4,  name: "Geeta Sharma",   email: "geeta.s@gmail.com",      phone: "+91 95444 55666", speciality: "Massage Therapy",  rating: 4.6, reviews:  84, status: "active",   approval: "approved",  bookings: 168, joined: "Dec 8, 2023",  avatar_color: "ta-amber",  initials: "GS", city: "Bangalore" },
    { id: 5,  name: "Farzana K.",     email: "farzana.k@gmail.com",    phone: "+91 94555 66777", speciality: "Bridal Makeup",    rating: 4.9, reviews: 203, status: "active",   approval: "approved",  bookings: 312, joined: "Aug 14, 2023", avatar_color: "ta-pink",   initials: "FK", city: "Hyderabad" },
    { id: 6,  name: "Champa Bai",     email: "champa.b@gmail.com",     phone: "+91 93666 77888", speciality: "Hair Coloring",    rating: 4.5, reviews:  61, status: "active",   approval: "approved",  bookings: 124, joined: "Jan 4, 2024",  avatar_color: "ta-teal",   initials: "CB", city: "Jaipur"    },
    { id: 7,  name: "Deepa Nair",     email: "deepa.n@gmail.com",      phone: "+91 92777 88999", speciality: "Waxing & Threading",rating:4.4, reviews:  49, status: "inactive", approval: "approved",  bookings:  89, joined: "Feb 18, 2024", avatar_color: "ta-indigo", initials: "DN", city: "Pune"      },
    { id: 8,  name: "Neha Pandey",    email: "neha.p@gmail.com",       phone: "+91 91888 99000", speciality: "Hair Styling",     rating: 0.0, reviews:   0, status: "pending",  approval: "pending",   bookings:   0, joined: "Aug 1, 2024",  avatar_color: "ta-blue",   initials: "NP", city: "Kolkata"   },
    { id: 9,  name: "Kavitha R.",     email: "kavitha.r@gmail.com",    phone: "+91 90999 00111", speciality: "Skincare",         rating: 0.0, reviews:   0, status: "pending",  approval: "pending",   bookings:   0, joined: "Aug 3, 2024",  avatar_color: "ta-purple", initials: "KR", city: "Coimbatore"}
  ].freeze

  CATEGORIES = [
    { id: 1, name: "Hair Care",       description: "Haircuts, styling, coloring, treatments", icon: "scissors", services: 14, status: "active",   color: "ta-blue"   },
    { id: 2, name: "Skincare",        description: "Facials, cleanup, anti-aging treatments",  icon: "zap",      services: 11, status: "active",   color: "ta-purple" },
    { id: 3, name: "Nail Art",        description: "Manicure, pedicure, nail extensions",     icon: "feather",  services:  8, status: "active",   color: "ta-amber"  },
    { id: 4, name: "Massage",         description: "Body massage, foot spa, aromatherapy",    icon: "activity", services:  9, status: "active",   color: "ta-green"  },
    { id: 5, name: "Bridal Packages", description: "Full bridal makeup and preparation",      icon: "heart",    services:  6, status: "active",   color: "ta-amber"  },
    { id: 6, name: "Waxing",          description: "Full-body waxing and threading",           icon: "wind",     services:  7, status: "active",   color: "ta-teal"   },
    { id: 7, name: "Makeup",          description: "Party, event, and everyday makeup",       icon: "star",     services:  5, status: "inactive", color: "ta-indigo" }
  ].freeze

  SERVICES = [
    { id:  1, name: "Haircut & Style",        category_id: 1, category: "Hair Care",  price: 499,  duration: 60,  status: "active",   bookings: 284 },
    { id:  2, name: "Hair Coloring (Global)", category_id: 1, category: "Hair Care",  price: 1799, duration: 120, status: "active",   bookings: 142 },
    { id:  3, name: "Keratin Treatment",      category_id: 1, category: "Hair Care",  price: 3499, duration: 180, status: "active",   bookings:  89 },
    { id:  4, name: "Basic Facial",           category_id: 2, category: "Skincare",   price: 699,  duration: 60,  status: "active",   bookings: 312 },
    { id:  5, name: "Brightening Facial",     category_id: 2, category: "Skincare",   price: 1299, duration: 75,  status: "active",   bookings: 198 },
    { id:  6, name: "Anti-Aging Treatment",   category_id: 2, category: "Skincare",   price: 2499, duration: 90,  status: "active",   bookings:  74 },
    { id:  7, name: "Classic Manicure",       category_id: 3, category: "Nail Art",   price: 399,  duration: 45,  status: "active",   bookings: 241 },
    { id:  8, name: "Gel Nail Extensions",    category_id: 3, category: "Nail Art",   price: 1199, duration: 90,  status: "active",   bookings: 156 },
    { id:  9, name: "Swedish Massage (60min)",category_id: 4, category: "Massage",    price: 999,  duration: 60,  status: "active",   bookings: 203 },
    { id: 10, name: "Deep Tissue Massage",    category_id: 4, category: "Massage",    price: 1499, duration: 90,  status: "active",   bookings: 118 },
    { id: 11, name: "Bridal Makeup + Hair",   category_id: 5, category: "Bridal",     price: 8999, duration: 240, status: "active",   bookings:  62 },
    { id: 12, name: "Bridal Trial Session",   category_id: 5, category: "Bridal",     price: 2999, duration: 120, status: "active",   bookings:  47 },
    { id: 13, name: "Full Body Waxing",        category_id: 6, category: "Waxing",     price: 1299, duration: 75,  status: "active",   bookings: 167 },
    { id: 14, name: "Eyebrow Threading",      category_id: 6, category: "Waxing",     price: 99,   duration: 15,  status: "active",   bookings: 428 },
    { id: 15, name: "Party Makeup",           category_id: 7, category: "Makeup",     price: 1999, duration: 90,  status: "inactive", bookings:  38 }
  ].freeze

  BOOKINGS = [
    { id: "BC-4702", customer_id: 1, customer: "Priya Sharma",    worker_id: 1, worker: "Sunita Devi",  service: "Haircut & Style",        date: "Aug 28, 2024", time: "10:00 AM", amount: "₹499",  status: "completed", payment_status: "paid"    },
    { id: "BC-4701", customer_id: 2, customer: "Ananya Gupta",    worker_id: 4, worker: "Geeta Sharma", service: "Swedish Massage",        date: "Aug 28, 2024", time: "11:30 AM", amount: "₹999",  status: "completed", payment_status: "paid"    },
    { id: "BC-4700", customer_id: 3, customer: "Meera Nair",      worker_id: 2, worker: "Lakshmi T.",   service: "Brightening Facial",     date: "Aug 28, 2024", time: "02:00 PM", amount: "₹1,299",status: "in_progress",payment_status: "paid"    },
    { id: "BC-4699", customer_id: 5, customer: "Divya Pillai",    worker_id: 3, worker: "Rani Malhotra",service: "Classic Manicure",       date: "Aug 29, 2024", time: "09:30 AM", amount: "₹399",  status: "confirmed", payment_status: "paid"    },
    { id: "BC-4698", customer_id: 6, customer: "Sneha Kapoor",    worker_id: 5, worker: "Farzana K.",   service: "Bridal Makeup + Hair",   date: "Sep 2, 2024",  time: "07:00 AM", amount: "₹8,999",status: "confirmed", payment_status: "paid"    },
    { id: "BC-4697", customer_id: 10, customer: "Tanvi Banerjee", worker_id: nil, worker: "Unassigned", service: "Hair Coloring (Global)", date: "Aug 30, 2024", time: "01:00 PM", amount: "₹1,799",status: "pending",   payment_status: "paid"    },
    { id: "BC-4696", customer_id: 7,  customer: "Ishaan Mehta",   worker_id: 6, worker: "Champa Bai",   service: "Hair Coloring (Global)", date: "Aug 27, 2024", time: "03:30 PM", amount: "₹1,799",status: "completed", payment_status: "paid"    },
    { id: "BC-4695", customer_id: 4,  customer: "Kavya Reddy",    worker_id: 1, worker: "Sunita Devi",  service: "Haircut & Style",        date: "Aug 27, 2024", time: "11:00 AM", amount: "₹499",  status: "cancelled", payment_status: "refunded" },
    { id: "BC-4694", customer_id: 11, customer: "Aisha Siddiqui", worker_id: 3, worker: "Rani Malhotra",service: "Gel Nail Extensions",    date: "Aug 26, 2024", time: "04:00 PM", amount: "₹1,199",status: "completed", payment_status: "paid"    },
    { id: "BC-4693", customer_id: 8,  customer: "Riya Joshi",     worker_id: 4, worker: "Geeta Sharma", service: "Deep Tissue Massage",    date: "Aug 26, 2024", time: "10:30 AM", amount: "₹1,499",status: "completed", payment_status: "paid"    },
    { id: "BC-4692", customer_id: 1,  customer: "Priya Sharma",   worker_id: 2, worker: "Lakshmi T.",   service: "Basic Facial",           date: "Aug 25, 2024", time: "02:30 PM", amount: "₹699",  status: "completed", payment_status: "paid"    },
    { id: "BC-4691", customer_id: 9,  customer: "Nisha Verma",    worker_id: nil, worker: "Unassigned", service: "Full Body Waxing",       date: "Sep 1, 2024",  time: "12:00 PM", amount: "₹1,299",status: "pending",   payment_status: "pending" }
  ].freeze

  PAYMENTS = [
    { id: "PAY-8821", booking_id: "BC-4702", customer: "Priya Sharma",    amount: "₹499",   method: "UPI",         status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8820", booking_id: "BC-4701", customer: "Ananya Gupta",    amount: "₹999",   method: "Credit Card", status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8819", booking_id: "BC-4700", customer: "Meera Nair",      amount: "₹1,299", method: "Debit Card",  status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8818", booking_id: "BC-4699", customer: "Divya Pillai",    amount: "₹399",   method: "UPI",         status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8817", booking_id: "BC-4698", customer: "Sneha Kapoor",    amount: "₹8,999", method: "Net Banking", status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8816", booking_id: "BC-4697", customer: "Tanvi Banerjee",  amount: "₹1,799", method: "UPI",         status: "completed", date: "Aug 28, 2024" },
    { id: "PAY-8815", booking_id: "BC-4696", customer: "Ishaan Mehta",    amount: "₹1,799", method: "Credit Card", status: "completed", date: "Aug 27, 2024" },
    { id: "PAY-8814", booking_id: "BC-4695", customer: "Kavya Reddy",     amount: "₹499",   method: "UPI",         status: "refunded",  date: "Aug 27, 2024" },
    { id: "PAY-8813", booking_id: "BC-4694", customer: "Aisha Siddiqui",  amount: "₹1,199", method: "Debit Card",  status: "completed", date: "Aug 26, 2024" },
    { id: "PAY-8812", booking_id: "BC-4693", customer: "Riya Joshi",      amount: "₹1,499", method: "UPI",         status: "completed", date: "Aug 26, 2024" },
    { id: "PAY-8811", booking_id: "BC-4692", customer: "Priya Sharma",    amount: "₹699",   method: "Credit Card", status: "completed", date: "Aug 25, 2024" },
    { id: "PAY-8810", booking_id: "BC-4691", customer: "Nisha Verma",     amount: "₹1,299", method: "UPI",         status: "pending",   date: "Aug 25, 2024" }
  ].freeze

  COUPONS = [
    { id: 1, code: "BEAUTY20",   type: "Percentage", value: "20%",     min_order: "₹500",   max_uses: 500, used: 312, valid_until: "Sep 30, 2024", status: "active"   },
    { id: 2, code: "FLAT100",    type: "Flat",       value: "₹100",    min_order: "₹400",   max_uses: 200, used: 198, valid_until: "Aug 31, 2024", status: "active"   },
    { id: 3, code: "BRIDE2024",  type: "Percentage", value: "15%",     min_order: "₹5,000", max_uses: 50,  used: 22,  valid_until: "Dec 31, 2024", status: "active"   },
    { id: 4, code: "WELCOME50",  type: "Flat",       value: "₹50",     min_order: "₹200",   max_uses: 1000,used: 741, valid_until: "Oct 15, 2024", status: "active"   },
    { id: 5, code: "MONSOON30",  type: "Percentage", value: "30%",     min_order: "₹600",   max_uses: 300, used: 300, valid_until: "Jul 31, 2024", status: "expired"  },
    { id: 6, code: "SUMMER15",   type: "Percentage", value: "15%",     min_order: "₹300",   max_uses: 400, used: 0,   valid_until: "Oct 31, 2024", status: "inactive" }
  ].freeze

  REVIEWS = [
    { id: 1, customer: "Priya Sharma",    worker: "Sunita Devi",    service: "Haircut & Style",     rating: 5, comment: "Absolutely brilliant! Sunita understood exactly what I wanted. Will book again!", date: "Aug 28, 2024", status: "published" },
    { id: 2, customer: "Meera Nair",      worker: "Lakshmi T.",     service: "Brightening Facial",  rating: 5, comment: "My skin felt amazing after the treatment. Highly recommend Lakshmi!", date: "Aug 27, 2024", status: "published" },
    { id: 3, customer: "Ananya Gupta",    worker: "Geeta Sharma",   service: "Swedish Massage",     rating: 4, comment: "Very relaxing session. Geeta was professional and attentive.", date: "Aug 26, 2024", status: "published" },
    { id: 4, customer: "Aisha Siddiqui", worker: "Rani Malhotra",  service: "Gel Nail Extensions", rating: 5, comment: "Perfect nail art! The extensions look stunning and lasted over 3 weeks.", date: "Aug 25, 2024", status: "published" },
    { id: 5, customer: "Divya Pillai",    worker: "Rani Malhotra",  service: "Classic Manicure",    rating: 4, comment: "Clean and neat work. Could have been a bit quicker but quality was good.", date: "Aug 24, 2024", status: "published" },
    { id: 6, customer: "Tanvi Banerjee",  worker: "Champa Bai",     service: "Hair Coloring",       rating: 3, comment: "Color came out slightly different from what was shown. Overall okay.", date: "Aug 23, 2024", status: "flagged"   },
    { id: 7, customer: "Ishaan Mehta",    worker: "Champa Bai",     service: "Hair Coloring",       rating: 5, comment: "Champa did a phenomenal job with my ombre. Very happy!", date: "Aug 22, 2024", status: "published" },
    { id: 8, customer: "Riya Joshi",      worker: "Geeta Sharma",   service: "Deep Tissue Massage", rating: 5, comment: "Best massage I have ever had. My back pain completely went away!", date: "Aug 21, 2024", status: "published" }
  ].freeze

  NOTIFICATIONS = [
    { id: 1,  type: "push",  recipient: "All Customers",     subject: "Monsoon Special Offers", body: "Get up to 30% off on all services this monsoon season!",    status: "sent",    date: "Aug 28, 2024" },
    { id: 2,  type: "email", recipient: "Priya Sharma",      subject: "Your booking confirmed",  body: "Your booking BC-4702 for Haircut & Style has been confirmed.", status: "sent",    date: "Aug 27, 2024" },
    { id: 3,  type: "sms",   recipient: "Kavya Reddy",       subject: "Booking Cancelled",       body: "Your booking BC-4695 has been cancelled. Refund in 2-3 days.", status: "sent",    date: "Aug 27, 2024" },
    { id: 4,  type: "push",  recipient: "All Workers",       subject: "New service added",       body: "Anti-Aging Treatment has been added to the catalog.",         status: "sent",    date: "Aug 26, 2024" },
    { id: 5,  type: "email", recipient: "Ananya Gupta",      subject: "Rate your experience",    body: "How was your session with Geeta Sharma? Leave a review!",    status: "sent",    date: "Aug 26, 2024" },
    { id: 6,  type: "push",  recipient: "Pending Workers",   subject: "Complete your profile",   body: "Add your portfolio photos to get more bookings.",             status: "sent",    date: "Aug 25, 2024" },
    { id: 7,  type: "email", recipient: "All Admins",        subject: "Monthly report ready",    body: "The August 2024 platform report is now available.",           status: "pending", date: "Sep 1, 2024"  },
    { id: 8,  type: "sms",   recipient: "Sneha Kapoor",      subject: "Bridal booking reminder", body: "Reminder: Your bridal session is on Sep 2. Please be ready.", status: "pending", date: "Sep 1, 2024"  }
  ].freeze

end
