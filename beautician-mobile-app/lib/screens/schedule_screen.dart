import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  final Map<String, bool> _availability = {
    'Monday': true,
    'Tuesday': true,
    'Wednesday': true,
    'Thursday': true,
    'Friday': true,
    'Saturday': true,
    'Sunday': false,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        title: const Text('My Schedule & Working Days'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: BeauticianColors.borderPink),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Weekly Working Days (Lucknow Hub)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: BeauticianColors.textCharcoal),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Toggle days you are available for doorstep bookings. The auto-assignment algorithm will only route jobs on active days.',
                  style: TextStyle(fontSize: 11, color: BeauticianColors.textMuted),
                ),
                const SizedBox(height: 16),
                ..._availability.entries.map((e) {
                  return SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(e.key, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: Text(e.value ? 'Active (9:00 AM - 7:00 PM)' : 'Off Day', style: const TextStyle(fontSize: 11)),
                    activeColor: BeauticianColors.primary,
                    value: e.value,
                    onChanged: (val) => setState(() => _availability[e.key] = val),
                  );
                }).toList(),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: BeauticianColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
              ),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Weekly availability updated successfully!')),
                );
              },
              child: const Text('Save Schedule'),
            ),
          ),
        ],
      ),
    );
  }
}
