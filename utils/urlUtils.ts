export type SocialMediaType = 'instagram' | 'facebook' | 'website';

export const detectSocialMedia = (url?: string): SocialMediaType => {
  if (!url) {
    return 'website';
  }
  
  const lowercasedUrl = url.toLowerCase();
  
  if (lowercasedUrl.includes('instagram.com')) {
    return 'instagram';
  }
  
  if (lowercasedUrl.includes('facebook.com')) {
    return 'facebook';
  }
  
  return 'website';
};
