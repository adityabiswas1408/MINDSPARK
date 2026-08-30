import sys

file_path = "a:\\MS\\index_complete.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

find_script = """<script>
document.addEventListener("DOMContentLoaded", () => {
  const iframes = document.querySelectorAll("iframe[data-srcdoc]");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.setAttribute("srcdoc", iframe.getAttribute("data-srcdoc"));
        iframe.removeAttribute("data-srcdoc");
        obs.unobserve(iframe);
      }
    });
  }, { rootMargin: "400px" });
  iframes.forEach(iframe => observer.observe(iframe));
});
</script>"""

# We'll just replace it globally with an empty string as requested
content = content.replace(find_script, "")

# It's possible there are \r\n vs \n issues if the file changed endings. Let's do a replace that normalizes to \n first if needed, but since it was written by my own python script previously, it should be matched correctly if the line endings in find_script match.
# find_script uses \n. Let's make sure we handle Windows line endings if the content uses them.
content = content.replace(find_script.replace('\n', '\r\n'), "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup 2 applied.")
