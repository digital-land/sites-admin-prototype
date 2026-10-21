//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
})

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".app-copy-button");
  if (!button) return;

  const input = document.getElementById(button.dataset.copyTarget);
  if (!input) return;

  try {
    await navigator.clipboard.writeText(input.value);
    button.innerText = "Link copied";
  } catch {
    // Fallback for browsers where the Clipboard API is unavailable.
    input.select();
    document.execCommand("copy");
    input.setSelectionRange(0, 0);
    button.innerText = "Link copied";
  }
});