// Fallback redirect for helper pages (the <meta http-equiv="refresh"> does the same).
// Usage: <script src="/assets/js/redirect.js" data-target="/#contact"></script>
(function(){
  var s = document.currentScript;
  var target = (s && s.getAttribute('data-target')) || '/';
  window.location.replace(target);
})();
