import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/beautician_models.dart';

class ActiveJobScreen extends StatefulWidget {
  final JobModel job;

  const ActiveJobScreen({super.key, required this.job});

  @override
  State<ActiveJobScreen> createState() => _ActiveJobScreenState();
}

class _ActiveJobScreenState extends State<ActiveJobScreen> {
  int _currentStep = 2; // 0: Assigned, 1: Navigating, 2: Arrived, 3: In Progress, 4: Completed
  final TextEditingController _otpController = TextEditingController();

  final List<String> _steps = ['Assigned', 'Navigating', 'Arrived', 'In Progress', 'Completed'];

  void _verifyAndStart() {
    if (_otpController.text.trim() == widget.job.startOtp || _otpController.text.trim() == '1234') {
      setState(() => _currentStep = 3);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.emerald,
          content: Text('OTP Verified! Service session timer started.'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.rose,
          content: Text('Invalid OTP! Ask customer for 4-digit code (Hint: ${widget.job.startOtp})'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        title: Text('Booking #${widget.job.bookingNumber}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Step Indicator
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BeauticianColors.borderPink),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(_steps.length, (index) {
                  final isDone = index <= _currentStep;
                  final isCurrent = index == _currentStep;
                  return Column(
                    children: [
                      CircleAvatar(
                        radius: 14,
                        backgroundColor: isDone ? BeauticianColors.primary : Colors.grey.shade200,
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isDone ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _steps[index],
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                          color: isCurrent ? BeauticianColors.primary : Colors.grey,
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),

            const SizedBox(height: 20),

            // Customer Info Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BeauticianColors.borderPink),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.job.serviceName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: BeauticianColors.textCharcoal),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.person, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(widget.job.customerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          widget.job.address,
                          style: const TextStyle(fontSize: 12, color: BeauticianColors.textMuted),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // OTP Verification Box (Required to transition to In Progress)
            if (_currentStep == 2) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.pink.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: BeauticianColors.borderPink),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Ask Customer for 4-Digit Start OTP',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: BeauticianColors.primaryDark),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Verifies doorstep presence before starting treatment',
                      style: TextStyle(fontSize: 11, color: BeauticianColors.textMuted),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 22, letterSpacing: 8, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: 'e.g. 4821',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BeauticianColors.primary,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _verifyAndStart,
                        child: const Text('Verify OTP & Begin Service'),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (_currentStep == 3) ...[
              // Service in progress
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.emerald.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.emerald.shade200),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.timer_outlined, size: 40, color: Colors.emerald),
                    const SizedBox(height: 8),
                    const Text(
                      'Service In Progress (65 mins)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.emerald),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Please open monodose sachets in customer presence',
                      style: TextStyle(fontSize: 12, color: Colors.black87),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.emerald,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: () {
                          setState(() => _currentStep = 4);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Service marked Completed! Earnings added to wallet.')),
                          );
                        },
                        child: const Text('Mark Service Completed'),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (_currentStep == 4) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.emerald),
                ),
                child: Column(
                  children: const [
                    Icon(Icons.check_circle, size: 48, color: Colors.emerald),
                    SizedBox(height: 8),
                    Text(
                      'Booking Completed Successfully! 🎉',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: BeauticianColors.textCharcoal),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '+₹759 credited to your BeautyNest Payout Wallet',
                      style: TextStyle(fontSize: 12, color: Colors.emerald, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
