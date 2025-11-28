package com.example.products;

import com.example.products.repository.ProductRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProductsServiceApplication {
  public static void main(String[] args) { SpringApplication.run(ProductsServiceApplication.class, args); }
  @Bean
  public org.springframework.boot.CommandLineRunner initData(ProductRepository repository) {
    return args -> {
      if (repository.count() == 0) {
        repository.save(new Product("Laptop Pro Gamer", "Intel Core i9, 32GB RAM, RTX 4080.", 2499.99, 10, "Electrónica"));
        repository.save(new Product("Monitor UltraWide 34\"", "Panel IPS curvo, 144Hz, HDR400.", 450.00, 15, "Monitores"));
        repository.save(new Product("Teclado Mecánico RGB", "Switches Blue, chasis de aluminio.", 89.50, 40, "Periféricos"));
        repository.save(new Product("Silla Ergonómica", "Soporte lumbar ajustable, reclinable 180°.", 199.99, 8, "Mobiliario"));
        repository.save(new Product("Auriculares Noise Cancelling", "Batería 30h, conexión multipunto.", 120.00, 25, "Audio"));
        repository.save(new Product("Smartphone Flagship", "Cámara 200MP, OLED 120Hz, carga rápida.", 999.00, 20, "Móviles"));
      }
    };
  }
}
