export enum ErrorType {
  INVALID_TOKEN = 'invalid_token',
  ACCESS_TOKEN_EXPIRED = 'access_token_expired',
  REFRESH_TOKEN_EXPIRED = 'refresh_token_expired',
  PERMISSION_EXISTS = 'permission_exists',
  ROLE_EXISTS = 'role_exists',
  USER_EXISTS = 'user_exists',
  INVALID_CURRENT_PASSWORD = 'invalid_current_password',
  INVALID_CREDENTIALS = 'invalid_credentials',
  BLOCKED_USER = 'blocked_user',
  INACTIVE_USER = 'inactive_user',
  FOREIGN_KEY_CONFLICT = 'foreign_key_conflict',
  VALIDATION_ERROR = 'validation_error',
}
