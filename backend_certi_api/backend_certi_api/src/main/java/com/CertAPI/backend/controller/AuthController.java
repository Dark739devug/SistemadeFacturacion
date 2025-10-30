package com.CertAPI.backend.controller;

import com.CertAPI.backend.dto.LoginRequestDTO;
import com.CertAPI.backend.dto.LoginResponseDTO;
import com.CertAPI.backend.dto.RegisterRequestDTO;
import com.CertAPI.backend.model.Usuario;
import com.CertAPI.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para autenticación y registro")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        String dispositivo = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(authService.login(request, ip, dispositivo));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Registra un nuevo usuario en el sistema")
    public ResponseEntity<Usuario> register(@Valid @RequestBody RegisterRequestDTO request) {
        // Ahora devuelve Usuario, no LoginResponseDTO
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión", description = "Invalida el token actual del usuario")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok("Sesión cerrada exitosamente");
    }

    @DeleteMapping("/delete/{idUsuario}")
    @Operation(summary = "Eliminar usuario (lógico)", description = "Marca un usuario como inactivo")
    public ResponseEntity<String> deleteUser(@PathVariable Long idUsuario) {
        authService.deleteUser(idUsuario);
        return ResponseEntity.ok("Usuario eliminado exitosamente (lógicamente)");
    }
}
