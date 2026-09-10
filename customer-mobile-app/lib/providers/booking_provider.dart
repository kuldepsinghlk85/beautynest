import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';

class BookingState {
  final ServiceModel? selectedService;
  final String selectedDate;
  final String selectedTimeSlot;
  final String deliveryAddress;
  final BeauticianModel? assignedBeautician;
  final BookingModel? confirmedBooking;

  BookingState({
    this.selectedService,
    this.selectedDate = 'Mon, 03 Aug',
    this.selectedTimeSlot = '11:30 AM - 12:30 PM',
    this.deliveryAddress = 'B-34, Sector L, Kapoorthala Chauraha, Aliganj, Lucknow',
    this.assignedBeautician,
    this.confirmedBooking,
  });

  BookingState copyWith({
    ServiceModel? selectedService,
    String? selectedDate,
    String? selectedTimeSlot,
    String? deliveryAddress,
    BeauticianModel? assignedBeautician,
    BookingModel? confirmedBooking,
  }) {
    return BookingState(
      selectedService: selectedService ?? this.selectedService,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedTimeSlot: selectedTimeSlot ?? this.selectedTimeSlot,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      assignedBeautician: assignedBeautician ?? this.assignedBeautician,
      confirmedBooking: confirmedBooking ?? this.confirmedBooking,
    );
  }
}

class BookingNotifier extends StateNotifier<BookingState> {
  BookingNotifier() : super(BookingState());

  void selectService(ServiceModel service) {
    state = state.copyWith(selectedService: service);
  }

  void selectDate(String date) {
    state = state.copyWith(selectedDate: date);
  }

  void selectTimeSlot(String slot) {
    state = state.copyWith(selectedTimeSlot: slot);
  }

  void updateAddress(String address) {
    state = state.copyWith(deliveryAddress: address);
  }

  void assignBeautician(BeauticianModel beautician) {
    state = state.copyWith(assignedBeautician: beautician);
  }

  void confirmBooking(BookingModel booking) {
    state = state.copyWith(confirmedBooking: booking);
  }
}

final bookingProvider = StateNotifierProvider<BookingNotifier, BookingState>((ref) {
  return BookingNotifier();
});
