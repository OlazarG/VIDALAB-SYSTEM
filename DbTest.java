import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbTest {
    public static void main(String[] args) {
        // Configuración - MODIFICA ESTOS VALORES SI ES NECESARIO
        String url = "jdbc:postgresql://localhost:5432/DB_VIDALAB_TEST";
        String user = "postgres";
        String password = "postgres"; // <--- Asegúrate que esta sea la correcta

        System.out.println("--------------------------------------------------");
        System.out.println("Iniciando prueba de conexión a PostgreSQL...");
        System.out.println("URL: " + url);
        System.out.println("Usuario: " + user);
        System.out.println("--------------------------------------------------");

        try {
            // Intentar cargar el driver (opcional en versiones nuevas de Java, pero bueno
            // para verificar)
            Class.forName("org.postgresql.Driver");
            System.out.println("[OK] Driver PostgreSQL encontrado.");

            // Intentar conectar
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println("[EXITO] ¡Conexión establecida correctamente!");
                System.out.println("La base de datos está accesible y las credenciales son válidas.");
            } catch (SQLException e) {
                System.out.println("[ERROR] Falló la conexión:");
                System.out.println("Mensaje: " + e.getMessage());
                System.out.println("Estado SQL: " + e.getSQLState());

                if (e.getMessage().contains("password authentication failed")) {
                    System.out.println("\n>>> PISTA: La contraseña o el usuario son incorrectos.");
                } else if (e.getMessage().contains("Connection refused")) {
                    System.out.println("\n>>> PISTA: No se puede conectar al puerto 5432. ¿Está corriendo PostgreSQL?");
                } else if (e.getMessage().contains("database") && e.getMessage().contains("does not exist")) {
                    System.out.println("\n>>> PISTA: La base de datos 'DB_VIDALAB_TEST' no existe.");
                }
            }

        } catch (ClassNotFoundException e) {
            System.out.println("[ERROR] No se encontró el driver de PostgreSQL en el classpath.");
            System.out.println("Asegúrate de ejecutar esto con el driver en el classpath o desde Maven.");
        }
        System.out.println("--------------------------------------------------");
    }
}
