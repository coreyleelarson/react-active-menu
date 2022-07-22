// I was having trouble calculating the actual offsetTop of each section.
// Turns out, the HTMLElement.offsetTop read-only property returns the distance
// of the current element relative to the top of the offsetParent node. In order to
// get the offsetTop from the top of the page, we need to iterate over all the parent
// elements that are references for positioning the element.
//
// The property to get all these elements is offsetParent.
//
// https://medium.com/@alexcambose/js-offsettop-property-is-not-great-and-here-is-why-b79842ef7582
//
const getOffsetTop = (element: HTMLElement | null) => {
  let offsetTop = 0;

  while (element) {
    offsetTop += element.offsetTop;
    element = element.offsetParent as HTMLElement;
  }

  return offsetTop;
};