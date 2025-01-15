# Plan für die Reisekosten-App

## 1. Basis-Funktionen
- [ ] **Bild-Upload**:
  - [ ] File-Input mit Vorschaufunktion.
  - [ ] Validierung: Nur folgende Bildformate erlauben: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`.
- [ ] **Betrag-Input**:
  - [ ] Pflichtfeld mit Minimalwert `> 0`.
  - [ ] Validierung: Fehlermeldung, wenn das Feld leer bleibt.
- [ ] **Optionale Felder**:
  - [ ] Beschreibung (Textfeld).
  - [ ] Kategorie (Dropdown, z. B. Reise, Unterkunft, Verpflegung).

---

## 2. Zusätzliche Funktionen
- [ ] **Vorschau der Eingaben**:
  - [ ] Nach dem Hochladen und Ausfüllen soll eine Vorschau angezeigt werden:
    - [ ] Bild anzeigen.
    - [ ] Betrag und optionale Felder sichtbar machen.
- [ ] **Einträge bearbeiten**:
  - [ ] Nutzer können bestehende Einträge auf der Übersichtsseite ändern:
    - [ ] Bild austauschen.
    - [ ] Betrag anpassen.
    - [ ] Beschreibung und Kategorie ändern.
- [ ] **Einträge löschen**:
  - [ ] Möglichkeit, Einträge zu entfernen:
    - [ ] Löschen-Button neben jedem Eintrag in der Übersicht.

---

## 3. Seitenstruktur
- [ ] `/`: **Dashboard** mit Eintragsübersicht.
  - [ ] Platzhalter-Komponente für "Noch keine Daten verfügbar".
  - [ ] Kachel-Komponenten für Einträge (Bild, Betrag, optional Beschreibung).
- [ ] `/upload`: **Hochladen-Seite**.
  - [ ] Formular mit Pflichtfeldern (Bild, Betrag) und Vorschau.
  - [ ] Bestätigungs- oder Fehlermeldungen nach dem Abschicken.
- [ ] `/entries`: **Datenübersicht** (optional).
  - [ ] Tabelle oder Liste mit allen hochgeladenen Einträgen.
  - [ ] Buttons zum Bearbeiten und Löschen.

---

## 4. Design und UX
- [ ] **Navigation**:
  - [ ] Links zu `/`, `/upload`, `/entries`.
  - [ ] Aktiver Link hervorheben.
- [ ] **Styling mit Tailwind CSS**:
  - [ ] Responsives Layout.
  - [ ] Farben und Design ansprechend gestalten.
