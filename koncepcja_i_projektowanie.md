# Koncepcja i projektowanie

## Ustalenia grupowe dotyczące projektu

### Stack technologiczny

<div style="page-break-inside: avoid;">

```
┌─────────────────────────────────────────────────┐
│  Backend                    Frontend            │
│  ┌──────────┐              ┌──────────┐         │
│  │  Spring  │────REST──────│ Angular  │         │
│  │   Boot   │     API      │          │         │
│  └──────────┘              └──────────┘         │
│       │                         │               │
│       │                         │               │
│  ┌────▼────┐              ┌─────▼─────┐         │
│  │Database │              │   UI/UX   │         │
│  └─────────┘              └───────────┘         │
└─────────────────────────────────────────────────┘
```

</div>

**Backend:** Spring Boot  
**Frontend:** Angular  
**Baza danych:** PostgreSQL
**Assety, obrazy znaków:** PixaBay (stock), Wikimedia

### Struktura aplikacji

<div style="page-break-inside: avoid;">

```
        ┌──────────────────────┐
        │   APLIKACJA GŁÓWNA   │
        └──────────┬───────────┘
                   │
         ┌─────────┴────────┐
         │                  │
    ┌────▼────┐         ┌───▼────┐
    │  KURS   │         │  TEST  │
    └─────────┘         └────────┘
```

</div>

Aplikacja składa się z dwóch głównych modułów:

- **Moduł kursowy (Kurs)** - interaktywna platforma do nauki znaków drogowych z materiałami edukacyjnymi, grafikami i objaśnieniami dostosowanymi do wieku dzieci szkolnych
- **Moduł testowy (Test)** - system sprawdzający wiedzę uczniów z wykorzystaniem różnorodnych typów pytań

---

## Wymagane funkcjonalności

### System użytkowników

- **Rejestracja** - możliwość utworzenia konta dla nowych użytkowników
- **Logowanie** - bezpieczny dostęp do platformy dla zarejestrowanych użytkowników
- **Profile użytkowników** - zapisywanie postępów w nauce i wyników testów

### Moduł kursowy

- Interaktywny materiał edukacyjny o znakach drogowych
- Treści dostosowane do poziomu rozwojowego dzieci w wieku szkolnym
- Podział na kategorie znaków (zakazu, nakazu, ostrzegawcze, informacyjne, itp.)
- Graficzna prezentacja znaków drogowych
- Objaśnienia i przykłady zastosowania poszczególnych znaków
- Możliwość przeglądania materiałów w dowolnej kolejności

### Moduł testowy

- System testów sprawdzających wiedzę o znakach drogowych
- Różnorodne typy pytań:
  - Pytania jednokrotnego wyboru
  - Pytania wielokrotnego wyboru
  - Dopasowywanie znaku do opisu
  - Pytania prawda/fałsz
  - Identyfikacja znaku na podstawie grafiki
- Pytania dostosowane do wieku szkolnego
- Natychmiastowa informacja zwrotna po udzieleniu odpowiedzi
- Podsumowanie wyników po zakończeniu testu

### System rankingowy i baza wyników

<div style="page-break-inside: avoid;">

```
    ╔═══════════════════════════╗
    ║      RANKING KURSANTÓW    ║
    ╠═══════════════════════════╣
    ║  1.  Jan Kowalski  - 95%  ║
    ║  2.  Anna Nowak    - 89%  ║
    ║  3.  Piotr Wiśniewski 85% ║
    ╚═══════════════════════════╝
         │
         ▼
    [Baza danych wyników]
```

</div>

- Ranking najlepszych wyników testów
- Baza danych przechowująca historię wszystkich wyników
- Możliwość śledzenia własnych postępów
- Motywacyjny element rywalizacji

### Panel administracyjny

- Platforma do prostego dodawania nowych materiałów kursowych
- Możliwość tworzenia i edycji pytań testowych
- Zarządzanie bazą znaków drogowych
- Dodawanie i modyfikacja grafik

### Doświadczenie użytkownika (UX/UI)

- Estetyczny, kolorowy i przyjazny dzieciom interfejs użytkownika
- Intuicyjna nawigacja dostosowana do młodszych użytkowników
- Oprawa dźwiękowa:
  - Dźwięki potwierdzenia akcji
  - Pozytywne komunikaty dźwiękowe przy poprawnych odpowiedziach
  - Muzyka w tle (opcjonalna)
- Responsywny design umożliwiający korzystanie na różnych urządzeniach

---

## Etapy realizacji projektu

