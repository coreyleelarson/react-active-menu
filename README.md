# react-active-menu

A React hook to build an active scrolling menu navigation.

## Installation

```
npm i react-active-menu
```

## Getting Started

Initialize hook:

```javascript
const {
  active,
  registerContainer,
  registerSection,
  registerTrigger,
} = useActiveMenu();
```

Register triggers with unique IDs:

```javascript
<button ref={registerTrigger('section-1')}>
  Section 1
</button>
```

Register sections with unique IDs:

```javascript
<section ref={registerSection('section-1')}>
  <h2>Section 2</h2>
  <p>Lorem ipsum dolor sit amet.</p>
</section>
```

Register scrollable container:

```javascript
<div ref={registerContainer}>
  <section ref={registerSection('section-1')}>
    <h2>Section 2</h2>
    <p>Lorem ipsum dolor sit amet.</p>
  </section>
  <section ref={registerSection('section-1')}>
    <h2>Section 2</h2>
    <p>Lorem ipsum dolor sit amet.</p>
  </section>
</div>
```

## Demos

**Without Container**
[![Edit react-active-menu / Full Screen](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-active-menu-full-screen-ze7slj?fontsize=14&hidenavigation=1&theme=dark)

**With Container**
[![Edit react-active-menu / Containerized](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-active-menu-containerized-gng1rz?fontsize=14&hidenavigation=1&theme=dark)

https://user-images.githubusercontent.com/1900645/176918185-0fbf7484-f703-416f-8a32-fb624b3ea428.mp4
