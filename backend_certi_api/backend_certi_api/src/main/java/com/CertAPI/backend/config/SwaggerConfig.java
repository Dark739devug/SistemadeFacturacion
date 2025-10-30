package com.CertAPI.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .components(new Components()
                .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .in(SecurityScheme.In.HEADER)
                    .name("Authorization")))
            .info(new Info()
                .title("API de Certificación FEL Guatemala")
                .version("1.0.0")
                .description("API REST para certificación de Documentos Tributarios Electrónicos (DTE) " +
                           "según el Régimen de Factura Electrónica en Línea (FEL) de Guatemala.\n\n" +
                           "Esta API implementa el proceso completo de certificación:\n" +
                           "1. Recepción de DTE en formato XML con firma electrónica del emisor\n" +
                           "2. Validación de estructura según esquemas oficiales de la SAT\n" +
                           "3. Verificación de firma electrónica del emisor\n" +
                           "4. Aplicación de firma electrónica del certificador\n" +
                           "5. Generación de número de autorización\n" +
                           "6. Envío a la SAT para validación final\n" +
                           "7. Generación de PDF para visualización\n\n" +
                           "Documentación oficial: https://portal.sat.gob.gt/portal/documentacion-tecnica-del-regimen-fel/")
                .contact(new Contact()
                    .name("Soporte Técnico")
                    .email("soporte@certificador.gt"))
                .license(new License()
                    .name("Acuerdo de Directorio 13-2018")
                    .url("https://portal.sat.gob.gt/portal/efactura/")));
    }
}
