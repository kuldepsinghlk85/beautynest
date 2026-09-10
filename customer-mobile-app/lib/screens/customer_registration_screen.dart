import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'main_navigation_screen.dart';

class CustomerRegistrationScreen extends StatefulWidget {
  const CustomerRegistrationScreen({super.key});

  @override
  State<CustomerRegistrationScreen> createState() => _CustomerRegistrationScreenState();
}

class _CustomerRegistrationScreenState extends State<CustomerRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _landmarkController = TextEditingController();
  final TextEditingController _pincodeController = TextEditingController(text: '221005');

  final List<String> _varanasiAreas = [
    'Sigra',
    'Lanka (BHU)',
    'Assi Ghat',
    'Godowlia',
    'Dashashwamedh',
    'Bhelupur',
    'Varanasi Cantt',
    'Shivpur',
    'Mahmoorganj',
    'Orderly Bazar',
    'Pandeypur',
    'Sarnath',
    'Durgakund',
    'Luxa',
    'Rathyatra',
    'Maldahiya',
    'Chowk',
    'Nadesar',
    'Paharia',
    'Ramnagar',
  ];

  late String _selectedArea;
  String _preferredService = 'Facial & Clean Up';
  bool _isLoading = false;
  bool _agreedToTerms = true;

  @override
  void initState() {
    super.initState();
    _selectedArea = _varanasiAreas[0];
  }

  void _handleRegister() {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.primary,
          content: Text('Please accept the Ladies Safety & Care terms.'),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      setState(() => _isLoading = false);

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: Colors.green, size: 28),
              SizedBox(width: 8),
              Text(
                'Registration Complete!',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome ${_nameController.text}! Your BeautyNest account for $_selectedArea, Varanasi has been activated.',
                style: const TextStyle(fontSize: 13, color: AppColors.textCharcoal),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderPink),
                ),
                child: Row(
                  children: const [
                    Text('🎁', style: TextStyle(fontSize: 20)),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '₹200 Welcome Bonus credited to your wallet!',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
                );
              },
              child: const Text('Start Pampering'),
            ),
          ],
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('New Customer Registration'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Varanasi Header Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.pink.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderPink),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.location_on, color: AppColors.primary, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Varanasi Ladies Doorstep Salon',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              const Text(
                'Create Your Profile',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textCharcoal,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Get verified female salon specialists delivered to your home in Varanasi.',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 24),

              // Full Name
              TextFormField(
                controller: _nameController,
                validator: (val) => val == null || val.isEmpty ? 'Please enter your name' : null,
                decoration: InputDecoration(
                  labelText: 'Full Name (Female Customer) *',
                  prefixIcon: const Icon(Icons.person_outline, color: AppColors.primary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Phone Number
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                validator: (val) => val == null || val.length < 10 ? 'Enter valid 10-digit number' : null,
                decoration: InputDecoration(
                  labelText: 'Mobile Number *',
                  prefixIcon: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    child: Text(
                      '🇮🇳 +91',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Email
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address (Optional)',
                  prefixIcon: const Icon(Icons.email_outlined, color: AppColors.primary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Varanasi Major Area Dropdown
              DropdownButtonFormField<String>(
                value: _selectedArea,
                items: _varanasiAreas.map((area) {
                  return DropdownMenuItem(
                    value: area,
                    child: Text('$area, Varanasi'),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedArea = val);
                },
                decoration: InputDecoration(
                  labelText: 'Select Varanasi Operational Area *',
                  prefixIcon: const Icon(Icons.location_city, color: AppColors.primary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Doorstep Address
              TextFormField(
                controller: _addressController,
                maxLines: 2,
                validator: (val) => val == null || val.isEmpty ? 'Please enter your address' : null,
                decoration: InputDecoration(
                  labelText: 'Doorstep Address (Flat, House No, Society) *',
                  prefixIcon: const Icon(Icons.home_outlined, color: AppColors.primary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Landmark & Pincode
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _landmarkController,
                      decoration: InputDecoration(
                        labelText: 'Landmark',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderPink),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 120,
                    child: TextFormField(
                      controller: _pincodeController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Pincode',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.borderPink),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Primary Beauty Service Interest
              DropdownButtonFormField<String>(
                value: _preferredService,
                items: const [
                  DropdownMenuItem(value: 'Facial & Clean Up', child: Text('Facial & Clean Up (O3+ / Korean)')),
                  DropdownMenuItem(value: 'Waxing', child: Text('Waxing (Rica / Honey / Bikini)')),
                  DropdownMenuItem(value: 'Hair Care & Spa', child: Text('Hair Care & Spa (L\'Oreal / Botox)')),
                  DropdownMenuItem(value: 'Bleach & D-Tan', child: Text('Bleach & D-Tan (Sara Oxy)')),
                  DropdownMenuItem(value: 'Manicure & Pedicure', child: Text('Manicure & Pedicure (Crystal Spa)')),
                  DropdownMenuItem(value: 'Bridal & Party Makeup', child: Text('Bridal & Party Makeup (HD Airbrush)')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _preferredService = val);
                },
                decoration: InputDecoration(
                  labelText: 'Primary Service Needed',
                  prefixIcon: const Icon(Icons.auto_awesome, color: AppColors.primary),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderPink),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Safety & Terms
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _agreedToTerms,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _agreedToTerms = val ?? false),
                  ),
                  const Expanded(
                    child: Text(
                      'I confirm that I am a female customer residing in Varanasi, and agree to the BeautyNest Doorstep Safety & Hygiene terms.',
                      style: TextStyle(fontSize: 11, color: AppColors.textCharcoal),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Register Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Complete Registration & Claim ₹200'),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
