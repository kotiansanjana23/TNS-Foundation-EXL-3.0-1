import java.util.Scanner;

public class MoveUppercase {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();

        StringBuilder lower = new StringBuilder();
        StringBuilder upper = new StringBuilder();

        for (char c : input.toCharArray()) {
            if (Character.isUpperCase(c)) {
                upper.append(c);
            } else {
                lower.append(c);
            }
        }

        System.out.println(lower.toString() + upper.toString());
    }
}

