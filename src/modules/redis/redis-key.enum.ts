export enum RedisServiceName {
  AUTH = 'auth',
  USER = 'user',
  TRACK = 'track',
  ALBUM = 'album',
  ARTIST = 'artist',
  PLAYLIST = 'playlist',
  NOTIFICATION = 'notification',
  CACHE = 'cache',
}

export enum RedisItemName {
  // Auth related
  REFRESH_TOKEN = 'refresh_token',
  ACCESS_TOKEN = 'access_token',
  VERIFICATION_CODE = 'verification_code',
  RESET_PASSWORD = 'reset_password',
  SESSION = 'session',

  // User related
  PROFILE = 'profile',
  PREFERENCES = 'preferences',
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',

  // Media related
  METADATA = 'metadata',
  STATS = 'stats',
  LIKES = 'likes',
  VIEWS = 'views',
  COMMENTS = 'comments',

  // Cache related
  API_RESPONSE = 'api_response',
  HOME_FEED = 'home_feed',
  SEARCH_RESULTS = 'search_results',
}
