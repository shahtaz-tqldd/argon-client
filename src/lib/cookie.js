// parse JWT token
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

// Function to set token
export function setCookieWithToken(token) {
  const decodedToken = parseJwt(token);

  if (decodedToken) {
    const expiryDateInSeconds = decodedToken.exp;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expiresInDays =
      (expiryDateInSeconds - currentTimeInSeconds) / (60 * 60 * 24);

    document.cookie = `authToken=${token};max-age=${
      expiresInDays * 24 * 60 * 60
    };path=/;secure;samesite=strict`;
  }
}

// Function to get a cookie by key
export function getCookieValue(key) {
  const name = `${encodeURIComponent(key)}=`;
  const cookieArray = document.cookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      const value = cookie.substring(name.length, cookie.length);

      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return null;
}

export function setCookieValue(key, value, { maxAge, path = "/" } = {}) {
  const maxAgeAttribute = Number.isFinite(maxAge) ? `; max-age=${maxAge}` : "";
  const secureAttribute = import.meta.env.PROD ? "; Secure" : "";

  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=${path}${maxAgeAttribute}; SameSite=Lax${secureAttribute}`;
}

// Function to remove cookies
export function removeCookies() {
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;secure;samesite=strict";
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;secure;samesite=strict";
}
