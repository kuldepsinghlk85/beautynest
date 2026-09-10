import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ReviewRatingScreen extends StatefulWidget {
  const ReviewRatingScreen({super.key});

  @override
  State<ReviewRatingScreen> createState() => _ReviewRatingScreenState();
}

class _ReviewRatingScreenState extends State<ReviewRatingScreen> {
  int _rating = 5;
  final TextEditingController _commentController = TextEditingController(
    text: 'Wonderful doorstep service! Ananya was punctual, extremely polite, and my facial glow was instantly noticeable.',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Rate Your Experience'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage(
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'How was your session with Ananya?',
              style: TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textCharcoal,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Korean Facial Ritual • Completed',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),

            // 5 Stars
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starNum = index + 1;
                return IconButton(
                  icon: Icon(
                    starNum <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: Colors.amber,
                    size: 36,
                  ),
                  onPressed: () => setState(() => _rating = starNum),
                );
              }),
            ),
            const SizedBox(height: 24),

            // Review text input
            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                hintText: 'Write your honest feedback to help other women in Lucknow...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.borderPink),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Add photo trigger
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.borderPink),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                backgroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onPressed: () {},
              icon: const Icon(Icons.add_a_photo_outlined, size: 18),
              label: const Text('Add Before / After Photos', style: TextStyle(fontSize: 12)),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      backgroundColor: AppColors.primary,
                      content: Text('Thank you! Your verified review has been published.'),
                    ),
                  );
                  Navigator.pop(context);
                },
                child: const Text('Submit Review', style: TextStyle(fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
