package com.pm.incidentservice.security;

import com.pm.incidentservice.model.User;
import com.pm.incidentservice.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
* Reads a bearer token from the Authorization header and, if it maps to a known
* user, populates the Spring Security context. Requests without a valid token
* are left unauthenticated for downstream authorization rules to handle.
*/
public class TokenAuthenticationFilter extends OncePerRequestFilter {

  private static final String BEARER_PREFIX = "Bearer ";

  private final TokenStore tokenStore;
  private final UserService userService;

  public TokenAuthenticationFilter(TokenStore tokenStore, UserService userService) {
    this.tokenStore = tokenStore;
    this.userService = userService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                  FilterChain filterChain) throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = header.substring(BEARER_PREFIX.length()).trim();
      tokenStore.resolveUsername(token)
          .flatMap(userService::findByUsername)
          .ifPresent(user -> authenticate(user, request));
    }
    filterChain.doFilter(request, response);
  }

  private void authenticate(User user, HttpServletRequest request) {
    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    var authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null, authorities);
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
}
