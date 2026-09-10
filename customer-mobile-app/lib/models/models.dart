class ServiceModel {
  final String id;
  final String name;
  final String category;
  final double price;
  final double originalPrice;
  final int discountPercent;
  final int durationMinutes;
  final double rating;
  final int reviewCount;
  final String imageUrl;
  final String shortDesc;
  final String about;
  final List<String> benefits;
  final List<String> processSteps;
  final bool isBestseller;

  ServiceModel({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.originalPrice,
    required this.discountPercent,
    required this.durationMinutes,
    required this.rating,
    required this.reviewCount,
    required this.imageUrl,
    required this.shortDesc,
    required this.about,
    required this.benefits,
    required this.processSteps,
    this.isBestseller = false,
  });
}

class BeauticianModel {
  final String id;
  final String name;
  final double rating;
  final int reviewCount;
  final int experienceYears;
  final String specialization;
  final double distanceKm;
  final String imageUrl;
  final bool isVerified;

  BeauticianModel({
    required this.id,
    required this.name,
    required this.rating,
    required this.reviewCount,
    required this.experienceYears,
    required this.specialization,
    required this.distanceKm,
    required this.imageUrl,
    this.isVerified = true,
  });
}

class BookingModel {
  final String id;
  final String bookingNumber;
  final ServiceModel service;
  final BeauticianModel beautician;
  final String date;
  final String timeSlot;
  final String address;
  final double totalAmount;
  final String status;
  final String startOtp;

  BookingModel({
    required this.id,
    required this.bookingNumber,
    required this.service,
    required this.beautician,
    required this.date,
    required this.timeSlot,
    required this.address,
    required this.totalAmount,
    required this.status,
    required this.startOtp,
  });
}
