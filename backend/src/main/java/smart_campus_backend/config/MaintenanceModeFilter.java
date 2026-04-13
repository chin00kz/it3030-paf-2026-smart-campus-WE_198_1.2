package smart_campus_backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import smart_campus_backend.service.SystemSettingService;
import smart_campus_backend.model.Role;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class MaintenanceModeFilter extends OncePerRequestFilter {

    private final SystemSettingService systemSettingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Allow access to auth, maintenance status, and H2/static if applicable
        if (path.startsWith("/api/auth/") || 
            path.equals("/api/settings/maintenance") || 
            !path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (systemSettingService.isMaintenanceMode()) {
            // Check for admin role in headers (this assumes the frontend sends user info or we are using JWT)
            // Since we use mock-jwt for now, let's look for a custom header for role or just block all non-auth
            // In a real app, we'd extract the role from the SecurityContext
            
            // For now, let's check a header or allow it if the request is coming from an admin-only path
            // Better: If we have a security context, check it.
            
            // NOTE: This implementation depends on how you handle session/JWT.
            // If the frontend handles the redirect based on the status code, this is perfect.
            
            String userRole = request.getHeader("X-User-Role");
            if (userRole == null || (!userRole.equals("ADMIN") && !userRole.equals("SUPER_ADMIN"))) {
                response.setStatus(503); // Service Unavailable
                response.getWriter().write("System is in maintenance mode");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
