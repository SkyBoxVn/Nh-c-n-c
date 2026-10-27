export interface FountainTheme {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  laserColor: string;
  waterColor: string;
  fogColor: string;
  description: string;
}

export interface LyricLine {
  time: number; // in seconds
  duration: number;
  text: string;
  pinyinOrTone?: string;
  targetPitch?: number; // target pitch in Hz for matching bonus
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number; // seconds
  themeId: string;
  chords: string[];
  lyrics: LyricLine[];
  description: string;
}

export interface SingingPerformance {
  playerName: string;
  songTitle: string;
  maxHeightMeters: number;
  currentHeightMeters: number;
  peakDb: number;
  avgDb: number;
  score: number;
  singingStability: number; // 0-100%
  laserIntensity: number; // 0-1
  rankTitle: string;
  unlockedVoucher?: RestaurantVoucher;
}

export interface RestaurantVoucher {
  id: string;
  brand: string;
  brandLogo: string;
  title: string;
  discountValue: string;
  minSpend: string;
  code: string;
  qrCodeUrl: string;
  expiryDate: string;
  tier: 'Grand' | 'Gold' | 'Silver' | 'Bronze';
  terms: string[];
  applicableLocations: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  songTitle: string;
  heightMeters: number;
  score: number;
  peakDb: number;
  themeName: string;
  date: string;
  voucherEarned: string;
}

export type CameraViewMode = 'front_vip' | 'drone' | 'laser_focus' | 'top_down' | 'orbit';
