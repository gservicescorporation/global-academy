export const scrollToSection = (
  id: string,
  position: "start" | "end" = "start"
) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: position });
  }
};
