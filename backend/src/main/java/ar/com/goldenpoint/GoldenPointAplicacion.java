package ar.com.goldenpoint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan // registra las clases @ConfigurationProperties, como PropiedadesTienda
@EnableAsync // permite enviar los mails en segundo plano (@Async)
public class GoldenPointAplicacion {

    public static void main(String[] args) {
        SpringApplication.run(GoldenPointAplicacion.class, args);
    }
}
