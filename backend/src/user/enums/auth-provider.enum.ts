/**
 * Authentication provider enum.
 * Tracks how users originally registered and which authentication methods are available.
 */
export enum AuthProvider {
  /** Email/password registration */
  EMAIL = 'email',
  /** Google OAuth registration */
  GOOGLE = 'google',
  /** GitHub OAuth registration */
  GITHUB = 'github',
  /** Facebook OAuth registration */
  FACEBOOK = 'facebook',
}
