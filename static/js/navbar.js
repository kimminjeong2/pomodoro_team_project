window.addEventListener("load", function () {
  const navButtons = this.document.querySelectorAll(".navbar > li > a");
  const svgIcons = this.document.querySelectorAll(".navbar > li > a > svg");
  let currentPath = window.location.pathname;
  navButtons.forEach((item, index) => {
    if (item.getAttribute("href") === currentPath) {
      svgIcons[index].setAttribute("fill", "#DA2337");
      svgIcons[index].classList.add("active");
      item.style.color = "#DA2337";
    }
  });
});
