package com.CertAPI.backend.service;

import com.CertAPI.backend.dto.LoginRequestDTO;
import com.CertAPI.backend.dto.LoginResponseDTO;
import com.CertAPI.backend.dto.RegisterRequestDTO;
import com.CertAPI.backend.dto.UsuarioUpdateDTO;
import com.CertAPI.backend.exception.BadRequestException;
import com.CertAPI.backend.exception.ResourceNotFoundException;
import com.CertAPI.backend.model.LoginSesion;
import com.CertAPI.backend.model.Rol;
import com.CertAPI.backend.model.Usuario;
import com.CertAPI.backend.repository.LoginSesionRepository;
import com.CertAPI.backend.repository.RolRepository;
import com.CertAPI.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final LoginSesionRepository loginSesionRepository;
    private final RolRepository rolRepository;
    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request, String ip, String dispositivo) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!usuario.getActivo()) {
            throw new BadRequestException("Usuario inactivo");
        }

        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = tokenService.generateToken(authentication);

        LoginSesion sesion = LoginSesion.builder()
                .usuario(usuario)
                .token(token)
                .fechaLogin(LocalDateTime.now())
                .ipOrigen(ip)
                .dispositivo(dispositivo)
                .activo(true)
                .build();

        loginSesionRepository.save(sesion);

        return new LoginResponseDTO(
                token,
                usuario.getUsername(),
                usuario.getRol().getNombre(),
                usuario.getNombreCompleto()
        );
    }

    @Transactional
    public Usuario register(RegisterRequestDTO request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("El nombre de usuario ya existe");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        // ==============================================================
        // BÚSQUEDA MEJORADA Y SEGURA DEL ROL
        // ==============================================================
        Rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new BadRequestException("Rol con ID " + request.getIdRol() + " no encontrado"));

        // Verificación extra de sanidad (aunque el orElseThrow ya lo maneja)
        if (rol == null) {
            throw new BadRequestException("El rol es nulo después de la búsqueda, lo que indica un problema interno de la DB.");
        }
        // ==============================================================

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nombreCompleto(request.getNombreCompleto())
                .rol(rol)
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .tokenVersion(1)
                .build();

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deleteUser(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void logout(String token) {
        LoginSesion sesion = loginSesionRepository.findByTokenAndActivoTrue(token)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));

        sesion.setActivo(false);
        sesion.setFechaLogout(LocalDateTime.now());
        loginSesionRepository.save(sesion);
    }

    @Transactional
    public Usuario actualizarUsuario(Long id, UsuarioUpdateDTO datos) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        usuario.setNombreCompleto(datos.getNombreCompleto());
        usuario.setEmail(datos.getEmail());

        Rol rol = rolRepository.findById(datos.getIdRol())
                .orElseThrow(() -> new BadRequestException("Rol no encontrado"));
        usuario.setRol(rol);

        if (datos.getPassword() != null && !datos.getPassword().trim().isEmpty()) {
            usuario.setPasswordHash(passwordEncoder.encode(datos.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }
}