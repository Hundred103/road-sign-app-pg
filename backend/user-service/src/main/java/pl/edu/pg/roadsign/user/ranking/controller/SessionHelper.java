package pl.edu.pg.roadsign.user.ranking.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public class SessionHelper {
    private static final String SESSION_USER_ID = "userId";

    /**
     * Extract userId from session, with multiple fallbacks
     */
    public static Long extractUserId(HttpServletRequest httpRequest) {
        // First try: Session attribute
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            Object uid = session.getAttribute(SESSION_USER_ID);
            if (uid instanceof Long) {
                return (Long) uid;
            }
        }

        // Second try: Custom header (for testing/debugging)
        String header = httpRequest.getHeader("X-User-ID");
        if (header != null && !header.isEmpty()) {
            try {
                return Long.parseLong(header);
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        // Third try: Query parameter (for testing/debugging)
        String param = httpRequest.getParameter("userId");
        if (param != null && !param.isEmpty()) {
            try {
                return Long.parseLong(param);
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        return null;
    }
}
