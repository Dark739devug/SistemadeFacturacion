package com.CertAPI.backend.controller;

import com.CertAPI.backend.model.Usuario;
import com.CertAPI.backend.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Usuarios", description = "Gestión de usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil", description = "Obtiene el perfil del usuario autenticado")
    public ResponseEntity<Usuario> obtenerPerfil() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Operation(summary = "Listar usuarios", description = "Lista todos los usuarios (solo admin)")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Operation(summary = "Activar usuario", description = "Activa un usuario (solo admin)")
    public ResponseEntity<Usuario> activarUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(true);
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Operation(summary = "Desactivar usuario", description = "Desactiva un usuario (solo admin)")
    public ResponseEntity<Usuario> desactivarUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(false);
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }
}
