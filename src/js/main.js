'use strict';

/**
 * Dieses Skript lädt eine JSON-Datei (data/images.json) und erzeugt daraus
 * eine Bildergalerie innerhalb von <div class="gallery"> ... <ul class="results">.
 *
 * Hinweise:
 * - Dieses Skript ist für moderne Browser gedacht und nutzt u. a. async/await und const/let.
 * - Wenn du die HTML-Datei direkt über file:// öffnest, kann fetch wegen Browser-Sicherheitsregeln scheitern.
 *   Starte in diesem Fall bitte einen kleinen lokalen Webserver (z. B. via IDE, Node, PHP oder Python).
 */
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
});

/**
 * Lädt die Bilddaten und rendert die Galerie.
 */
async function initGallery() {
  // 1) Ziel-Element finden: die UL in der Galerie, in die wir LI-Elemente einfügen
  const galleryList = document.querySelector('div.gallery ul.results');

  // Falls das benötigte Element nicht existiert, sauber abbrechen
  if (!galleryList) {
    console.error('Galerie-Liste (.gallery .results) wurde nicht gefunden.');
    return;
  }

  try {
    // 2) JSON-Datei laden. "no-store" verhindert, dass der Browser alte Daten aus dem Cache liefert.
    const response = await fetch('data/images.json', { cache: 'no-store' });

    // Prüfen, ob die Antwort vom Server OK war (Status 200–299)
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status} ${response.statusText}`);
    }

    // 3) JSON in ein JavaScript-Array umwandeln
    const images = await response.json();

    // Erwartet wird ein Array von Objekten: [{ file, title, alt }, ...]
    if (!Array.isArray(images)) {
      throw new Error('Unerwartetes Datenformat: Es wurde kein Array empfangen.');
    }

    // 4) Bestehenden Inhalt leeren, damit wir frisch rendern
    galleryList.innerHTML = '';

    // Ein DocumentFragment ist eine schnelle, performante Sammelstelle für DOM-Knoten
    const fragment = document.createDocumentFragment();

    // 5) Für jeden Eintrag ein <li><a><img></a></li> erzeugen und ins Fragment einfügen
    for (const item of images) {
      // Skippe Einträge ohne "file"
      if (!item || !item.file) continue;

      // Nutze sinnvolle Fallbacks für title/alt
      const file = String(item.file);
      const title = String(item.title ?? '').trim();
      const alt = String(item.alt ?? (title || 'Bild')).trim();

      // <li class="result">
      const li = document.createElement('li');
      li.className = 'result';

      // <a href="...">; encodeURI hilft bei Dateinamen mit Leerzeichen/sonderzeichen
      const link = document.createElement('a');
      link.href = encodeURI(file);
      if (title) link.title = title;

      // <img src="..." alt="..." loading="lazy" decoding="async">
      const img = document.createElement('img');
      img.src = encodeURI(file);
      img.alt = alt;
      // Moderne Browser-Optimierungen:
      img.loading = 'lazy';   // Bilder erst laden, wenn sie in Sichtweite kommen
      img.decoding = 'async'; // Bilddekodierung asynchron durchführen

      // Baue die DOM-Struktur zusammen
      link.appendChild(img);
      li.appendChild(link);
      fragment.appendChild(li);
    }

    // 6) Zum Schluss alles in einem Rutsch ins DOM hängen
    galleryList.appendChild(fragment);
  } catch (error) {
    // Fehler freundlich behandeln und eine kurze Info in die Galerie schreiben
    console.error('Fehler beim Laden der Bilder:', error);

    galleryList.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'result';
    li.textContent = 'Fehler beim Laden der Galerie. Bitte später erneut versuchen.';
    galleryList.appendChild(li);
  }
}