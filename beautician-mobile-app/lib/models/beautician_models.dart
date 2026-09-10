class JobModel {
  final String id;
  final String bookingNumber;
  final String serviceName;
  final String customerName;
  final String customerPhone;
  final String address;
  final double distanceKm;
  final String timeSlot;
  final double earningsAmount;
  final String status;
  final String startOtp;

  JobModel({
    required this.id,
    required this.bookingNumber,
    required this.serviceName,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.distanceKm,
    required this.timeSlot,
    required this.earningsAmount,
    required this.status,
    required this.startOtp,
  });
}
