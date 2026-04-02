import java.io.*;
import java.util.*;

class Product {
    String name;
    double sugar;
    double fat;
    double protein;
    double carbs;

    public Product(String name, double sugar, double fat, double protein, double carbs) {
        this.name = name;
        this.sugar = sugar;
        this.fat = fat;
        this.protein = protein;
        this.carbs = carbs;
    }
}

public class PickWiseApp {

    static List<Product> products = new ArrayList<>();

    public static void main(String[] args) {
        loadCSV("Base limpia.csv");

        Scanner sc = new Scanner(System.in);

        System.out.println("🔍 Escribe el nombre del producto:");
        String input = sc.nextLine();

        List<Product> results = searchProducts(input);

        if (results.size() < 2) {
            System.out.println("No hay suficientes productos para comparar.");
            return;
        }

        Product p1 = results.get(0);
        Product p2 = results.get(1);

        compareProducts(p1, p2);
    }

    static void loadCSV(String filePath) {
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            br.readLine(); // saltar encabezado

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");

                String name = data[1];

                double fat = parse(data[3]);
                double carbs = parse(data[5]);
                double sugar = parse(data[6]);
                double protein = parse(data[7]);

                products.add(new Product(name, sugar, fat, protein, carbs));
            }

            System.out.println("✅ Productos cargados: " + products.size());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static double parse(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 0;
        }
    }

    static List<Product> searchProducts(String keyword) {
        List<Product> result = new ArrayList<>();

        for (Product p : products) {
            if (p.name.toLowerCase().contains(keyword.toLowerCase())) {
                result.add(p);
            }
        }

        return result;
    }

    static void compareProducts(Product p1, Product p2) {
        System.out.println("\n📊 Comparando:");
        System.out.println(p1.name + " VS " + p2.name);

        int score1 = score(p1);
        int score2 = score(p2);

        if (score1 > score2) {
            explain(p1, p2);
        } else {
            explain(p2, p1);
        }
    }

    static int score(Product p) {
        int score = 0;

        // menos azúcar mejor
        score += (int)(100 - p.sugar);

        // menos grasa mejor
        score += (int)(100 - p.fat);

        // más proteína mejor
        score += (int)(p.protein * 2);

        return score;
    }

    static void explain(Product better, Product worse) {
        System.out.println("\n🏆 Mejor opción: " + better.name);

        if (better.sugar < worse.sugar) {
            System.out.println("✔ Tiene menos azúcar");
        }

        if (better.fat < worse.fat) {
            System.out.println("✔ Tiene menos grasa");
        }

        if (better.protein > worse.protein) {
            System.out.println("✔ Tiene más proteína");
        }

        System.out.println("\n💡 Alternativa menos saludable: " + worse.name);
    }
}