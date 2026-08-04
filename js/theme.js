/**
 * theme.js — Bascule mode clair / sombre.
 * L'attribut data-theme est déjà posé sur <html> par un script inline dans
 * le <head> (pour éviter tout flash au chargement). Ici on gère le bouton
 * et la persistance.
 */
(function () {
    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('#themeToggle i').forEach(function (icon) {
            icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        });
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.setAttribute('aria-label', theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        apply(currentTheme());

        var btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var next = currentTheme() === 'light' ? 'dark' : 'light';
            try { localStorage.setItem('theme', next); } catch (e) { /* stockage indisponible */ }
            apply(next);
        });
    });
})();
