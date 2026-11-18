type Styled = { style: { overflow: string } };

// Stops the page from scrolling and returns the undo. The undo puts back whatever was there
// before, so a lock taken while another one is active (say, two dialogs) doesn't free the page.
export function lockScroll(root: Styled): () => void {
  const previous = root.style.overflow;
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = previous;
  };
}
