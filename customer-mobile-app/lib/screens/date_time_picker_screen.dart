import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../providers/booking_provider.dart';
import 'beautician_assignment_screen.dart';

class DateTimePickerScreen extends ConsumerStatefulWidget {
  const DateTimePickerScreen({super.key});

  @override
  ConsumerState<DateTimePickerScreen> createState() => _DateTimePickerScreenState();
}

class _DateTimePickerScreenState extends ConsumerState<DateTimePickerScreen> {
  int _selectedDateIndex = 2; // Mon 03 selected
  String _selectedSlot = '11:30 AM';

  final List<Map<String, String>> _dates = [
    {'day': 'Sat', 'date': '01'},
    {'day': 'Sun', 'date': '02'},
    {'day': 'Mon', 'date': '03'},
    {'day': 'Tue', 'date': '04'},
    {'day': 'Wed', 'date': '05'},
    {'day': 'Thu', 'date': '06'},
    {'day': 'Fri', 'date': '07'},
  ];

  final List<String> _morning = ['09:00 AM', '10:30 AM', '11:30 AM'];
  final List<String> _afternoon = ['02:00 PM', '03:30 PM'];
  final List<String> _evening = ['05:00 PM', '06:30 PM', '08:00 PM'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Select Date & Time'),
        centerTitle: false,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Month Header (Screen 4)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'Aug 2026',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textCharcoal,
                      ),
                    ),
                    Icon(Icons.calendar_month, color: AppColors.primary, size: 20),
                  ],
                ),
                const SizedBox(height: 14),

                // 7-Day Horizontal Date Picker (Screen 4)
                SizedBox(
                  height: 76,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _dates.length,
                    itemBuilder: (context, index) {
                      final item = _dates[index];
                      final isSelected = _selectedDateIndex == index;
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedDateIndex = index);
                          ref.read(bookingProvider.notifier).selectDate('${item['day']}, ${item['date']} Aug');
                        },
                        child: Container(
                          width: 54,
                          margin: const EdgeInsets.only(right: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.borderPink,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary.withOpacity(0.3),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ]
                                : [],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                item['day']!,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: isSelected ? Colors.white70 : AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['date']!,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : AppColors.textCharcoal,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 28),

                // Morning Slots (Screen 4)
                _buildSlotSection('Morning', _morning),

                const SizedBox(height: 20),

                // Afternoon Slots
                _buildSlotSection('Afternoon', _afternoon),

                const SizedBox(height: 20),

                // Evening Slots
                _buildSlotSection('Evening', _evening),
              ],
            ),
          ),

          // Bottom Proceed Button
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(bookingProvider.notifier).selectTimeSlot('$_selectedSlot - 12:30 PM');
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const BeauticianAssignmentScreen(),
                      ),
                    );
                  },
                  child: const Text('Proceed →', style: TextStyle(fontSize: 16)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlotSection(String title, List<String> slots) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.textCharcoal,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: slots.map((slot) {
            final isSelected = _selectedSlot == slot;
            return GestureDetector(
              onTap: () => setState(() => _selectedSlot = slot),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.borderPink,
                  ),
                ),
                child: Text(
                  slot,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : AppColors.textCharcoal,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
