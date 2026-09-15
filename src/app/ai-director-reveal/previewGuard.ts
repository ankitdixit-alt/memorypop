// Defense in depth; also bind next dev to 127.0.0.1. Host headers are not authentication.
export function isLocalPreview(environment: string | undefined, host: string | null) {
  return environment === 'development' && !!host &&
    /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)
}
