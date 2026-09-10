import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface BeauticianCandidate {
  beautician: any;
  distanceKm: number;
  score: number;
  breakdown: {
    distanceScore: number;
    ratingScore: number;
    availabilityScore: number;
    skillScore: number;
    experienceScore: number;
  };
}

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate distance between two lat/lng coordinates using Haversine formula
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * BeautyNest Auto-Assignment Scoring Algorithm:
   * Score = (Distance x 30%) + (Rating x 25%) + (Availability x 20%) + (Skill Match x 15%) + (Experience x 10%)
   */
  async findBestBeauticians(
    customerLat: number,
    customerLng: number,
    categoryIds: string[],
    maxRadiusKm: number = 10,
  ): Promise<BeauticianCandidate[]> {
    this.logger.log(`Matching beauticians near (${customerLat}, ${customerLng}) within ${maxRadiusKm}km`);

    // 1. Fetch verified beauticians in the same city
    const beauticians = await this.prisma.beautician.findMany({
      where: {
        isVerified: true,
        kycStatus: 'APPROVED',
      },
      include: {
        user: true,
        skills: {
          include: { category: true },
        },
      },
    });

    const candidates: BeauticianCandidate[] = [];

    for (const b of beauticians) {
      // Lat / Lng fallback to Lucknow city center if unset
      const bLat = b.currentLat ?? 26.8467;
      const bLng = b.currentLng ?? 80.9462;
      const distance = this.calculateDistanceKm(customerLat, customerLng, bLat, bLng);

      // Filter within 10km radius
      if (distance > maxRadiusKm) {
        continue;
      }

      // Metric 1: Distance (Max 30 pts). Closer = higher score (10km = 0, 0km = 30)
      const distanceNorm = Math.max(0, 1 - distance / maxRadiusKm);
      const distanceScore = distanceNorm * 30;

      // Metric 2: Rating (Max 25 pts). 5.0 = 25, 4.0 = 20
      const ratingNorm = (b.rating || 4.5) / 5.0;
      const ratingScore = ratingNorm * 25;

      // Metric 3: Availability (Max 20 pts). Online & not in active job
      const availabilityNorm = b.isOnline ? 1.0 : 0.4;
      const availabilityScore = availabilityNorm * 20;

      // Metric 4: Skill Match (Max 15 pts)
      const beauticianCategoryIds = b.skills.map((s) => s.categoryId);
      const matchedSkills = categoryIds.filter((id) => beauticianCategoryIds.includes(id));
      const skillRatio = categoryIds.length > 0 ? matchedSkills.length / categoryIds.length : 1.0;
      const skillScore = skillRatio * 15;

      // Metric 5: Experience (Max 10 pts). 5+ yrs = 10 pts
      const expNorm = Math.min(1.0, (b.experienceYears || 2) / 5.0);
      const experienceScore = expNorm * 10;

      const totalScore = parseFloat(
        (distanceScore + ratingScore + availabilityScore + skillScore + experienceScore).toFixed(2),
      );

      candidates.push({
        beautician: b,
        distanceKm: distance,
        score: totalScore,
        breakdown: {
          distanceScore: parseFloat(distanceScore.toFixed(2)),
          ratingScore: parseFloat(ratingScore.toFixed(2)),
          availabilityScore: parseFloat(availabilityScore.toFixed(2)),
          skillScore: parseFloat(skillScore.toFixed(2)),
          experienceScore: parseFloat(experienceScore.toFixed(2)),
        },
      });
    }

    // Sort by highest score first
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }
}
