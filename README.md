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
  handleTriggerClick,
  registerSectionRef,
  registerTriggerRef,
} = useActiveMenu();
```

Register triggers with unique IDs:

```javascript
<button
  className={active === 'section-1' ? 'active' : undefined}
  onClick={handleTriggerClick('section-1')}
  ref={registerTriggerRef('section-1')}
>
  Section 1
</button>
```

Register sections with unique IDs:

```javascript
<section ref={registerSectionRef('section-1')}>
  <h2>Section 2</h2>
  <p>Lorem ipsum dolor sit amet.</p>
</button>
```

## Demo

[![Edit brave-jackson-gng1rz](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/brave-jackson-gng1rz?fontsize=14&hidenavigation=1&theme=dark&view=preview)

https://user-images.githubusercontent.com/1900645/176918185-0fbf7484-f703-416f-8a32-fb624b3ea428.mp4
