import sys

file_path = "a:\\MS\\index_complete.html"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Task 2: Remove lines containing `<p class="path">`
new_lines = [line for line in lines if '<p class="path">' not in line]

content = "".join(new_lines)

# Task 1: Remove inner scripts
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
</script>
</body></html>\""""

replace_script = '</body></html>"'

content = content.replace(find_script, replace_script)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup applied.")
