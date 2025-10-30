package com.CertAPI.backend.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final KeyPair keyPair;

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();

        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        try {
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .issuer("self")
                    .subject(authentication.getName())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plus(8, ChronoUnit.HOURS)))
                    .claim("scope", scope)
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256).build(),
                    claimsSet
            );

            signedJWT.sign(new RSASSASigner((RSAPrivateKey) keyPair.getPrivate()));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Error al generar JWT", e);
        }
    }
}
