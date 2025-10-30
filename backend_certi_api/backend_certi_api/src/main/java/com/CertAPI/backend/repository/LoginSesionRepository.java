package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.LoginSesion;
import com.CertAPI.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginSesionRepository extends JpaRepository<LoginSesion, Long> {
    List<LoginSesion> findByUsuarioAndActivoTrue(Usuario usuario);
    Optional<LoginSesion> findByTokenAndActivoTrue(String token);
}
