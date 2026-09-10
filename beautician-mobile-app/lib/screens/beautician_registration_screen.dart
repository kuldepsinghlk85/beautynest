import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'beautician_main_nav.dart';

class BeauticianRegistrationScreen extends StatefulWidget {
  const BeauticianRegistrationScreen({super.key});

  @override
  State<BeauticianRegistrationScreen> createState() => _BeauticianRegistrationScreenState();
}

class _BeauticianRegistrationScreenState extends State<BeauticianRegistrationScreen> {
  final _nameController = TextEditingController(text: 'Ananya Sharma');
  final _phoneController = TextEditingController(text: '+91 98112 23344');
  final _expController = TextEditingController(text: '5');
  final _bioController = TextEditingController(
    text: 'Certified expert in Korean Facials, Painless Waxing, and Skin brightening treatments in Varanasi.',
  );
  final List<String> _selectedSkills = ['Facial', 'Waxing', 'Skin Care'];

  final List<String> _allSkills = [
    'Facial',
    'Hair Care',
    'Waxing',
    'Makeup',
    'Spa',
    'Nails',
    'Skin Care',
    'Bridal',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        title: const Text('Partner Onboarding & KYC'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Join BeautyNest Expert Network',
              style: TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: BeauticianColors.textCharcoal,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Earn 80% commission on every doorstep appointment in Varanasi with flexible work hours.',
              style: TextStyle(fontSize: 12, color: BeauticianColors.textMuted),
            ),
            const SizedBox(height: 20),

            // Profile photo placeholder
            Center(
              child: Stack(
                children: [
                  const CircleAvatar(
                    radius: 44,
                    backgroundImage: NetworkImage(
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      radius: 14,
                      backgroundColor: BeauticianColors.primary,
                      child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Inputs
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name', filled: true, fillColor: Colors.white),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Mobile (+91)', filled: true, fillColor: Colors.white),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _expController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Experience (Years)', filled: true, fillColor: Colors.white),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _bioController,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Professional Bio', filled: true, fillColor: Colors.white),
            ),
            const SizedBox(height: 20),

            // Skills Multi-Select
            const Text('Select Your Primary Skills', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _allSkills.map((skill) {
                final isSelected = _selectedSkills.contains(skill);
                return FilterChip(
                  label: Text(skill, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : Colors.black87)),
                  selected: isSelected,
                  selectedColor: BeauticianColors.primary,
                  checkmarkColor: Colors.white,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedSkills.add(skill);
                      } else {
                        _selectedSkills.remove(skill);
                      }
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // Documents Verification Badges
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: BeauticianColors.borderPink),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('KYC Verification Documents', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.check_circle, size: 16, color: Colors.emerald),
                      SizedBox(width: 8),
                      Text('Aadhaar Card (Front & Back) Uploaded', style: TextStyle(fontSize: 11)),
                    ],
                  ),
                  SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.check_circle, size: 16, color: Colors.emerald),
                      SizedBox(width: 8),
                      Text('Trade Diploma / CIDESCO Certificate Uploaded', style: TextStyle(fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

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
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const BeauticianMainNav()),
                  );
                },
                child: const Text('Complete KYC & Open Partner Portal', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