Projekt został podzielony na dwa etapy realizacji: **CORE (MVP)** oraz **SZLIFOWANIE**.

---

### ETAP 1: CORE (MVP) - Minimalna Wersja Produktu

Pierwszy etap skupia się wyłącznie na podstawowej funkcjonalności edukacyjnej bez systemów wspierających.

**Zakres funkcjonalny:**

1. **Moduł kursowy**
   - Podstawowy zestaw znaków drogowych z opisami
   - Przeglądanie materiałów edukacyjnych
   - Podział na kategorie znaków (zakazu, nakazu, ostrzegawcze, informacyjne)
   - Graficzna prezentacja znaków

2. **Moduł testowy**
   - Funkcjonalny system testów
   - Minimum 2-3 typy pytań (jednokrotnego wyboru, identyfikacja znaku)
   - Wyświetlanie wyników bezpośrednio po teście

3. **Frontend aplikacji**
   - Funkcjonalny i czytelny interfejs
   - Przejrzysta struktura nawigacji
   - Podstawowa funkcjonalność bez zaawansowanych efektów wizualnych
   - **Brak wymagań estetycznych** - priorytetem jest czytelność i funkcjonalność

**Czego NIE MA w etapie CORE:**
- System logowania i rejestracji
- Baza danych użytkowników
- Zapisywanie wyników testów
- System rankingowy
- Zaawansowana oprawa wizualna
- Oprawa dźwiękowa

---

### ETAP 2: SZLIFOWANIE - Rozbudowa i upiększanie

Drugi etap wprowadza systemy wspierające, bazę danych oraz elementy motywacyjne i estetyczne.

**Zakres funkcjonalny:**

1. **System użytkowników i autoryzacji**
   - Rejestracja użytkowników
   - Logowanie i zarządzanie sesjami
   - Profile użytkowników

2. **Baza danych i persystencja**
   - Zapisywanie wyników testów
   - Historia postępów użytkownika
   - Baza danych wyników wszystkich użytkowników

3. **System rankingowy**
   - Ranking najlepszych wyników
   - Porównywanie wyników z innymi użytkownikami
   - Motywacyjny element rywalizacji

4. **Oprawa wizualna i dźwiękowa**
   - Estetyczny, kolorowy interfejs dostosowany do dzieci
   - Animacje i efekty wizualne
   - Dźwięki potwierdzenia akcji
   - Pozytywne komunikaty dźwiękowe
   - Muzyka w tle

5. **Rozszerzenia funkcjonalne**
   - Dodatkowe typy pytań testowych
   - Rozszerzony zestaw materiałów edukacyjnych
   - Zaawansowane statystyki postępów

---

## Przepływ użytkownika

### Przepływ w ETAPIE 1 (CORE/MVP):

<div style="page-break-inside: avoid;">

```
START
  │
  ▼
┌──────────────┐
│ Panel Główny │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│ KURS │ │ TEST │
└──────┘ └───┬──┘
             │
             ▼
         ┌────────┐
         │ Wyniki │
         └────────┘
            │
            ▼
          END
```

</div>

**Opis ścieżek (CORE):**
1. **Panel główny** - bezpośredni dostęp, wybór między kursem a testem
2. **Kurs** - przeglądanie materiałów o znakach drogowych
3. **Test** - rozwiązanie testu sprawdzającego wiedzę
4. **Wyniki** - wyświetlenie wyniku bezpośrednio po zakończeniu testu

---

### Przepływ w ETAPIE 2 (SZLIFOWANIE) - z pełną funkcjonalnością:

<div style="page-break-inside: avoid;">

```
START
  │
  ▼
┌─────────────┐
│ Rejestracja │
│ / Logowanie │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Panel Główny │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│ KURS │ │ TEST │
└───┬──┘ └──┬───┘
    │       │
    │       ▼
    │    ┌────────┐
    │    │ Wyniki │
    │    └────┬───┘
    │         │
    │         ▼
    │    ┌─────────┐
    │    │ Ranking │
    │    └─────────┘
    │
    ▼
  END
```

</div>

**Opis ścieżek (pełna wersja):**
1. **Rejestracja/Logowanie** - użytkownik tworzy konto lub loguje się
2. **Panel główny** - wybór między modułem kursowym a testowym
3. **Kurs** - nauka materiału o znakach drogowych
4. **Test** - rozwiązanie testu sprawdzającego wiedzę
5. **Wyniki** - przegląd wyników testu zapisanych w bazie danych
6. **Ranking** - porównanie swoich wyników z innymi użytkownikami

