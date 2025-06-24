import { describe, it, expect, beforeEach } from "vitest";
import { LoanService } from "./LoanService";
import { Book } from "./Book";
import { User } from "./User";

describe("LoanService", () => {
  let loanService: LoanService;
  let book: Book;
  let user: User;

  beforeEach(() => {
    loanService = new LoanService();
    book = new Book("1", "Les secrets du baobab", "Fatou Diop");
    user = new User("1", "Issa Traoré", "issa@example.com", "standard");
    loanService.addBook(book);
    loanService.addUser(user);
  });

  it("emprunt fait ", () => {
    const result = loanService.borrowBook("1", "1");
    expect(result).toBe(true);
    expect(book.status).toBe("borrowed");
    expect(book.borrowedBy).toBe("1");
    expect(user.currentLoans).toContain("1");
  });

  it("emprunt impossible faute de livre", () => {
    const result = loanService.borrowBook("18", "1");
    expect(result).toBe(false);
  });

  it("emprunt impossible faute de lutilisateur", () => {
    const result = loanService.borrowBook("1", "18");
    expect(result).toBe(false);
  });

  it("emprunt impossible livre déjà pris", () => {
    loanService.borrowBook("1", "1");
    const result = loanService.borrowBook("1", "1");
    expect(result).toBe(false);
  });

  it("retour dans les delais", () => {
    loanService.borrowBook("1", "1", new Date("2024-06-01"));
    const penalty = loanService.returnBook("1", new Date("2024-06-10"));
    expect(penalty).toBe(0);
    expect(book.status).toBe("available");
    expect(book.borrowedBy).toBeUndefined();
  });

  it("retour en retard ", () => {
    loanService.borrowBook("1", "1", new Date("2024-06-01"));
    const penalty = loanService.returnBook("1", new Date("2024-07-10"));
    expect(penalty).toBeGreaterThan(0);
  });

  it("utilisateur a atteint sa limite d'emprunts", () => {
    const utilisateur = new User(
      "42",
      "Aminata Koné",
      "aminata@example.com",
      "standard"
    );
    loanService.addUser(utilisateur);

    const livresPrets = [
      new Book("b1", "Contes d'Afrique de l'Ouest", "Birame Sarr"),
      new Book("b2", "Le griot et la lune", "Nafissatou Diallo"),
      new Book("b3", "Voyage au Bénin", "Modibo Kéïta"),
    ];

    livresPrets.forEach((livre) => {
      livre.status = "borrowed";
      livre.borrowedBy = utilisateur.id;
      loanService.addBook(livre);
      utilisateur.addLoan(livre.id);
    });

    expect(utilisateur.canBorrow()).toBe(false);

    const nouveauLivre = new Book(
      "b4",
      "Légendes du fleuve Niger",
      "Zeinabou Maïga"
    );
    loanService.addBook(nouveauLivre);

    const resultat = loanService.borrowBook("b4", "42");
    expect(resultat).toBe(false);
  });
});
