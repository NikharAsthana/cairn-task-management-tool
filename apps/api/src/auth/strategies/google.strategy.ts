// apps/api/src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

// The narrow shape we actually pull out of Google's much larger profile
// object. Keeping this small means the rest of the app depends only on the
// fields we use, not Google's full (and fairly verbose) profile schema.
export interface GoogleProfile {
  googleId: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'], // what we're asking Google's permission to read
    });
  }

  // Passport calls this automatically once Google confirms the user's
  // identity. accessToken/refreshToken exist because Passport's strategy
  // interface always passes them — we don't need either one (we're not
  // making further calls to Google's APIs on the user's behalf), so they're
  // prefixed with `_` to signal "intentionally unused" to ESLint.
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      fullName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, googleProfile);
  }
}
