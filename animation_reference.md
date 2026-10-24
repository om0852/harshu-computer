## Integrate the <ScrollReveal /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: ScrollReveal
### Variant: JavaScript + CSS
### Dependencies: gsap

---

### Usage Example
```jsx
import ScrollReveal from './ScrollReveal';

<ScrollReveal
  highlightColor=null
  mode="scrub"
  splitBy="words"
  effect="fade"
  stagger={0.05}
  duration={0.8}
  smoothing={0}
  baseOpacity={0.1}
  baseRotation={3}
  baseOffset={0}
  enableBlur={true}
  blurStrength={4}
>
  When does a man die? When he is hit by a bullet? No! When he suffers a disease?
  No! When he ate a soup made out of a poisonous mushroom?
  No! A man dies when he is forgotten!
</ScrollReveal>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | The text to reveal. Plain text is split into words, characters or lines, anything else is revealed as one piece. |
| scrollContainerRef | RefObject<HTMLElement> | window | Ref to the element that scrolls. Leave it out to use the page. |
| highlightColor | string | '' | Accent each word lights up to while it is being revealed, before it settles to the text color. Leave empty for no highlight. |
| mode | 'scrub' | 'enter' | 'scrub' | 'scrub' ties the reveal to the scroll position, 'enter' plays it once when the text scrolls into view. |
| splitBy | 'words' | 'chars' | 'lines' | 'words' | What each step of the reveal is. 'lines' groups the words of each rendered line and regroups on resize. |
| effect | 'fade' | 'rise' | 'flip' | 'scale' | 'fade' | How each piece appears. 'fade' brightens in place, 'rise' slides up from behind its own baseline, 'flip' stands up from flat and 'scale' pops up from small. |
| stagger | number | 0.05 | Spacing between pieces. Higher values reveal them one at a time instead of in a soft wave. In enter mode it is in seconds. |
| duration | number | 0.8 | Seconds each piece takes to appear when mode is 'enter'. |
| smoothing | number | 0 | Seconds the reveal takes to catch up with the scroll. 0 ties it to the scroll directly. |
| enableBlur | boolean | true | Starts each piece out of focus and sharpens it as it appears. |
| blurStrength | number | 4 | How blurred the pieces start, in px. |
| baseOpacity | number | 0.1 | Opacity of the pieces before they are revealed, from 0 to 1. |
| baseRotation | number | 3 | Tilt of the whole block before it levels out, in degrees. 0 keeps it level. |
| baseOffset | number | 0 | How far below its place each piece starts, in px. Pieces rise into place as they appear. |
| rotationEnd | string | 'bottom bottom' | Scroll position where the block finishes leveling out in scrub mode, in ScrollTrigger syntax. |
| wordAnimationEnd | string | 'bottom bottom' | Scroll position where every piece is fully revealed in scrub mode. Text near the end of the page still finishes. |
| containerClassName | string | '' | Extra class names for the heading. |
| textClassName | string | '' | Extra class names for the text. |

### Full Component Source
```jsx
'use client';

import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SCRUB_SPAN = 0.5;
const RISE_MASK = 'inset(-1em -1em -0.15em -1em)';

const clampToScroll = position =>
  typeof position === 'string' && !position.startsWith('clamp(') ? `clamp(${position})` : position;

const clamp01 = value => Math.min(Math.max(value, 0), 1);
const smooth = value => value * value * (3 - 2 * value);
const easeOut = value => 1 - Math.pow(1 - value, 3);
const easeBack = (value, overshoot) => {
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
};
const glowAt = t => (t <= 0 || t >= 1 ? 0 : t < 0.35 ? smooth(t / 0.35) : 1 - smooth((t - 0.35) / 0.65));

const paintPiece = (piece, t, look) => {
  let reveal = t;
  let fadeIn = t;
  let motion = '';
  if (look.effect === 'rise') {
    reveal = easeOut(t);
    fadeIn = clamp01(reveal * 1.25);
    if (reveal < 1) {
      motion = look.masked
        ? `translateY(${((1 - reveal) * 100).toFixed(2)}%) translateY(${((1 - reveal) * 0.2).toFixed(3)}em)`
        : `translateY(${((1 - reveal) * 0.8).toFixed(3)}em)`;
    }
  } else if (look.effect === 'flip') {
    reveal = easeBack(t, 1.2);
    fadeIn = clamp01(t * 2);
    if (t < 1) motion = `perspective(6em) rotateX(${((1 - reveal) * 90).toFixed(2)}deg)`;
  } else if (look.effect === 'scale') {
    reveal = easeBack(t, 1.6);
    fadeIn = clamp01(t * 1.6);
    if (t < 1) motion = `scale(${(0.35 + 0.65 * reveal).toFixed(4)})`;
  }
  if (look.highlightColor) fadeIn = Math.max(fadeIn, clamp01(t / 0.35));
  const settle = clamp01(reveal);
  const lift = look.offset * (1 - settle);
  piece.style.opacity = t >= 1 ? '' : (look.baseOpacity + (1 - look.baseOpacity) * fadeIn).toFixed(3);
  piece.style.transform = [lift ? `translateY(${lift.toFixed(2)}px)` : '', motion].filter(Boolean).join(' ');
  piece.style.filter = look.blur && settle < 1 ? `blur(${(look.blur * (1 - settle)).toFixed(2)}px)` : '';
  if (look.highlightColor) {
    const glow = glowAt(t);
    piece.style.color =
      glow > 0.002 ? `color-mix(in srgb, ${look.highlightColor} ${(glow * 100).toFixed(1)}%, currentColor)` : '';
  }
};

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  baseOffset = 0,
  stagger = 0.05,
  smoothing = 0,
  splitBy = 'words',
  effect = 'fade',
  mode = 'scrub',
  duration = 0.8,
  highlightColor = '',
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  const text = useMemo(() => {
    const parts = Children.toArray(children);
    return parts.every(part => typeof part === 'string' || typeof part === 'number') ? parts.join('') : null;
  }, [children]);

  const splitText = useMemo(() => {
    if (text === null) return null;
    return text.split(/(\s+)/).map((word, index) =>
      word.trim() === '' ? (
        word
      ) : (
        <span className="scroll-reveal-word" key={index}>
          {splitBy === 'chars' ? (
            Array.from(word).map((char, charIndex) => (
              <span className="scroll-reveal-piece" key={charIndex}>
                {char}
              </span>
            ))
          ) : (
            <span className="scroll-reveal-piece">{word}</span>
          )}
        </span>
      )
    );
  }, [text, splitBy]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el || !textEl) return;
    if (scrollContainerRef && !scrollContainerRef.current) return;

    const scroller = scrollContainerRef?.current || window;
    const wrappers = Array.from(el.querySelectorAll('.scroll-reveal-word'));
    const pieces = wrappers.length ? Array.from(el.querySelectorAll('.scroll-reveal-piece')) : [textEl];
    const viewportHeight = () => (scroller instanceof HTMLElement ? scroller.clientHeight : window.innerHeight);
    const scrub = smoothing > 0 ? smoothing : true;
    const span = mode === 'enter' ? Math.max(0.05, duration) : SCRUB_SPAN;
    const gap = Math.max(0, stagger);
    const look = {
      effect,
      masked: effect === 'rise' && wrappers.length > 0,
      baseOpacity,
      blur: enableBlur ? blurStrength : 0,
      offset: baseOffset,
      highlightColor
    };
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const order = pieces.map((_, index) => index);
      const last = pieces.map(() => -1);
      const state = { p: 0 };
      let count = pieces.length;

      const measure = () => {
        if (splitBy !== 'lines' || !wrappers.length) return;
        let line = -1;
        let top = -Infinity;
        wrappers.forEach((wrapper, index) => {
          const next = wrapper.offsetTop;
          if (Math.abs(next - top) > 2) {
            line += 1;
            top = next;
          }
          order[index] = line;
        });
        count = line + 1;
      };

      const total = () => span + Math.max(0, count - 1) * gap;

      const render = () => {
        const at = state.p * total();
        pieces.forEach((piece, index) => {
          const t = clamp01((at - order[index] * gap) / span);
          if (t === last[index]) return;
          last[index] = t;
          paintPiece(piece, t, look);
        });
      };

      measure();
      pieces.forEach(piece => {
        piece.style.willChange =
          pieces.length > 80 ? '' : effect === 'fade' && !baseOffset ? 'opacity' : 'opacity, transform';
        piece.style.transformOrigin = effect === 'flip' ? '50% 100%' : '';
      });
      if (look.masked) {
        wrappers.forEach(wrapper => {
          wrapper.style.clipPath = RISE_MASK;
        });
      }
      render();

      if (mode === 'enter') {
        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          gsap.to(state, { p: 1, duration: total(), ease: 'none', onUpdate: render });
          if (baseRotation) gsap.to(el, { rotate: 0, duration: Math.min(total(), 1.4), ease: 'power3.out' });
        };
        const startAt = () => {
          const view = viewportHeight();
          const top =
            el.getBoundingClientRect().top -
            (scroller instanceof HTMLElement
              ? scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop
              : -window.scrollY);
          const raw = top - view + 0.2 * Math.min(el.offsetHeight, view);
          return Math.min(raw, ScrollTrigger.maxScroll(scroller) - 1);
        };
        if (baseRotation) gsap.set(el, { transformOrigin: '0% 50%', rotate: baseRotation });
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start: startAt,
          onEnter: play,
          onLeave: play,
          onRefresh: self => {
            if (self.progress > 0) play();
          }
        });
      } else {
        if (baseRotation) {
          gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
              ease: 'none',
              rotate: 0,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: 'top bottom',
                end: clampToScroll(rotationEnd),
                scrub
              }
            }
          );
        }
        gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: render,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: () => `top bottom-=${0.2 * Math.min(el.offsetHeight, viewportHeight())}`,
            end: clampToScroll(wordAnimationEnd),
            scrub
          }
        });
      }

      const resizeObserver =
        splitBy === 'lines' && typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => {
              measure();
              last.fill(-1);
              render();
            })
          : null;
      resizeObserver?.observe(textEl);

      return () => {
        resizeObserver?.disconnect();
        pieces.forEach(piece => {
          piece.style.opacity = '';
          piece.style.transform = '';
          piece.style.transformOrigin = '';
          piece.style.filter = '';
          piece.style.color = '';
          piece.style.willChange = '';
        });
        wrappers.forEach(wrapper => {
          wrapper.style.clipPath = '';
        });
      };
    });

    return () => mm.revert();
  }, [
    mounted,
    scrollContainerRef,
    text,
    splitBy,
    effect,
    mode,
    duration,
    highlightColor,
    enableBlur,
    baseOpacity,
    baseRotation,
    blurStrength,
    baseOffset,
    stagger,
    smoothing,
    rotationEnd,
    wordAnimationEnd
  ]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`} aria-label={text ?? undefined}>
      <span
        ref={textRef}
        className={`scroll-reveal-text ${textClassName}`}
        aria-hidden={text === null ? undefined : true}
      >
        {splitText ?? children}
      </span>
    </h2>
  );
};

export default ScrollReveal;

```

### Component CSS
```css
.scroll-reveal {
  margin: 20px 0;
}

.scroll-reveal-text {
  display: block;
  font-size: clamp(1.6rem, 4vw, 3rem);
  line-height: 1.5;
  font-weight: 600;
}

.scroll-reveal-word,
.scroll-reveal-piece {
  display: inline-block;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.  ## Integrate the <FallingText /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: FallingText
### Variant: JavaScript + CSS
### Dependencies: matter-js

---

### Usage Example
```jsx
import FallingText from './FallingText';

<div style={{ height: '400px', position: 'relative' }}>
  <FallingText
    text="Some sentences are built to last. This one falls apart on contact."
    highlightWords={['falls', 'apart']}
    trigger="hover"
    fontSize="2rem"
    gravity={1}
    restoreDelay={2}
  />
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | '' | The text that falls apart. |
| highlightWords | string[] | [] | Words that start with any of these strings get the accent color, or the accent tile in the tiles variant. |
| highlightClass | string | 'highlighted' | Extra class added to highlighted words. |
| trigger | 'auto' | 'hover' | 'click' | 'scroll' | 'auto' | What starts the fall. Scroll starts it when the text scrolls into view. |
| variant | 'text' | 'tiles' | 'text' | Plain falling text, or words on tiles that stack like blocks. |
| split | 'words' | 'letters' | 'words' | Whether whole words or single letters fall. |
| order | 'random' | 'sequence' | 'center' | 'together' | 'random' | Which pieces drop first. Falling pieces knock loose the ones they land on. |
| stagger | number | 0.03 | Delay between pieces dropping, in seconds. |
| gravity | number | 1 | Strength of gravity. Negative values fall upward. |
| bounciness | number | 0.2 | How much pieces bounce when they land, from 0 to 1. |
| scatter | number | 0.5 | How much spin and sideways push each piece gets as it drops, from 0 to 1. |
| draggable | boolean | true | Lets people pick up, drag and throw pieces. |
| mouseConstraintStiffness | number | 0.2 | How tightly a dragged piece follows the pointer, from 0 to 1. |
| cursorPush | number | 0.5 | How hard a quick swipe knocks the fallen pieces around. 0 turns it off. |
| restoreDelay | number | 0 | Seconds after the pile settles, with the pointer away, before the text flies back into place and can fall again. 0 keeps it fallen. |
| fontSize | string | '1rem' | Font size of the text. |
| accentColor | string | '#5b8cff' | Color of highlighted words, or of their tiles in the tiles variant. |
| theme | 'dark' | 'light' | 'dark' | Color theme of the tiles. |
| backgroundColor | string | 'transparent' | Background of the area the text falls into. |
| wireframes | boolean | false | Outlines each piece to show its physics shape. |
| className | string | '' | Extra class names for the container. |
| style | CSSProperties | - | Inline styles for the container. |

### Full Component Source
```jsx
'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import Matter from 'matter-js';

import './FallingText.css';

const THEMES = {
  dark: {
    '--falling-text-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--falling-text-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--falling-text-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--falling-text-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--falling-text-tile-ink': '#f4f4f5'
  },
  light: {
    '--falling-text-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--falling-text-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--falling-text-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--falling-text-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--falling-text-tile-ink': '#27272a'
  }
};

const STEP = 1000 / 120;
const WALL = 400;
const SPRING =
  'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const readableOn = color => {
  let hex = String(color || '')
    .trim()
    .replace('#', '');
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#ffffff';
  const [r, g, b] = [0, 2, 4].map(index => {
    const c = parseInt(hex.slice(index, index + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#18181b' : '#ffffff';
};

const springEase = () =>
  typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)')
    ? SPRING
    : 'cubic-bezier(0.34, 1.4, 0.64, 1)';

const FallingText = ({
  text = '',
  highlightWords = [],
  highlightClass = 'highlighted',
  trigger = 'auto',
  variant = 'text',
  split = 'words',
  gravity = 1,
  bounciness = 0.2,
  scatter = 0.5,
  stagger = 0.03,
  order = 'random',
  draggable = true,
  mouseConstraintStiffness = 0.2,
  cursorPush = 0.5,
  restoreDelay = 0,
  fontSize = '1rem',
  accentColor = '#5b8cff',
  theme = 'dark',
  backgroundColor = 'transparent',
  wireframes = false,
  className = '',
  style
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const settings = {
    trigger,
    gravity,
    bounciness,
    scatter,
    stagger,
    order,
    draggable,
    mouseConstraintStiffness,
    cursorPush,
    restoreDelay
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const highlightKey = highlightWords.join('\u0000');
  const groups = useMemo(() => {
    const marks = highlightKey ? highlightKey.split('\u0000') : [];
    return String(text)
      .split(/\s+/)
      .filter(Boolean)
      .map(word => ({ word, highlighted: marks.some(entry => entry && word.startsWith(entry)) }));
  }, [text, highlightKey]);

  useEffect(() => {
    const container = containerRef.current;
    const block = textRef.current;
    if (!container || !block) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let phase = 'idle';
    let engine = null;
    let pieces = [];
    let walls = [];
    let drag = null;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let accumulator = 0;
    let quietSince = null;
    let inside = false;
    let visible = true;
    let armed = true;
    let lastBounciness = null;
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, time: 0 };

    const local = event => {
      const box = container.getBoundingClientRect();
      return { x: event.clientX - box.left - container.clientLeft, y: event.clientY - box.top - container.clientTop };
    };

    const placeWalls = () => {
      if (!engine) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const [floor, left, right, ceiling] = walls;
      Matter.Body.setPosition(floor, { x: width / 2, y: height + WALL / 2 });
      Matter.Body.setPosition(left, { x: -WALL / 2, y: height / 2 });
      Matter.Body.setPosition(right, { x: width + WALL / 2, y: height / 2 });
      Matter.Body.setPosition(ceiling, { x: width / 2, y: -WALL / 2 });
      pieces.forEach(piece => Matter.Sleeping.set(piece.body, false));
    };

    const draw = alpha => {
      for (const piece of pieces) {
        const { body } = piece;
        const x = piece.px + (body.position.x - piece.px) * alpha;
        const y = piece.py + (body.position.y - piece.py) * alpha;
        const angle = piece.pa + (body.angle - piece.pa) * alpha;
        if (Math.abs(x - piece.dx) < 0.01 && Math.abs(y - piece.dy) < 0.01 && Math.abs(angle - piece.da) < 0.0001)
          continue;
        piece.dx = x;
        piece.dy = y;
        piece.da = angle;
        piece.element.style.transform = `translate3d(${(x - piece.w / 2).toFixed(2)}px, ${(y - piece.h / 2).toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
      }
    };

    const release = piece => {
      const s = settingsRef.current;
      piece.released = true;
      Matter.Body.setStatic(piece.body, false);
      Matter.Sleeping.set(piece.body, false);
      const kick = clamp(s.scatter, 0, 1) * (piece.knocked ? 0.4 : 1);
      Matter.Body.setVelocity(piece.body, { x: (Math.random() - 0.5) * 6 * kick, y: -Math.random() * 2.5 * kick });
      Matter.Body.setAngularVelocity(piece.body, (Math.random() - 0.5) * 0.12 * kick);
    };

    const frame = now => {
      raf = 0;
      if (!engine || !visible) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      clock += dt;
      const s = settingsRef.current;
      engine.gravity.y = clamp(s.gravity, -3, 4) * 1.4;
      const bounce = clamp(s.bounciness, 0, 1);
      if (bounce !== lastBounciness) {
        lastBounciness = bounce;
        pieces.forEach(piece => {
          piece.body.restitution = bounce;
        });
      }
      for (const piece of pieces) if (!piece.released && (clock >= piece.at || piece.knocked)) release(piece);
      accumulator += dt * 1000;
      while (accumulator >= STEP) {
        for (const piece of pieces) {
          piece.px = piece.body.position.x;
          piece.py = piece.body.position.y;
          piece.pa = piece.body.angle;
        }
        Matter.Engine.update(engine, STEP);
        accumulator -= STEP;
      }
      draw(accumulator / STEP);
      const settled = pieces.every(piece => piece.released && (piece.body.isSleeping || piece.body.speed < 0.05));
      if (s.restoreDelay > 0 && settled && !inside && !drag) {
        quietSince ??= now;
        if (now - quietSince > s.restoreDelay * 1000) {
          restore();
          return;
        }
      } else quietSince = null;
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && engine && visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const fall = () => {
      if (phase !== 'idle' || reduced) return;
      const elements = [...block.querySelectorAll('[data-piece]')];
      if (!elements.length) return;
      const s = settingsRef.current;
      const box = container.getBoundingClientRect();
      const originX = box.left + container.clientLeft;
      const originY = box.top + container.clientTop;
      const rects = elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left - originX, y: rect.top - originY, w: rect.width, h: rect.height };
      });
      block.style.minHeight = `${block.offsetHeight}px`;
      const world = Matter.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
      world.gravity.y = clamp(s.gravity, -3, 4) * 1.4;
      walls = [
        Matter.Bodies.rectangle(0, 0, 10000, WALL, { isStatic: true, friction: 0.8 }),
        Matter.Bodies.rectangle(0, 0, WALL, 10000, { isStatic: true, friction: 0.3 }),
        Matter.Bodies.rectangle(0, 0, WALL, 10000, { isStatic: true, friction: 0.3 }),
        Matter.Bodies.rectangle(0, 0, 10000, WALL, { isStatic: true, friction: 0.3 })
      ];
      const count = rects.length;
      const center = rects.reduce((sum, rect) => sum + rect.x + rect.w / 2, 0) / count;
      const span = Math.max(1, ...rects.map(rect => Math.abs(rect.x + rect.w / 2 - center)));
      const shuffled = rects.map((_, index) => index).sort(() => Math.random() - 0.5);
      pieces = elements.map((element, index) => {
        const rect = rects[index];
        const radius = Math.max(0, Math.min(variant === 'tiles' ? rect.h * 0.28 : 4, rect.w / 2 - 1, rect.h / 2 - 1));
        const body = Matter.Bodies.rectangle(
          rect.x + rect.w / 2,
          rect.y + rect.h / 2,
          Math.max(2, rect.w - 1),
          Math.max(2, rect.h - 1),
          {
            chamfer: radius > 0.5 ? { radius } : undefined,
            restitution: clamp(s.bounciness, 0, 1),
            friction: 0.4,
            frictionStatic: 0.8,
            frictionAir: 0.012,
            density: 0.0015,
            slop: 0.02
          }
        );
        Matter.Body.setStatic(body, true);
        const rank =
          s.order === 'random'
            ? shuffled.indexOf(index)
            : s.order === 'center'
              ? (Math.abs(rect.x + rect.w / 2 - center) / span) * (count - 1)
              : index;
        element.style.position = 'absolute';
        element.style.left = '0';
        element.style.top = '0';
        element.style.width = `${rect.w}px`;
        element.style.height = `${rect.h}px`;
        element.style.margin = '0';
        element.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
        return {
          element,
          body,
          w: rect.w,
          h: rect.h,
          x0: rect.x,
          y0: rect.y,
          px: body.position.x,
          py: body.position.y,
          pa: 0,
          dx: body.position.x,
          dy: body.position.y,
          da: 0,
          at: s.order === 'together' ? 0 : rank * Math.max(0, s.stagger),
          released: false
        };
      });
      Matter.Composite.add(world.world, [...walls, ...pieces.map(piece => piece.body)]);
      const byBody = new Map(pieces.map(piece => [piece.body, piece]));
      Matter.Events.on(world, 'collisionStart', event => {
        const down = Math.sign(world.gravity.y) || 1;
        for (const pair of event.pairs) {
          const a = byBody.get(pair.bodyA);
          const b = byBody.get(pair.bodyB);
          if (!a || !b || a.released === b.released) continue;
          const [moving, still] = a.released ? [a, b] : [b, a];
          if ((still.body.position.y - moving.body.position.y) * down > still.h * 0.25) still.knocked = true;
        }
      });
      engine = world;
      placeWalls();
      phase = 'falling';
      container.dataset.phase = 'falling';
      clock = 0;
      accumulator = 0;
      quietSince = null;
      lastBounciness = clamp(s.bounciness, 0, 1);
      wake();
    };

    const restore = () => {
      if (phase !== 'falling') return;
      phase = 'restoring';
      container.dataset.phase = 'restoring';
      if (drag && engine) {
        Matter.Composite.remove(engine.world, drag.constraint);
        drag = null;
      }
      cancelAnimationFrame(raf);
      raf = 0;
      const easing = springEase();
      const order = [...pieces].sort((a, b) => a.body.position.y - b.body.position.y);
      const animations = order.map((piece, index) => {
        const angle = Math.atan2(Math.sin(piece.body.angle), Math.cos(piece.body.angle));
        const from = `translate3d(${(piece.body.position.x - piece.w / 2).toFixed(2)}px, ${(piece.body.position.y - piece.h / 2).toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
        const to = `translate3d(${piece.x0}px, ${piece.y0}px, 0) rotate(0rad)`;
        piece.element.style.transform = to;
        return piece.element.animate([{ transform: from }, { transform: to }], {
          duration: 760,
          delay: Math.min(index * 14, 360),
          easing,
          fill: 'backwards'
        });
      });
      Promise.all(animations.map(animation => animation.finished.catch(() => null))).then(() => {
        if (phase !== 'restoring') return;
        reset();
      });
    };

    const reset = (rearm = true) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (engine) {
        Matter.Composite.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      engine = null;
      for (const piece of pieces) {
        piece.element.getAnimations().forEach(animation => animation.cancel());
        piece.element.style.position = '';
        piece.element.style.left = '';
        piece.element.style.top = '';
        piece.element.style.width = '';
        piece.element.style.height = '';
        piece.element.style.margin = '';
        piece.element.style.transform = '';
      }
      pieces = [];
      walls = [];
      drag = null;
      block.style.minHeight = '';
      phase = 'idle';
      delete container.dataset.phase;
      delete container.dataset.dragging;
      if (rearm) armed = true;
    };

    const onEnter = () => {
      inside = true;
      if (settingsRef.current.trigger === 'hover') fall();
    };
    const onLeave = () => {
      inside = false;
    };
    const onClick = () => {
      if (settingsRef.current.trigger === 'click') fall();
    };

    const onDown = event => {
      const s = settingsRef.current;
      if (!engine || phase !== 'falling' || !s.draggable || (event.pointerType === 'mouse' && event.button !== 0))
        return;
      const point = local(event);
      const bodies = pieces.filter(piece => piece.released).map(piece => piece.body);
      const hit = Matter.Query.point(bodies, point)[0];
      if (!hit) return;
      event.preventDefault();
      container.setPointerCapture?.(event.pointerId);
      Matter.Sleeping.set(hit, false);
      const constraint = Matter.Constraint.create({
        pointA: point,
        bodyB: hit,
        pointB: { x: point.x - hit.position.x, y: point.y - hit.position.y },
        stiffness: clamp(s.mouseConstraintStiffness, 0.01, 1),
        damping: 0.08,
        length: 0
      });
      Matter.Composite.add(engine.world, constraint);
      drag = { constraint, id: event.pointerId };
      container.dataset.dragging = '';
      wake();
    };

    const onMove = event => {
      const point = local(event);
      const now = performance.now();
      const dt = Math.max(1, now - pointer.time);
      if (pointer.time && dt < 120) {
        const blend = Math.min(1, dt / 40);
        pointer.vx += ((point.x - pointer.x) / dt - pointer.vx) * blend;
        pointer.vy += ((point.y - pointer.y) / dt - pointer.vy) * blend;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.time = now;
      inside = true;
      if (phase === 'idle' && settingsRef.current.trigger === 'hover') fall();
      if (phase !== 'falling') return;
      if (drag && event.pointerId === drag.id) {
        drag.constraint.pointA = point;
        return;
      }
      const s = settingsRef.current;
      const push = clamp(s.cursorPush, 0, 2);
      const speed = Math.hypot(pointer.vx, pointer.vy);
      if (!push || speed < 0.35) return;
      let touched = false;
      for (const piece of pieces) {
        if (!piece.released) continue;
        const { body } = piece;
        const reach = Math.max(piece.w, piece.h) / 2 + 18;
        const distance = Math.hypot(body.position.x - point.x, body.position.y - point.y);
        if (distance > reach) continue;
        if (now - (piece.pushed || 0) < 60) continue;
        piece.pushed = now;
        const falloff = 1 - (distance / reach) ** 2;
        const kick = Math.min(20, speed * push * falloff * 16);
        Matter.Sleeping.set(body, false);
        Matter.Body.setVelocity(body, {
          x: body.velocity.x + (pointer.vx / speed) * kick,
          y: body.velocity.y + (pointer.vy / speed) * kick - kick * 0.7
        });
        Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.06 * push);
        touched = true;
      }
      if (touched) wake();
    };

    const onUp = event => {
      if (!drag || event.pointerId !== drag.id) return;
      if (engine) Matter.Composite.remove(engine.world, drag.constraint);
      drag = null;
      delete container.dataset.dragging;
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            entries => {
              const entry = entries[entries.length - 1];
              visible = entry.isIntersecting;
              if (visible) wake();
              if (settingsRef.current.trigger !== 'scroll') return;
              if (entry.intersectionRatio >= 0.3) {
                if (armed) {
                  armed = false;
                  fall();
                }
              } else if (phase === 'idle') armed = true;
            },
            { threshold: [0, 0.3] }
          );
    observer?.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      if (phase === 'falling') {
        placeWalls();
        wake();
      }
    });
    resizeObserver.observe(container);

    container.addEventListener('pointerenter', onEnter);
    container.addEventListener('pointerleave', onLeave);
    container.addEventListener('click', onClick);
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);

    let cancelled = false;
    if (trigger === 'auto') {
      const ready = document.fonts?.ready ?? Promise.resolve();
      ready.then(() => {
        if (!cancelled) requestAnimationFrame(() => !cancelled && fall());
      });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('pointerenter', onEnter);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('click', onClick);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      phase = 'idle';
      reset(false);
    };
  }, [groups, split, variant, fontSize, trigger]);

  const pieceClass = `falling-text__piece${variant === 'tiles' ? ' falling-text__piece--tile' : ''}`;

  return (
    <div
      ref={containerRef}
      className={`falling-text${wireframes ? ' falling-text--wireframes' : ''} ${className}`.trim()}
      data-trigger={trigger}
      data-draggable={draggable ? '' : undefined}
      style={{
        ...(THEMES[theme] ?? THEMES.dark),
        '--falling-text-accent': accentColor,
        '--falling-text-accent-ink': readableOn(accentColor),
        background: backgroundColor,
        fontSize,
        ...style
      }}
    >
      <div ref={textRef} className="falling-text__text">
        {groups.map((group, index) => (
          <Fragment key={index}>
            {index > 0 && ' '}
            {split === 'letters' ? (
              <span className="falling-text__group">
                {[...group.word].map((letter, position) => (
                  <span
                    key={position}
                    className={`${pieceClass}${group.highlighted ? ` ${highlightClass}` : ''}`}
                    data-piece=""
                    data-highlight={group.highlighted ? '' : undefined}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ) : (
              <span
                className={`${pieceClass}${group.highlighted ? ` ${highlightClass}` : ''}`}
                data-piece=""
                data-highlight={group.highlighted ? '' : undefined}
              >
                {group.word}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default FallingText;

```

### Component CSS
```css
.falling-text {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.falling-text[data-trigger='click']:not([data-phase]) {
  cursor: pointer;
}

.falling-text__text {
  max-width: 100%;
  padding: 1em;
  box-sizing: border-box;
  line-height: 1.4;
  text-align: center;
  text-wrap: balance;
}

.falling-text__group {
  white-space: nowrap;
}

.falling-text__piece {
  display: inline-block;
  white-space: pre;
}

.falling-text__piece[data-highlight] {
  color: var(--falling-text-accent);
  font-weight: 600;
}

.falling-text__piece--tile {
  margin: 0.14em 0.06em;
  padding: 0.24em 0.56em;
  border-radius: 0.42em;
  background: var(--falling-text-tile);
  box-shadow:
    inset 0 0 0 1px var(--falling-text-tile-edge),
    inset 0 1px 0 var(--falling-text-tile-highlight),
    var(--falling-text-tile-shadow);
  color: var(--falling-text-tile-ink);
  line-height: 1.2;
}

.falling-text__piece--tile[data-highlight] {
  background: var(--falling-text-accent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    var(--falling-text-tile-shadow);
  color: var(--falling-text-accent-ink);
}

.falling-text[data-phase] .falling-text__piece {
  will-change: transform;
}

.falling-text[data-draggable][data-phase='falling'] .falling-text__piece {
  touch-action: none;
}

.falling-text[data-draggable][data-phase='falling']:not([data-dragging]) .falling-text__piece {
  cursor: grab;
}

.falling-text[data-dragging],
.falling-text[data-dragging] .falling-text__piece {
  cursor: grabbing;
}

.falling-text--wireframes .falling-text__piece {
  outline: 1px solid currentColor;
  outline-offset: -1px;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
    ## Integrate the <CurvedLoop /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: CurvedLoop
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import CurvedLoop from './CurvedLoop';

<CurvedLoop
  marqueeText="Be ✦ Creative ✦ With ✦ React ✦ Bits ✦"
  shape="arc"
  speed={2}
  curveAmount={400}
  direction="left"
  fontSize={96}
  fontWeight={700}
  letterSpacing={0}
  separator=""
  outline={false}
  scrollBoost={0}
  edgeFade={0}
  interactive={true}
  pauseOnHover={false}
  separatorColor=null
  color=null
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| marqueeText | string | '' | The text that loops along the path. Repeats are joined with a space. |
| shape | 'arc' | 'wave' | 'circle' | 'line' | 'arc' | The path the text travels on. Circle closes the loop into a ring that always fits a whole number of repeats. |
| color | string | 'currentColor' | Color of the text, or of its outline when outline is on. Follows the surrounding text color by default. |
| separator | string | '' | A mark placed between repeats, such as ✦ or /. Leave empty to join repeats with a space. |
| separatorColor | string | - | Paints the separator in its own solid color. Matches the text when left unset. |
| direction | 'left' | 'right' | 'left' | Which way the text travels. On a circle, right turns clockwise. A drag flips it to the way it was thrown. |
| speed | number | 2 | How fast the text travels along the path. 0 keeps it still until dragged or scrolled. |
| scrollBoost | number | 0 | How much page scrolling speeds the loop up for a moment before it eases back. 0 turns it off. |
| curveAmount | number | 400 | How far the path bends. On the arc it is the dip at the middle (negative arches up), on the wave it sets the wave height. |
| fontSize | number | 96 | Letter size in px for a 1440px wide loop. The whole loop scales with its container. |
| fontWeight | number | string | 700 | Weight of the letters. |
| letterSpacing | number | 0 | Extra space between letters in px, measured like fontSize. |
| edgeFade | number | 0 | How much of each side fades out, from 0 to 1. At 1 only the middle stays fully visible. |
| outline | boolean | false | Draws the letters as outlines instead of solid text. |
| interactive | boolean | true | Lets people drag the text and fling it. Rings follow the pointer around. It glides back to its normal speed afterwards. |
| pauseOnHover | boolean | false | Eases the text to a stop while the pointer is over it. |
| className | string | - | Extra class names for the text, for example to change its font. |

### Full Component Source
```jsx
'use client';

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './CurvedLoop.css';

const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 120;
const MAX_FLING = 4000;
const WAVE_LENGTH = 960;
const RING_RADIUS = 2.2;
const TAU = Math.PI * 2;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const wrapOffset = (value, length) => (length > 0 ? (((value % length) + length) % length) - length : value);

const wrapAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

const edgeMask = (amount, span) => {
  const size = Math.min(Math.max(amount, 0), 1) * 50 * span;
  if (size <= 0) return undefined;
  const start = 50 - span * 50;
  const steps = 10;
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const alpha = (t * t * t * (t * (t * 6 - 15) + 10)).toFixed(3);
    left.push(`rgba(0, 0, 0, ${alpha}) ${(start + t * size).toFixed(2)}%`);
    right.unshift(`rgba(0, 0, 0, ${alpha}) ${(100 - start - t * size).toFixed(2)}%`);
  }
  return `linear-gradient(to right, ${[...left, ...right].join(', ')})`;
};

const wavePath = (amplitude, baseline) => {
  const from = -100;
  const to = VIEW_WIDTH + 100;
  const k = TAU / WAVE_LENGTH;
  const y = x => baseline + amplitude * Math.cos(k * (x - VIEW_WIDTH / 2));
  const slope = x => -amplitude * k * Math.sin(k * (x - VIEW_WIDTH / 2));
  const count = Math.ceil((to - from) / (WAVE_LENGTH / 8));
  const step = (to - from) / count;
  const f = n => n.toFixed(2);
  let d = `M${f(from)},${f(y(from))}`;
  for (let i = 0; i < count; i++) {
    const x0 = from + i * step;
    const x1 = x0 + step;
    d += ` C${f(x0 + step / 3)},${f(y(x0) + (slope(x0) * step) / 3)} ${f(x1 - step / 3)},${f(y(x1) - (slope(x1) * step) / 3)} ${f(x1)},${f(y(x1))}`;
  }
  return d;
};

const getGeometry = (shape, curveAmount, fontSize, spacing) => {
  if (shape === 'circle') {
    const repeats = spacing > 0 ? Math.max(1, Math.round((TAU * fontSize * RING_RADIUS) / spacing)) : 1;
    const radius = spacing > 0 ? (repeats * spacing) / TAU : fontSize * RING_RADIUS;
    const half = radius + fontSize;
    return {
      d: `M${-radius},0 A${radius},${radius} 0 1,1 ${radius},0 A${radius},${radius} 0 1,1 ${-radius},0`,
      viewBox: `${-half} ${-half} ${half * 2} ${half * 2}`,
      radius,
      repeats,
      span: Math.min(1, (fontSize * (RING_RADIUS + 1) * 2) / VIEW_WIDTH)
    };
  }
  const flat = { viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, radius: 0, repeats: 0, span: 1 };
  const baseline = VIEW_HEIGHT / 2 + fontSize * 0.36;
  if (shape === 'line') return { ...flat, d: `M-100,${baseline} L${VIEW_WIDTH + 100},${baseline}` };
  if (shape === 'wave') return { ...flat, d: wavePath(curveAmount * 0.25, baseline) };
  return { ...flat, d: `M-100,40 Q500,${40 + curveAmount} 1540,40` };
};

const CurvedLoop = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
  pauseOnHover = false,
  color = 'currentColor',
  edgeFade = 0,
  shape = 'arc',
  fontSize = 96,
  fontWeight = 700,
  letterSpacing = 0,
  outline = false,
  separator = '',
  separatorColor,
  scrollBoost = 0
}) => {
  const body = useMemo(() => marqueeText.replace(/\s+$/, ''), [marqueeText]);
  const mark = String(separator ?? '').trim();
  const text = mark ? `${body}\u00A0${mark}\u00A0` : `${body}\u00A0`;
  const pathId = `curve-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const jacketRef = useRef(null);
  const svgRef = useRef(null);
  const measureRef = useRef(null);
  const pathRef = useRef(null);
  const textPathsRef = useRef([]);

  const [spacing, setSpacing] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [dragging, setDragging] = useState(false);

  const spacingRef = useRef(0);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const directionRef = useRef(direction);
  const hoverRef = useRef(false);
  const settingsRef = useRef({ speed, pauseOnHover, scrollBoost });
  const scrollRef = useRef({ distance: 0, level: 0 });
  const dragRef = useRef({
    active: false,
    x: 0,
    time: 0,
    scale: 1,
    velocity: 0,
    ring: false,
    radius: 0,
    angle: 0,
    cx: 0,
    cy: 0
  });

  const ring = shape === 'circle';
  const geometry = getGeometry(shape, curveAmount, fontSize, spacing);
  const ready = spacing > 0;
  const copies = ready ? (ring ? geometry.repeats + 1 : Math.ceil((pathLength || 1800) / spacing) + 2) : 1;
  const mask = edgeMask(edgeFade, geometry.span);

  const maskId = `${pathId}-outline`;
  const accent = Boolean(mark && separatorColor);
  const plain = text.repeat(copies);
  const repeat = markProps =>
    Array.from({ length: copies }, (_, i) => (
      <Fragment key={i}>
        {`${body}\u00A0`}
        <tspan {...markProps}>{mark}</tspan>
        {'\u00A0'}
      </Fragment>
    ));

  const applyOffset = () => {
    const value = `${offsetRef.current}px`;
    for (const node of textPathsRef.current) node.setAttribute('startOffset', value);
  };

  useEffect(() => {
    settingsRef.current = { speed, pauseOnHover, scrollBoost };
  }, [speed, pauseOnHover, scrollBoost]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
    };
    measure();
    let active = true;
    const fonts = document.fonts;
    fonts?.ready.then(() => active && measure());
    fonts?.addEventListener?.('loadingdone', measure);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (observer && svgRef.current) observer.observe(svgRef.current);
    return () => {
      active = false;
      fonts?.removeEventListener?.('loadingdone', measure);
      observer?.disconnect();
    };
  }, [text, className, fontSize, fontWeight, letterSpacing]);

  useIsomorphicLayoutEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [geometry.d]);

  useIsomorphicLayoutEffect(() => {
    if (!ready) return;
    spacingRef.current = spacing;
    offsetRef.current = wrapOffset(offsetRef.current, spacing);
  }, [ready, spacing]);

  useIsomorphicLayoutEffect(() => {
    textPathsRef.current = svgRef.current ? Array.from(svgRef.current.querySelectorAll('textPath')) : [];
    const value = `${offsetRef.current}px`;
    for (const node of textPathsRef.current) node.setAttribute('startOffset', value);
  });

  useEffect(() => {
    if (!scrollBoost) return undefined;
    const positions = new Map([[window, window.scrollY]]);
    const onScroll = event => {
      const target = event.target instanceof Element ? event.target : window;
      if (target instanceof Element && !target.contains(jacketRef.current)) return;
      const position = target instanceof Element ? target.scrollTop : window.scrollY;
      const previous = positions.get(target);
      positions.set(target, position);
      if (previous !== undefined) scrollRef.current.distance += Math.abs(position - previous);
    };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [scrollBoost]);

  useEffect(() => {
    if (!ready) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let frame = 0;
    let last = 0;
    let visible = true;

    const tick = now => {
      frame = 0;
      if (!visible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const scroll = scrollRef.current;
      const rate = dt > 0 ? scroll.distance / dt : 0;
      scroll.distance = 0;
      scroll.level += (rate - scroll.level) * (1 - Math.exp(-dt * (rate > scroll.level ? 10 : 2.4)));
      if (!dragRef.current.active) {
        const { speed: base, pauseOnHover: pause, scrollBoost: boost } = settingsRef.current;
        const sign = directionRef.current === 'right' ? 1 : -1;
        const halted = reduceMotion || (pause && hoverRef.current);
        const target = halted ? 0 : sign * base * 60;
        const extra = halted ? 0 : sign * scroll.level * boost * 0.3;
        velocityRef.current += (target - velocityRef.current) * (1 - Math.exp(-dt * 3));
        const step = (velocityRef.current + extra) * dt;
        if (Math.abs(step) > 0.0001) {
          offsetRef.current = wrapOffset(offsetRef.current + step, spacingRef.current);
          for (const node of textPathsRef.current) node.setAttribute('startOffset', `${offsetRef.current}px`);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !frame) {
              last = 0;
              scrollRef.current.level = 0;
              frame = requestAnimationFrame(tick);
            }
          })
        : null;
    if (observer && jacketRef.current) observer.observe(jacketRef.current);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [ready]);

  const onPointerDown = e => {
    if (!interactive || !ready) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width || VIEW_WIDTH;
    const cx = rect ? rect.left + rect.width / 2 : e.clientX;
    const cy = rect ? rect.top + rect.height / 2 : e.clientY;
    dragRef.current = {
      active: true,
      x: e.clientX,
      time: performance.now(),
      scale: VIEW_WIDTH / width,
      velocity: 0,
      ring,
      radius: geometry.radius,
      angle: Math.atan2(e.clientY - cy, e.clientX - cx),
      cx,
      cy
    };
    velocityRef.current = 0;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = e => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = performance.now();
    let delta = (e.clientX - drag.x) * drag.scale;
    if (drag.ring) {
      const angle = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
      delta = wrapAngle(angle - drag.angle) * drag.radius;
      drag.angle = angle;
    }
    const dt = Math.max(now - drag.time, 1) / 1000;
    drag.x = e.clientX;
    drag.time = now;
    drag.velocity = drag.velocity * 0.5 + (delta / dt) * 0.5;
    offsetRef.current = wrapOffset(offsetRef.current + delta, spacingRef.current);
    applyOffset();
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    setDragging(false);
    const fling = performance.now() - drag.time > 100 ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, drag.velocity));
    velocityRef.current = fling;
    if (Math.abs(fling) > 60) directionRef.current = fling > 0 ? 'right' : 'left';
  };

  const onPointerLeave = () => {
    hoverRef.current = false;
    endDrag();
  };

  return (
    <div
      ref={jacketRef}
      className="curved-loop-jacket"
      style={{
        visibility: ready ? 'visible' : 'hidden',
        cursor: interactive ? (dragging ? 'grabbing' : 'grab') : 'auto',
        touchAction: interactive ? 'pan-y' : 'auto',
        maskImage: mask,
        WebkitMaskImage: mask
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={onPointerLeave}
    >
      <svg
        ref={svgRef}
        className="curved-loop-svg"
        viewBox={geometry.viewBox}
        style={{
          fontSize,
          fontWeight,
          letterSpacing,
          ...(ring ? { width: `${(geometry.span * 100).toFixed(3)}%`, aspectRatio: '1' } : null)
        }}
        role="img"
        aria-label={marqueeText}
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          className={className}
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={geometry.d} fill="none" stroke="transparent" />
          {ready && outline && (
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x={-VIEW_WIDTH}
              y={-VIEW_WIDTH}
              width={VIEW_WIDTH * 3}
              height={VIEW_WIDTH * 3}
            >
              <rect x={-VIEW_WIDTH} y={-VIEW_WIDTH} width={VIEW_WIDTH * 3} height={VIEW_WIDTH * 3} fill="#fff" />
              <text xmlSpace="preserve" className={className} fill="#000">
                <textPath href={`#${pathId}`} xmlSpace="preserve">
                  {plain}
                </textPath>
              </text>
            </mask>
          )}
        </defs>
        {ready &&
          (outline ? (
            <text
              xmlSpace="preserve"
              className={className}
              fill="none"
              stroke={color}
              strokeWidth={fontSize * 0.05}
              strokeLinejoin="round"
              mask={`url(#${maskId})`}
            >
              <textPath href={`#${pathId}`} xmlSpace="preserve">
                {accent ? repeat({ stroke: 'none' }) : plain}
              </textPath>
            </text>
          ) : (
            <text xmlSpace="preserve" className={className} fill={color}>
              <textPath href={`#${pathId}`} xmlSpace="preserve">
                {accent ? repeat({ fill: separatorColor }) : plain}
              </textPath>
            </text>
          ))}
        {ready && outline && accent && (
          <text xmlSpace="preserve" className={className} fill="none" aria-hidden="true">
            <textPath href={`#${pathId}`} xmlSpace="preserve">
              {repeat({ fill: separatorColor })}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;

```

### Component CSS
```css
.curved-loop-jacket {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.curved-loop-svg {
  width: 100%;
  aspect-ratio: 100 / 12;
  overflow: visible;
  display: block;
  fill: currentColor;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  text-transform: uppercase;
  line-height: 1;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.

## Integrate the <RotatingText /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: RotatingText
### Variant: JavaScript + CSS
### Dependencies: motion

---

### Usage Example
```jsx
import RotatingText from './RotatingText';

<RotatingText
  texts={['React', 'Bits', 'Is', 'Cool!']}
  effect="slide"
  direction="up"
  highlight={true}
  highlightColor="#a855f7"
  staggerFrom="last"
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  rotationInterval={2000}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| texts | string[] | [] | The texts to rotate through. |
| effect | 'slide' | 'flip' | 'blur' | 'scale' | 'drop' | "slide" | How letters swap. Flip rolls them over like a drum, blur dissolves them, scale zooms through and drop lets them fall in with a small bounce. |
| direction | 'up' | 'down' | "up" | Which way letters travel. Drop always falls from above. |
| highlight | boolean | false | Puts the rotating text on a colored block that smoothly resizes to fit each new text, with a text color picked for contrast. |
| highlightColor | string | "#a855f7" | Color of the highlight block. Hex or rgb colors also set a readable text color automatically. |
| rotationInterval | number | 2000 | Time each text stays on screen, in milliseconds. |
| blur | number | 0 | Blurs letters as they come and go, in px. The blur effect uses 10 when this is 0. |
| staggerDuration | number | 0 | Delay between letters, in seconds. |
| staggerFrom | 'first' | 'last' | 'center' | 'random' | number | "first" | Which letter moves first. A number starts from that letter, random shuffles the order. |
| splitBy | 'characters' | 'words' | 'lines' | string | "characters" | How each text is split into moving pieces. Any other string is used as the separator. |
| loop | boolean | true | Goes back to the first text after the last one. |
| auto | boolean | true | Rotates on its own. Turn off to drive it with the ref methods. |
| pauseOnHover | boolean | false | Holds the current text while the pointer is over it. |
| initial | object | - | Overrides the state each letter enters from. Leave unset to use the effect. |
| animate | object | - | Overrides the state each letter settles into. |
| exit | object | - | Overrides the state each letter leaves to. |
| transition | object | - | Overrides the Motion transition used for every letter. Each effect brings its own by default. |
| animatePresenceMode | 'wait' | 'sync' | "wait" | 'wait' lets the old text leave before the new one enters, 'sync' runs both at once. |
| animatePresenceInitial | boolean | false | Animates the first text in on mount. |
| onNext | (index: number) => void | undefined | Called with the new index whenever the text changes. |
| mainClassName | string | '' | Extra class names for the outer element. |
| splitLevelClassName | string | '' | Extra class names for each group of letters. Add overflow hidden here for a masked slide. |
| elementLevelClassName | string | '' | Extra class names for each moving letter. |

### Full Component Source
```jsx
'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  animate as animateValue,
  useMotionValue,
  useReducedMotion
} from 'motion/react';

import './RotatingText.css';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;

const splitIntoCharacters = text =>
  segmenter ? Array.from(segmenter.segment(text), segment => segment.segment) : Array.from(text);

const withFilter = (state, filter) =>
  state && typeof state === 'object' && !Array.isArray(state) ? { ...state, filter } : state;

const LAYOUT_SPRING = { type: 'spring', damping: 25, stiffness: 300 };
const WIDTH_SPRING = { type: 'spring', damping: 34, stiffness: 320 };
const FLIP_STYLE = { transformOrigin: '50% 50% -0.45em', backfaceVisibility: 'hidden' };

const EFFECTS = {
  slide: up => ({
    initial: { y: up ? '100%' : '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: up ? '-120%' : '120%', opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }),
  flip: up => ({
    initial: { rotateX: up ? -90 : 90, opacity: 0, transformPerspective: 480 },
    animate: { rotateX: 0, opacity: 1, transformPerspective: 480 },
    exit: { rotateX: up ? 90 : -90, opacity: 0, transformPerspective: 480 },
    transition: { type: 'tween', duration: 0.6, ease: [0.34, 1.4, 0.64, 1] },
    exitTransition: { type: 'tween', duration: 0.32, ease: [0.5, 0, 0.75, 0] }
  }),
  blur: up => ({
    initial: { y: up ? '45%' : '-45%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: up ? '-45%' : '45%', opacity: 0 },
    transition: { type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }),
  scale: up => ({
    initial: { scale: up ? 0.35 : 1.7, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: up ? 1.7 : 0.35, opacity: 0 },
    transition: { type: 'spring', damping: 17, stiffness: 240 }
  }),
  drop: () => ({
    initial: { y: '-110%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '110%', opacity: 0 },
    transition: { type: 'spring', damping: 18, stiffness: 320, mass: 0.9 },
    exitTransition: { type: 'tween', duration: 0.3, ease: [0.55, 0, 1, 0.45] }
  })
};

const readableText = color => {
  const value = String(color ?? '').trim();
  let rgb = null;
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    const digits = hex[1].length < 6 ? [...hex[1].slice(0, 3)].map(c => c + c).join('') : hex[1].slice(0, 6);
    rgb = [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16));
  } else {
    const fn = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (fn) rgb = fn.slice(1, 4).map(Number);
  }
  if (!rgb) return undefined;
  const [r, g, b] = rgb.map(channel => {
    const c = Math.min(Math.max(channel / 255, 0), 1);
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#0b0b0c' : '#ffffff';
};

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition,
    initial,
    animate,
    exit,
    effect = 'slide',
    direction = 'up',
    highlight = false,
    highlightColor = '#a855f7',
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    pauseOnHover = false,
    blur = 0,
    splitBy = 'characters',
    onNext,
    onMouseEnter,
    onMouseLeave,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    style,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const indexRef = useRef(0);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  const contentRef = useRef(null);
  const width = useMotionValue('auto');
  const reduceMotion = useReducedMotion();

  const lastIndex = Math.max(texts.length - 1, 0);
  const activeIndex = Math.min(currentTextIndex, lastIndex);

  const elements = useMemo(() => {
    const currentText = texts[activeIndex] ?? '';
    if (splitBy === 'characters') {
      const words = currentText.split(' ');
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1
      }));
    }
    if (splitBy === 'words') {
      return currentText.split(' ').map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1
      }));
    }
    if (splitBy === 'lines') {
      return currentText.split('\n').map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1
      }));
    }

    return currentText.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1
    }));
  }, [texts, activeIndex, splitBy]);

  const order = useMemo(() => {
    const total = elements.reduce((sum, word) => sum + word.characters.length, 0);
    const shuffled = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    return { total, shuffled };
  }, [elements]);

  const getStaggerDelay = index => {
    const { total, shuffled } = order;
    if (staggerFrom === 'first') return index * staggerDuration;
    if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
    if (staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
    if (staggerFrom === 'random') return shuffled[index] * staggerDuration;
    return Math.abs(staggerFrom - index) * staggerDuration;
  };

  const goTo = useCallback(index => {
    if (index === indexRef.current) return;
    indexRef.current = index;
    setCurrentTextIndex(index);
    onNextRef.current?.(index);
  }, []);

  const next = useCallback(() => {
    const current = Math.min(indexRef.current, lastIndex);
    goTo(current < lastIndex ? current + 1 : loop ? 0 : current);
  }, [lastIndex, loop, goTo]);

  const previous = useCallback(() => {
    const current = Math.min(indexRef.current, lastIndex);
    goTo(current > 0 ? current - 1 : loop ? lastIndex : current);
  }, [lastIndex, loop, goTo]);

  const jumpTo = useCallback(index => goTo(Math.max(0, Math.min(index, lastIndex))), [lastIndex, goTo]);

  const reset = useCallback(() => goTo(0), [goTo]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset
    }),
    [next, previous, jumpTo, reset]
  );

  const paused = pauseOnHover && hovered;

  useEffect(() => {
    if (!auto || paused) return;
    const timeoutId = setTimeout(next, rotationInterval);
    return () => clearTimeout(timeoutId);
  }, [next, rotationInterval, auto, paused, activeIndex]);

  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!highlight || !content) {
      width.set('auto');
      return undefined;
    }
    let controls = null;
    let settled = false;
    const fit = () => {
      const target = content.offsetWidth + 1;
      controls?.stop();
      if (!settled || reduceMotion) {
        settled = true;
        width.set(target);
        return;
      }
      controls = animateValue(width, target, WIDTH_SPRING);
    };
    fit();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    observer?.observe(content);
    return () => {
      observer?.disconnect();
      controls?.stop();
    };
  }, [highlight, reduceMotion, width]);

  const handleMouseEnter = event => {
    if (pauseOnHover) setHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = event => {
    setHovered(false);
    onMouseLeave?.(event);
  };

  const motionPreset = (EFFECTS[effect] ?? EFFECTS.slide)(direction !== 'down');
  const blurAmount = blur > 0 ? blur : effect === 'blur' ? 10 : 0;
  const enterState = initial ?? motionPreset.initial;
  const restState = animate ?? motionPreset.animate;
  const leaveState = exit ?? motionPreset.exit;
  const charTransition = transition ?? motionPreset.transition;
  const exitTransition = transition || exit ? null : motionPreset.exitTransition;
  const enterFrom = blurAmount > 0 ? withFilter(enterState, `blur(${blurAmount}px)`) : enterState;
  const enterTo = blurAmount > 0 ? withFilter(restState, 'blur(0px)') : restState;
  const leaveTo = blurAmount > 0 ? withFilter(leaveState, `blur(${blurAmount}px)`) : leaveState;
  const charStyle = effect === 'flip' ? FLIP_STYLE : undefined;

  const blockStyle = highlight
    ? { ...style, width, backgroundColor: highlightColor, color: readableText(highlightColor) ?? style?.color }
    : style;

  const presence = (
    <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
      <motion.span
        key={activeIndex}
        className={cn(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
        layout={!highlight}
        aria-hidden="true"
      >
        {elements.map((wordObj, wordIndex, array) => {
          const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0);
          return (
            <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
              {wordObj.characters.map((char, charIndex) => {
                const delay = getStaggerDelay(previousCharsCount + charIndex);
                return (
                  <motion.span
                    key={charIndex}
                    initial={enterFrom}
                    animate={enterTo}
                    exit={exitTransition ? { ...leaveTo, transition: { ...exitTransition, delay } } : leaveTo}
                    transition={{ ...charTransition, delay }}
                    className={cn('text-rotate-element', elementLevelClassName)}
                    style={charStyle}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
            </span>
          );
        })}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={cn('text-rotate', highlight && 'text-rotate-highlight', mainClassName)}
        {...rest}
        style={blockStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        layout={!highlight}
        transition={transition ?? LAYOUT_SPRING}
      >
        <span className="text-rotate-sr-only">{texts[activeIndex]}</span>
        {highlight ? (
          <span ref={contentRef} className="text-rotate-highlight-content">
            {presence}
          </span>
        ) : (
          presence
        )}
      </motion.span>
    </MotionConfig>
  );
});

RotatingText.displayName = 'RotatingText';
export default RotatingText;

```

### Component CSS
```css
.text-rotate {
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
}

.text-rotate-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-rotate-word {
  display: inline-flex;
}

.text-rotate-lines {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.text-rotate-element {
  display: inline-block;
}

.text-rotate-space {
  white-space: pre;
}

.text-rotate-highlight {
  box-sizing: content-box;
  flex-wrap: nowrap;
  justify-content: center;
  overflow: hidden;
  padding: 0.1em 0.28em;
  border-radius: 0.16em;
}

.text-rotate-highlight-content {
  display: flex;
  flex-shrink: 0;
  white-space: pre;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.


## Integrate the <GlowCursor /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: GlowCursor
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import GlowCursor from './GlowCursor';

<div style={{ position: 'relative', width: '100%', height: '500px' }}>
  <GlowCursor
    color="#5f8bff"
    intensity={1.3}
    trailWidth={3}
    linger={1.4}
    glow={1.2}
    clickBurst
    theme="dark"
  >
    {/* Your content here */}
  </GlowCursor>
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| color | string | '#5f8bff' | Color of the light where it is freshly drawn. |
| secondaryColor | string | - | Color the light cools to as it drifts. Leave it out for a deeper shade of the main color. |
| intensity | number | 1.3 | Brightness of the light. |
| trailWidth | number | 3 | Thickness of the light where it is drawn, in pixels. |
| linger | number | 1.4 | Seconds the light stays visible before it fades. |
| glow | number | 1.2 | Strength of the soft glow around the light. |
| hotspot | number | 0.8 | Strength of the white-hot core near the cursor. |
| followSpeed | number | 0.6 | How tightly the light follows the cursor, from 0 to 1. |
| grain | number | 0 | Amount of film grain in the light. |
| clickBurst | boolean | true | Releases a burst of light when you click. |
| quality | 'low' | 'medium' | 'high' | 'high' | Resolution of the simulation. Lower it for weaker devices. |
| theme | 'dark' | 'light' | 'dark' | Use light on light backgrounds for an ink-like look. |
| blendMode | string | auto | CSS blend mode of the canvas. Defaults to screen in dark and normal in light. |
| maxDevicePixelRatio | number | 2 | Maximum pixel density of the canvas. |
| enabled | boolean | true | Stops drawing new light while keeping what is already there. |
| children | ReactNode | - | Content rendered above the light. |
| className | string | '' | Extra class names for the container. |
| style | CSSProperties | - | Inline styles for the container. |

### Full Component Source
```jsx
'use client';

import { useEffect, useRef } from 'react';

import './GlowCursor.css';

const VERTEX = `#version 300 es
in vec2 aPosition;
uniform vec2 uTexel;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

const SPLAT = `${HEADER}
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uA;
uniform vec2 uB;
uniform float uRadius;
uniform float uWide;
uniform vec3 uValue;
uniform float uMode;
uniform float uStrength;
float erf(float x) {
  float x2 = x * x;
  float a = 0.147;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));
}
float sweep(float along, float length, float across, float radius) {
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));
}
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 a = vec2(uA.x * uAspect, uA.y);
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;
  float len = length(ab);
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);
  vec2 ap = p - a;
  vec3 base = texture(uTarget, vUv).xyz;
  if (uMode > 1.5) {
    float along = dot(ap, dir);
    float across = dot(ap, vec2(-dir.y, dir.x));
    if (uMode > 2.5) {
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);
      return;
    }
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));
    outColor = vec4(base + add, 1.0);
    return;
  }
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
  vec2 d = ap - ab * h;
  float r2 = dot(d, d);
  float falloff = exp(-r2 / (uRadius * uRadius));
  float wide = exp(-r2 / (uWide * uWide));
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);
  outColor = vec4(result, 1.0);
}`;

const ADVECT = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uVelocityTexel;
uniform float uDt;
uniform vec4 uDecay;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
  outColor = texture(uSource, coord) * uDecay;
}`;

const MACCORMACK = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform sampler2D uForward;
uniform sampler2D uBack;
uniform vec2 uVelocityTexel;
uniform vec2 uSourceTexel;
uniform float uDt;
uniform vec4 uDecay;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
  vec4 forward = texture(uForward, vUv);
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;
  vec4 a = texture(uSource, base);
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));
  vec4 d = texture(uSource, base + uSourceTexel);
  vec4 low = min(min(a, b), min(c, d));
  vec4 high = max(max(a, b), max(c, d));
  outColor = clamp(corrected, low, high) * uDecay;
}`;

const DIVERGENCE = `${HEADER}
uniform sampler2D uVelocity;
void main() {
  float left = texture(uVelocity, vL).x;
  float right = texture(uVelocity, vR).x;
  float top = texture(uVelocity, vT).y;
  float bottom = texture(uVelocity, vB).y;
  vec2 center = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) left = -center.x;
  if (vR.x > 1.0) right = -center.x;
  if (vT.y > 1.0) top = -center.y;
  if (vB.y < 0.0) bottom = -center.y;
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}`;

const SCALE = `${HEADER}
uniform sampler2D uSource;
uniform float uValue;
void main() {
  outColor = texture(uSource, vUv) * uValue;
}`;

const PRESSURE = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float left = texture(uPressure, vL).x;
  float right = texture(uPressure, vR).x;
  float top = texture(uPressure, vT).x;
  float bottom = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float left = texture(uPressure, vL).x;
  float right = texture(uPressure, vR).x;
  float top = texture(uPressure, vT).x;
  float bottom = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);
  outColor = vec4(velocity, 0.0, 1.0);
}`;

const SHADE = `
uniform vec3 uColor;
uniform vec3 uSecondary;
uniform float uIntensity;
uniform float uHotspot;
vec3 shade(vec3 dye) {
  float energy = max(dye.x, 0.0);
  float heat = clamp(dye.y, 0.0, energy);
  float gas = max(dye.z, 0.0);
  float fresh = heat / max(energy, 0.0001);
  vec3 tint = mix(uSecondary, uColor, fresh);
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;
}
`;

const PREFILTER = `${HEADER}${SHADE}
uniform sampler2D uDye;
uniform vec2 uDyeTexel;
void main() {
  vec2 o = uDyeTexel * 0.5;
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);
  outColor = vec4(light * 0.25, 1.0);
}`;

const DOWN = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uSourceTexel;
void main() {
  vec2 o = uSourceTexel;
  vec3 color = texture(uSource, vUv).rgb * 4.0;
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;
  outColor = vec4(color / 8.0, 1.0);
}`;

const UP = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uSourceTexel;
void main() {
  vec2 o = uSourceTexel;
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;
  outColor = vec4(color / 12.0, 1.0);
}`;

const DISPLAY = `${HEADER}${SHADE}
uniform sampler2D uDye;
uniform sampler2D uBloom;
uniform float uGlow;
uniform float uGrain;
uniform float uTime;
uniform float uLight;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
void main() {
  vec3 dye = texture(uDye, vUv).xyz;
  vec3 light = shade(dye);
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;
  if (uLight > 0.5) {
    float energy = max(dye.x, 0.0);
    float heat = clamp(dye.y, 0.0, energy);
    float gas = max(dye.z, 0.0);
    float fresh = heat / max(energy, 0.0001);
    vec3 tint = mix(uSecondary, uColor, fresh);
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));
    density = clamp(density * grain, 0.0, 1.0) * edge;
    outColor = vec4(ink * density, density);
  } else {
    vec3 color = 1.0 - exp(-(light + bloom) * grain);
    color *= edge;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`;

const QUALITY = {
  low: { sim: 96, dye: 384 },
  medium: { sim: 128, dye: 576 },
  high: { sim: 160, dye: 768 }
};

const PRESSURE_STEPS = 20;
const FLOW = 0.75;
const BLOOM_LEVELS = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const toHsv = ([r, g, b]) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];
};

const fromHsv = (hue, saturation, value) => {
  const h = (((hue % 360) + 360) % 360) / 60;
  const c = value * saturation;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = value - c;
  const [r, g, b] =
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
};

const GlowCursor = ({
  color = '#5f8bff',
  secondaryColor,
  intensity = 1.3,
  trailWidth = 3,
  linger = 1.4,
  glow = 1.2,
  hotspot = 0.8,
  followSpeed = 0.6,
  grain = 0,
  clickBurst = true,
  quality = 'high',
  theme = 'dark',
  blendMode,
  maxDevicePixelRatio = 2,
  enabled = true,
  children,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const settingsRef = useRef(null);
  settingsRef.current = {
    color: String(color),
    secondaryColor: secondaryColor ? String(secondaryColor) : '',
    intensity: Math.max(0, intensity),
    trailWidth: clamp(trailWidth, 0.5, 40),
    linger: clamp(linger, 0.1, 10),
    glow: Math.max(0, glow),
    hotspot: Math.max(0, hotspot),
    followSpeed: clamp(followSpeed, 0, 1),
    grain: Math.max(0, grain),
    clickBurst,
    quality: QUALITY[quality] ? quality : 'high',
    theme,
    maxDevicePixelRatio,
    enabled
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
    if (!vertexShader) return undefined;

    const build = source => {
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);
      const program = gl.createProgram();
      if (!fragment || !program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, 'aPosition');
      gl.linkProgram(program);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }
      const uniforms = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
      return { program, uniforms };
    };

    const passes = {
      splat: build(SPLAT),
      advect: build(ADVECT),
      maccormack: build(MACCORMACK),
      divergence: build(DIVERGENCE),
      scale: build(SCALE),
      pressure: build(PRESSURE),
      gradient: build(GRADIENT),
      prefilter: build(PREFILTER),
      down: build(DOWN),
      up: build(UP),
      display: build(DISPLAY)
    };
    if (Object.values(passes).some(pass => !pass)) return undefined;

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const probeContext = probe.getContext('2d', { willReadFrequently: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const state = {
      width: 1,
      height: 1,
      ratio: 1,
      colorKey: '',
      color: [0.37, 0.55, 1],
      secondary: [0.25, 0.3, 1],
      pointer: { x: 0, y: 0, inside: false },
      emitter: { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, travelled: 0 },
      ready: false,
      bursts: [],
      active: -Infinity,
      time: 0,
      allocated: '',
      targets: null
    };
    let raf = 0;
    let last = 0;
    let alive = true;
    let visible = true;

    const toRgb = (value, fallback) => {
      if (!probeContext || !value) return fallback;
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? `#${value}` : value;
      probeContext.clearRect(0, 0, 1, 1);
      probeContext.fillStyle = '#000000';
      probeContext.fillStyle = css;
      probeContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255];
    };

    const resolveColors = s => {
      const key = `${s.color}|${s.secondaryColor}`;
      if (key === state.colorKey) return;
      state.colorKey = key;
      state.color = toRgb(s.color, [0.37, 0.55, 1]);
      if (s.secondaryColor) {
        state.secondary = toRgb(s.secondaryColor, state.color);
      } else {
        const [hue, saturation, value] = toHsv(state.color);
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);
      }
    };

    const createTarget = (width, height, internalFormat, format, filter) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };
    };

    const createPair = (width, height, internalFormat, format, filter) => {
      let read = createTarget(width, height, internalFormat, format, filter);
      let write = createTarget(width, height, internalFormat, format, filter);
      return {
        get read() {
          return read;
        },
        get write() {
          return write;
        },
        swap() {
          const next = read;
          read = write;
          write = next;
        },
        targets() {
          return [read, write];
        }
      };
    };

    const destroyTarget = target => {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.fbo);
    };

    const release = () => {
      const t = state.targets;
      if (!t) return;
      [
        ...t.velocity.targets(),
        ...t.dye.targets(),
        ...t.pressure.targets(),
        t.divergence,
        t.forward,
        t.back,
        ...t.bloom
      ].forEach(destroyTarget);
      state.targets = null;
    };

    const clearTargets = () => {
      const t = state.targets;
      if (!t) return;
      gl.clearColor(0, 0, 0, 0);
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
      });
    };

    const allocate = () => {
      const s = settingsRef.current;
      const key = `${s.quality}|${state.width}|${state.height}|${canvas.width}|${canvas.height}`;
      if (key === state.allocated && state.targets) return;
      release();
      state.allocated = key;
      const preset = QUALITY[s.quality];
      const aspect = state.width / state.height;
      const dims = base => (aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)]);
      const [simW, simH] = dims(preset.sim);
      let [dyeW, dyeH] = dims(preset.dye);
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);
      dyeW = Math.max(2, Math.round(dyeW * shrink));
      dyeH = Math.max(2, Math.round(dyeH * shrink));
      const bloom = [];
      let bloomW = dyeW >> 1;
      let bloomH = dyeH >> 1;
      for (let i = 0; i < BLOOM_LEVELS; i++) {
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));
        bloomW >>= 1;
        bloomH >>= 1;
      }
      state.targets = {
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
        bloom
      };
    };

    const resize = () => {
      const s = settingsRef.current;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      state.width = width;
      state.height = height;
      state.ratio = ratio;
      allocate();
    };

    const draw = target => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.width, target.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const use = (pass, texel) => {
      gl.useProgram(pass.program);
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);
      return pass.uniforms;
    };

    const bind = (unit, target) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      return unit;
    };

    const splat = (pair, ax, ay, bx, by, radius, value, mode, strength, wide = radius) => {
      const u = use(passes.splat, pair.read.texel);
      gl.uniform1i(u.uTarget, bind(0, pair.read));
      gl.uniform1f(u.uAspect, state.width / state.height);
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);
      gl.uniform1f(u.uRadius, radius / state.height);
      gl.uniform1f(u.uWide, wide / state.height);
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);
      gl.uniform1f(u.uMode, mode);
      gl.uniform1f(u.uStrength, strength);
      draw(pair.write);
      pair.swap();
    };

    const toGrid = (vx, vy) => {
      const { velocity } = state.targets;
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];
    };

    const lightRadius = s => Math.max(s.trailWidth * 0.5, (state.height / state.targets.dye.read.height) * 0.9);

    const emit = (s, dt, now) => {
      const { emitter, pointer } = state;
      const { velocity, dye } = state.targets;
      emitter.px = emitter.x;
      emitter.py = emitter.y;
      if (reduce || s.followSpeed >= 1) {
        emitter.x = pointer.x;
        emitter.y = pointer.y;
      } else {
        const omega = 10 + s.followSpeed * 50;
        const steps = Math.max(1, Math.ceil(dt / 0.004));
        const h = dt / steps;
        for (let k = 0; k < steps; k++) {
          emitter.vx += (omega * omega * (pointer.x - emitter.x) - 2 * omega * emitter.vx) * h;
          emitter.vy += (omega * omega * (pointer.y - emitter.y) - 2 * omega * emitter.vy) * h;
          emitter.x += emitter.vx * h;
          emitter.y += emitter.vy * h;
        }
      }
      const dx = emitter.x - emitter.px;
      const dy = emitter.y - emitter.py;
      const length = Math.hypot(dx, dy);
      if (length < 0.05 || !s.enabled) return;
      const radius = lightRadius(s);
      if (!reduce) {
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));
        splat(
          velocity,
          emitter.px,
          emitter.py,
          emitter.x,
          emitter.y,
          radius * 4 + 18,
          [target[0], target[1], 0],
          3,
          FLOW * 0.6
        );
      }
      splat(dye, emitter.px, emitter.py, emitter.x, emitter.y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);
      state.active = now;
    };

    const burst = (s, x, y, now) => {
      const { velocity, dye } = state.targets;
      const radius = lightRadius(s);
      const jets = 6;
      const base = Math.random() * Math.PI * 2;
      for (let k = 0; k < jets; k++) {
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const cx = Math.cos(angle);
        const cy = Math.sin(angle);
        const reach = 20 + Math.random() * 14;
        const ax = x + cx * 3;
        const ay = y + cy * 3;
        const bx = x + cx * reach;
        const by = y + cy * reach;
        if (!reduce) {
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);
        }
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);
      }
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);
      state.active = now;
    };

    const step = (s, dt) => {
      const { velocity, dye, pressure, divergence } = state.targets;
      if (!reduce) {
        let u = use(passes.divergence, velocity.read.texel);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        draw(divergence);

        u = use(passes.scale, pressure.read.texel);
        gl.uniform1i(u.uSource, bind(0, pressure.read));
        gl.uniform1f(u.uValue, 0.8);
        draw(pressure.write);
        pressure.swap();

        u = use(passes.pressure, pressure.read.texel);
        gl.uniform1i(u.uDivergence, bind(1, divergence));
        for (let i = 0; i < PRESSURE_STEPS; i++) {
          gl.uniform1i(u.uPressure, bind(0, pressure.read));
          draw(pressure.write);
          pressure.swap();
        }

        u = use(passes.gradient, velocity.read.texel);
        gl.uniform1i(u.uPressure, bind(0, pressure.read));
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));
        draw(velocity.write);
        velocity.swap();

        u = use(passes.advect, velocity.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(0, velocity.read));
        gl.uniform1f(u.uDt, dt);
        const calm = Math.exp(-dt * 1.2);
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);
        draw(velocity.write);
        velocity.swap();
      }

      const decay = [
        Math.exp((-dt * 4.6) / (s.linger * 0.8)),
        Math.exp((-dt * 4.6) / (s.linger * 0.2)),
        Math.exp((-dt * 4.6) / (s.linger * 1.2)),
        1
      ];
      const { forward, back } = state.targets;
      if (reduce) {
        const u = use(passes.advect, dye.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(1, dye.read));
        gl.uniform1f(u.uDt, 0);
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);
        draw(dye.write);
        dye.swap();
        return;
      }
      let u = use(passes.advect, dye.read.texel);
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));
      gl.uniform1i(u.uSource, bind(1, dye.read));
      gl.uniform1f(u.uDt, dt);
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);
      draw(forward);
      gl.uniform1i(u.uSource, bind(1, forward));
      gl.uniform1f(u.uDt, -dt);
      draw(back);
      u = use(passes.maccormack, dye.read.texel);
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));
      gl.uniform1i(u.uSource, bind(1, dye.read));
      gl.uniform1i(u.uForward, bind(2, forward));
      gl.uniform1i(u.uBack, bind(3, back));
      gl.uniform1f(u.uDt, dt);
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);
      draw(dye.write);
      dye.swap();
    };

    const setShade = (u, s) => {
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);
      gl.uniform1f(u.uIntensity, s.intensity);
      gl.uniform1f(u.uHotspot, s.hotspot);
    };

    const render = s => {
      const { dye, bloom } = state.targets;
      if (s.glow > 0) {
        let u = use(passes.prefilter, bloom[0].texel);
        gl.uniform1i(u.uDye, bind(0, dye.read));
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);
        setShade(u, s);
        draw(bloom[0]);
        u = use(passes.down, bloom[0].texel);
        for (let i = 1; i < bloom.length; i++) {
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);
          draw(bloom[i]);
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        u = use(passes.up, bloom[0].texel);
        for (let i = bloom.length - 1; i > 0; i--) {
          gl.uniform1i(u.uSource, bind(0, bloom[i]));
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);
          draw(bloom[i - 1]);
        }
        gl.disable(gl.BLEND);
      }
      const u = use(passes.display, [1 / canvas.width, 1 / canvas.height]);
      gl.uniform1i(u.uDye, bind(0, dye.read));
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));
      setShade(u, s);
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);
      gl.uniform1f(u.uGrain, s.grain);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);
      draw(null);
    };

    const blank = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const frame = now => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
      last = now;
      state.time += dt;
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));
      if (Math.abs(wanted - state.ratio) > 0.01) resize();
      allocate();
      resolveColors(s);
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);

      if (state.ready) emit(s, dt, now);
      while (state.bursts.length) {
        const [x, y] = state.bursts.shift();
        burst(s, x, y, now);
      }
      step(s, dt);
      render(s);

      const quiet = now - state.active > s.linger * 1200 + 900;
      const resting = Math.hypot(state.emitter.vx, state.emitter.vy) < 1;
      if (quiet && resting) {
        clearTargets();
        blank();
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onPointerMove = event => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (!inside) {
        if (state.pointer.inside) {
          state.pointer.inside = false;
          state.ready = false;
          wake();
        }
        return;
      }
      if (!state.ready) {
        state.emitter.x = x;
        state.emitter.y = y;
        state.emitter.px = x;
        state.emitter.py = y;
        state.emitter.vx = 0;
        state.emitter.vy = 0;
        state.ready = true;
      }
      state.pointer.x = x;
      state.pointer.y = y;
      state.pointer.inside = true;
      wake();
    };

    const onPointerDown = event => {
      const s = settingsRef.current;
      if (!s.clickBurst || !s.enabled) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      state.bursts.push([x, y]);
      wake();
    };

    const onPointerLeave = () => {
      state.pointer.inside = false;
      state.ready = false;
      wake();
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    blank();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      release();
      Object.values(passes).forEach(pass => gl.deleteProgram(pass.program));
      gl.deleteShader(vertexShader);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');

  return (
    <div ref={containerRef} className={`glow-cursor${className ? ` ${className}` : ''}`} style={style} {...rest}>
      <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: mode }} aria-hidden="true" />
      {children && <div className="glow-cursor__content">{children}</div>}
    </div>
  );
};

export default GlowCursor;

```

### Component CSS
```css
.glow-cursor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.glow-cursor__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
}

.glow-cursor__content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
   ## Integrate the <ScrollVelocity /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: ScrollVelocity
### Variant: JavaScript + CSS
### Dependencies: motion

---

### Usage Example
```jsx
import ScrollVelocity from './ScrollVelocity';

<ScrollVelocity
  texts={['React Bits', 'Scroll Down']}
  velocity={100}
  skewWithVelocity={16}
  scaleWithVelocity={0.18}
  draggable
  fontSize={104}
  fontWeight={900}
  className="custom-scroll-text"
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| scrollContainerRef | React.RefObject<HTMLElement> | undefined | Optional ref for a custom scroll container to track scroll position. |
| texts | React.ReactNode[] | [] | Array of items to display as scrolling content. Accepts strings, JSX elements, icons, or any valid React node. |
| velocity | number | 100 | Base velocity for scrolling; sign is flipped for odd indexed texts. |
| color | string | undefined | Text color of the rows. Follows the surrounding text color when left out. |
| fontSize | number | string | undefined | Size of the row text. Numbers are pixels. Leave it out to use the stylesheet size. |
| fontWeight | number | string | undefined | Weight of the row text. Leave it out to use the stylesheet weight. |
| skewWithVelocity | number | 0 | How far the rows lean into their motion while you scroll or fling them, in degrees at full speed. Eases back to upright when they slow down. |
| scaleWithVelocity | number | 0 | How much the rows stretch taller at full speed, as a fraction of their height. Negative values squash them instead. |
| draggable | boolean | false | Lets you grab a row to scrub it, then throw it to glide on with inertia. |
| outlineAlternate | boolean | false | Draws every other row as outlined text. |
| gap | number | 0 | Extra space between the repeated copies in pixels, split evenly around the separator. |
| className | string | "" | CSS class applied to each text copy (span). |
| damping | number | 50 | Damping value for the spring animation. |
| stiffness | number | 400 | Stiffness value for the spring animation. |
| numCopies | number | 6 | Number of copies of the text rendered for a continuous scrolling effect. |
| separator | React.ReactNode | '' | Shown between the repeated copies, like a dot or a slash. Empty leaves just a space. |
| fadeEdges | boolean | false | Softly fades the rows out at the left and right edges. |
| pauseOnHover | boolean | false | Glides the rows to a stop while the pointer is over them. |
| velocityMapping | { input: number[]; output: number[] } | { input: [0, 1000], output: [0, 5] } | Mapping from scroll velocity to a movement multiplier for dynamic scrolling. |
| parallaxClassName | string | "parallax" | CSS class for the parallax container. |
| scrollerClassName | string | "scroller" | CSS class for the scroller container. |
| parallaxStyle | React.CSSProperties | undefined | Inline styles for the parallax container. |
| scrollerStyle | React.CSSProperties | undefined | Inline styles for the scroller container. |

### Full Component Source
```jsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import './ScrollVelocity.css';

const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

const FADE_STEPS = Array.from({ length: 9 }, (_, i) => i / 8);

const FADE_MASK = `linear-gradient(to right, ${[
  ...FADE_STEPS.map(t => `rgba(0, 0, 0, ${smootherstep(t).toFixed(3)}) ${(t * 12).toFixed(1)}%`),
  ...FADE_STEPS.map(t => `rgba(0, 0, 0, ${smootherstep(1 - t).toFixed(3)}) ${(88 + t * 12).toFixed(1)}%`)
].join(', ')})`;

const OUTLINE_STYLE = {
  WebkitTextFillColor: 'transparent',
  WebkitTextStroke: 'max(1px, 0.028em) currentColor'
};

function wrap(min, max, v) {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof ResizeObserver === 'undefined') {
      const updateWidth = () => setWidth(element.offsetWidth);
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = '',
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  separator,
  pauseOnHover,
  hoveredRef,
  skewWithVelocity,
  scaleWithVelocity,
  outline,
  gap,
  fontSize,
  fontWeight,
  color,
  draggable
}) {
  const baseX = useMotionValue(0);
  const skewX = useMotionValue(0);
  const scaleY = useMotionValue(1);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping?.input || [0, 1000],
    velocityMapping?.output || [0, 5],
    { clamp: false }
  );
  const reduceMotion = useReducedMotion();

  const copyRef = useRef(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, v => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef(1);
  const pace = useRef(1);
  const fling = useRef(0);
  const drag = useRef({ active: false, pointerId: -1, lastX: 0, lastTime: 0, velocity: 0, travel: 0 });

  useAnimationFrame((t, delta) => {
    if (reduceMotion) return;

    const grab = drag.current;
    const seconds = Math.min(delta, 64) / 1000;
    const targetPace = grab.active || (pauseOnHover && hoveredRef.current) ? 0 : 1;
    pace.current += (targetPace - pace.current) * (1 - Math.exp(-delta / 150));

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    let travel = moveBy * pace.current;

    if (!grab.active && fling.current !== 0) {
      travel += fling.current * seconds;
      fling.current *= Math.exp(-delta / 420);
      if (Math.abs(fling.current) < 4) fling.current = 0;
    }

    baseX.set(baseX.get() + travel);

    if (!skewWithVelocity && !scaleWithVelocity && skewX.get() === 0 && scaleY.get() === 1) return;

    const thrown = grab.active ? grab.velocity : fling.current;
    const scrollSurge = Math.tanh(Math.abs(smoothVelocity.get()) / 1600) * pace.current;
    const throwSurge = Math.tanh(Math.abs(thrown) / 2000);
    const surge = Math.max(scrollSurge, throwSurge);
    const heading =
      throwSurge > scrollSurge
        ? Math.sign(thrown)
        : Math.sign(travel) || directionFactor.current * Math.sign(baseVelocity);
    const ease = 1 - Math.exp(-delta / 110);
    const nextSkew = skewX.get() + (-heading * skewWithVelocity * surge - skewX.get()) * ease;
    const nextScale = scaleY.get() + (1 + scaleWithVelocity * surge - scaleY.get()) * ease;
    skewX.set(Math.abs(nextSkew) < 0.01 && !skewWithVelocity ? 0 : nextSkew);
    scaleY.set(Math.abs(nextScale - 1) < 0.0005 && !scaleWithVelocity ? 1 : nextScale);
  });

  const handlePointerDown = event => {
    if (!draggable || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const grab = drag.current;
    grab.active = true;
    grab.pointerId = event.pointerId;
    grab.lastX = event.clientX;
    grab.lastTime = event.timeStamp;
    grab.velocity = 0;
    grab.travel = 0;
    fling.current = 0;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.style.cursor = 'grabbing';
  };

  const handlePointerMove = event => {
    const grab = drag.current;
    if (!grab.active || event.pointerId !== grab.pointerId) return;
    const dx = event.clientX - grab.lastX;
    const dt = Math.max(event.timeStamp - grab.lastTime, 1);
    grab.lastX = event.clientX;
    grab.lastTime = event.timeStamp;
    grab.travel += Math.abs(dx);
    baseX.set(baseX.get() + dx);
    grab.velocity += ((dx / dt) * 1000 - grab.velocity) * (1 - Math.exp(-dt / 50));
  };

  const handlePointerUp = event => {
    const grab = drag.current;
    if (!grab.active || event.pointerId !== grab.pointerId) return;
    grab.active = false;
    const resting = event.timeStamp - grab.lastTime > 90;
    fling.current = resting ? 0 : Math.max(-5000, Math.min(5000, grab.velocity));
    grab.velocity = 0;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = 'grab';
  };

  const handleClickCapture = event => {
    if (drag.current.travel > 6) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span
        className={className}
        key={i}
        ref={i === 0 ? copyRef : null}
        aria-hidden={i > 0 ? true : undefined}
        style={!separator && gap > 0 ? { paddingRight: gap } : undefined}
      >
        {children}&nbsp;
        {separator ? (
          <>
            <span style={gap > 0 ? { margin: `0 ${gap / 2}px` } : undefined}>{separator}</span>&nbsp;
          </>
        ) : null}
      </span>
    );
  }

  const typeStyle = {
    ...(fontSize !== undefined
      ? { fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize, lineHeight: 1 }
      : {}),
    ...(fontWeight !== undefined ? { fontWeight } : {}),
    ...(color ? { color } : {}),
    ...(outline ? OUTLINE_STYLE : {})
  };

  return (
    <div
      className={parallaxClassName}
      style={{
        ...(draggable ? { cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' } : {}),
        ...parallaxStyle
      }}
      onPointerDown={draggable ? handlePointerDown : undefined}
      onPointerMove={draggable ? handlePointerMove : undefined}
      onPointerUp={draggable ? handlePointerUp : undefined}
      onPointerCancel={draggable ? handlePointerUp : undefined}
      onClickCapture={draggable ? handleClickCapture : undefined}
    >
      <motion.div className={scrollerClassName} style={{ x, skewX, scaleY, ...typeStyle, ...scrollerStyle }}>
        {spans}
      </motion.div>
    </div>
  );
}

export const ScrollVelocity = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = 'parallax',
  scrollerClassName = 'scroller',
  parallaxStyle,
  scrollerStyle,
  separator = '',
  pauseOnHover = false,
  fadeEdges = false,
  skewWithVelocity = 0,
  scaleWithVelocity = 0,
  outlineAlternate = false,
  gap = 0,
  fontSize,
  fontWeight,
  color,
  draggable = false
}) => {
  const hoveredRef = useRef(false);

  return (
    <section
      style={{ width: '100%', ...(fadeEdges ? { WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK } : {}) }}
      onPointerEnter={() => {
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
      }}
    >
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
          separator={separator}
          pauseOnHover={pauseOnHover}
          hoveredRef={hoveredRef}
          skewWithVelocity={skewWithVelocity}
          scaleWithVelocity={scaleWithVelocity}
          outline={outlineAlternate && index % 2 !== 0}
          gap={gap}
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={color}
          draggable={draggable}
        >
          {text}
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;

```

### Component CSS
```css
.parallax {
  position: relative;
  overflow: hidden;
}

.scroller {
  display: flex;
  white-space: nowrap;
  text-align: center;
  font-family: sans-serif;
  font-size: 2.25rem;
  font-weight: bold;
  letter-spacing: -0.02em;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
}

.scroller span {
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .scroller {
    font-size: 5rem;
    line-height: 5rem;
  }
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.


## Integrate the <AnimatedContent /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: AnimatedContent
### Variant: JavaScript + CSS
### Dependencies: gsap

---

### Usage Example
```jsx
import AnimatedContent from './AnimatedContent'

<AnimatedContent
  distance={100}
  direction="vertical"
  duration={0.8}
  ease="power3.out"
  blur={0}
  stagger={0.08}
  threshold={0.1}
>
  <h2>Ship it before lunch</h2>
  <p>Every child animates in turn.</p>
</AnimatedContent>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | The content to animate. |
| container | string | HTMLElement | window | Scroll container that drives the animation, as a selector or an element. Defaults to the page. |
| distance | number | 100 | How far the content travels into place, in px. |
| direction | 'vertical' | 'horizontal' | 'vertical' | Axis the content travels along. |
| reverse | boolean | false | Comes in from the opposite side: from above, or from the left. |
| duration | number | 0.8 | Length of the animation, in seconds. |
| ease | string | 'power3.out' | Any GSAP ease, such as 'expo.out', 'back.out(1.6)' or 'elastic.out(1, 0.5)'. |
| initialOpacity | number | 0 | Opacity the content starts from. |
| animateOpacity | boolean | true | Fades the content in. Turn off to keep it fully opaque while it moves. |
| scale | number | 1 | Scale the content starts from. |
| blur | number | 0 | Blur the content starts from, in px. It comes into focus as it lands. |
| rotate | number | 0 | Rotation the content starts from, in degrees. |
| tilt | number | 0 | Tips the content back in 3D, in degrees, so it flips up into place. |
| wipe | 'none' | 'up' | 'down' | 'left' | 'right' | 'center' | 'none' | Reveals the content behind a soft moving edge instead of all at once. |
| threshold | number | 0.1 | How far into the viewport the top of the content must be before it animates, from 0 to 1. |
| delay | number | 0 | Wait before the animation starts, in seconds. |
| stagger | number | 0 | Animates each direct child in turn, this many seconds apart. Great for lists and grids. |
| staggerFrom | 'start' | 'end' | 'center' | 'edges' | 'random' | 'start' | Which child goes first when staggering. |
| trigger | 'scroll' | 'mount' | 'scroll' | Animate when the content scrolls into view, or right away. |
| once | boolean | true | Plays once. Turn off to replay every time the content scrolls in, and reverse when it scrolls back out. |
| scrub | boolean | number | false | Ties the animation to the scroll position. A number smooths it, in seconds. |
| disappearAfter | number | 0 | Hides the content again this many seconds after it appears. 0 keeps it shown. |
| disappearDuration | number | 0.5 | Length of the hide animation, in seconds. |
| disappearEase | string | 'power3.in' | GSAP ease of the hide animation. |
| onStart | () => void | - | Called when the animation starts. |
| onComplete | () => void | - | Called when the animation finishes. |
| onDisappearanceComplete | () => void | - | Called when the hide animation finishes. |
| className | string | '' | Extra class names for the wrapper. |
| style | CSSProperties | - | Inline styles for the wrapper. |

### Full Component Source
```jsx
'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const WIPES = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

const AnimatedContent = ({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  scrub = false,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
  ...props
}) => {
  const ref = useRef(null);
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let scroller = container || document.getElementById('snap-main-container') || null;
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const ctx = gsap.context(() => {
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
      const horizontal = direction === 'horizontal';
      const axis = horizontal ? 'x' : 'y';
      const sign = reverse ? -1 : 1;
      const mask = WIPES[wipe];

      gsap.set(el, { visibility: 'visible' });

      if (reduce) {
        callbacksRef.current.onComplete?.();
        return;
      }

      const from = {
        [axis]: distance * sign,
        scale,
        opacity: animateOpacity ? initialOpacity : 1
      };
      const to = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease
      };

      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = 'blur(0px)';
      }
      if (rotate) {
        from.rotation = rotate * sign;
        to.rotation = 0;
      }
      if (tilt) {
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from['--ac-wipe'] = 0;
        to['--ac-wipe'] = 1;
      }
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

      const settle = () => {
        if (scrub) return;
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });
      };

      const disappear = () => {
        if (disappearAfter <= 0) return;
        const out = {
          [axis]: -distance * sign,
          scale: 0.8,
          opacity: animateOpacity ? initialOpacity : 0,
          delay: disappearAfter,
          duration: disappearDuration,
          ease: disappearEase,
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()
        };
        if (blur > 0) out.filter = `blur(${blur}px)`;
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
        gsap.to(targets, out);
      };

      const tl = gsap.timeline({
        paused: true,
        onStart: () => callbacksRef.current.onStart?.(),
        onComplete: () => {
          callbacksRef.current.onComplete?.();
          settle();
          if (once && !scrub) disappear();
        }
      });
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

      if (trigger === 'mount') {
        tl.play();
        return;
      }

      const start = `top ${(1 - threshold) * 100}%`;

      if (scrub) {
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start,
          end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
          animation: tl
        });
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        scroller,
        start,
        once,
        onEnter: () => tl.play(),
        onLeaveBack: once
          ? undefined
          : () => {
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            }
      });
    }, el);

    return () => ctx.revert();
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    rotate,
    tilt,
    wipe,
    threshold,
    delay,
    stagger,
    staggerFrom,
    trigger,
    once,
    scrub,
    disappearAfter,
    disappearDuration,
    disappearEase
  ]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import and render the component using the usage example above as a starting point.
4. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.

## Integrate the <OrbitImages /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: OrbitImages
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
// Component created by Dominik Koch
// https://x.com/dominikkoch

import OrbitImages from './OrbitImages'

const images = [
  "https://picsum.photos/300/300?grayscale&random=1",
  "https://picsum.photos/300/300?grayscale&random=2",
  "https://picsum.photos/300/300?grayscale&random=3",
  "https://picsum.photos/300/300?grayscale&random=4",
  "https://picsum.photos/300/300?grayscale&random=5",
  "https://picsum.photos/300/300?grayscale&random=6",
];

<OrbitImages
  images={images}
  shape="ellipse"
  radiusX={340}
  radiusY={80}
  rotation={-8}
  duration={30}
  itemSize={90}
  depth={0.6}
  showPath
  centerContent={<h2>Moments</h2>}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| images | Array<string | { src: string; alt?: string }> | [] | Images that travel along the path, as URLs or objects with their own alt text. |
| altPrefix | string | 'Orbiting image' | Prefix for the alt text of images given as plain URLs. |
| shape | 'ellipse' | 'circle' | 'square' | 'rectangle' | 'triangle' | 'star' | 'heart' | 'infinity' | 'wave' | 'custom' | 'ellipse' | Shape of the path the images follow. |
| customPath | string | undefined | Your own SVG path, drawn in a baseWidth by baseWidth space. Used when shape is custom. |
| baseWidth | number | 1400 | Size of the coordinate space for the radii, the item size and custom paths. |
| radiusX | number | 700 | Horizontal radius for the ellipse, rectangle, infinity and wave. |
| radiusY | number | 170 | Vertical radius for the ellipse, rectangle, infinity and wave. |
| radius | number | 300 | Radius for the circle, square, triangle, star and heart. |
| starPoints | number | 5 | Number of points on the star. |
| starInnerRatio | number | 0.5 | Inner radius of the star as a fraction of the outer one. |
| rotation | number | -8 | Rotation of the whole path in degrees. Images stay upright. |
| duration | number | 40 | Seconds for one full lap. |
| itemSize | number | 64 | Size of each image, in the same units as the radii. |
| direction | 'normal' | 'reverse' | 'normal' | Which way the images travel. |
| fill | boolean | true | Spreads the images evenly around the whole path. Turn it off to make them follow each other in a train. |
| depth | number | 0.5 | Sense of depth, from 0 to 1. Images at the back get smaller, dimmer and pass behind the center content, and images at the front grow and pass in front of it. |
| alignToPath | boolean | false | Turns each image to follow the curve instead of staying upright. |
| itemRadius | number | string | 12 | Corner radius of the images, in the same units as itemSize, or any CSS length. Half of itemSize makes circles. |
| shadow | number | 0.3 | Strength of the soft shadow under each image, from 0 to 1. |
| hoverScale | number | 1.08 | How much an image grows when hovered. |
| hoverSpeed | number | 0.3 | Speed while the orbit is hovered, as a fraction of the normal speed. 0 pauses it and 1 keeps full speed. |
| draggable | boolean | true | Lets people drag or swipe sideways to spin the orbit, and fling it. |
| clickToFront | boolean | true | Clicking an image glides it around to the front. |
| onItemClick | (index: number, src: string) => void | undefined | Called when an image is clicked. When set, the images become keyboard-focusable buttons. |
| showPath | boolean | false | Draws the path the images follow. |
| pathColor | string | 'rgba(128,128,128,0.35)' | Color of the path line. |
| pathWidth | number | 2 | Width of the path line in pixels. |
| pathDash | number | 0 | Dash length of the path line in pixels. 0 draws a solid line. |
| easing | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear' | Easing applied to each lap. |
| paused | boolean | false | Stops the orbit. Dragging still works. |
| intro | boolean | true | Images fan out from the front around the path, and the line draws in, when the orbit first comes into view. |
| centerContent | ReactNode | undefined | Content in the middle of the orbit. With depth, images pass behind and in front of it. |
| width | number | string | '100%' | Width of the container. The orbit scales to fit. |
| height | number | string | 'auto' | Height of the container. Auto matches the shape of the orbit, any other value fits the orbit inside. |
| className | string | '' | Extra class names for the container. |

### Full Component Source
```jsx
'use client';

// Component created by Dominik Koch
// https://x.com/dominikkoch

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './OrbitImages.css';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const SAMPLES = 720;
const FRONT_GROW = 0.3;
const BACK_SHRINK = 0.45;
const BACK_DIM = 0.55;
const INTRO_SPREAD = 1.3;
const INTRO_FADE = 0.45;
const DRAG_THRESHOLD = 5;

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx, cy, r) {
  return generateEllipsePath(cx, cy, r, r);
}

function generateSquarePath(cx, cy, size) {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function generateRectanglePath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function generateTrianglePath(cx, cy, size) {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function generateStarPath(cx, cy, outerR, innerR, points) {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + ' Z';
}

function generateHeartPath(cx, cy, size) {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateInfinityPath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function generateWavePath(cx, cy, w, amplitude, waves) {
  const pts = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }
  return pts.join(' ') + ' Z';
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toCssLength = value => (typeof value === 'number' ? `${value}px` : value);

const wrapSigned = value => value - Math.round(value);

const cubicBezier = (x1, y1, x2, y2) => {
  const sample = (a1, a2, t) => ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;
  const slope = (a1, a2, t) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
  return x => {
    if (x <= 0 || x >= 1) return x;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(x1, x2, t);
      if (Math.abs(s) < 1e-6) break;
      t = clamp(t - (sample(x1, x2, t) - x) / s, 0, 1);
    }
    return sample(y1, y2, t);
  };
};

const EASINGS = {
  linear: t => t,
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  easeInOut: cubicBezier(0.42, 0, 0.58, 1)
};

const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

const estimateAspect = ({ shape, radiusX, radiusY, radius, itemSize }) => {
  const wide = shape === 'ellipse' || shape === 'rectangle' || shape === 'infinity' || shape === 'wave';
  const w = (wide ? radiusX : radius) * 2 + itemSize * 1.6;
  const h = (wide ? radiusY : radius) * 2 + itemSize * 1.6;
  return w > 0 && h > 0 ? w / h : 1;
};

const createEngine = (root, config, setAspect) => {
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const st = {
    lut: null,
    length: 0,
    front: 0,
    yMid: 0,
    yHalf: 1,
    bbox: [0, 0, 1, 1],
    width: 0,
    height: 0,
    scale: 0,
    size: 0,
    items: [],
    strokes: [],
    lap: 0,
    manual: 0,
    glide: 0,
    speed: 1,
    drag: null,
    seek: null,
    hovered: false,
    hoverIndex: -1,
    suppressUntil: 0,
    introStart: -1,
    introDone: !config.current.intro,
    visible: typeof IntersectionObserver === 'undefined',
    reduced: !!query?.matches,
    raf: 0,
    last: 0,
    destroyed: false
  };
  st.speed = st.reduced || config.current.paused ? 0 : 1;

  const collect = () => {
    st.items = Array.from(root.querySelectorAll('[data-orbit-item]')).map(el => ({ el, t: '', o: '', z: '' }));
    st.strokes = Array.from(root.querySelectorAll('[data-orbit-stroke]'));
  };

  const build = () => {
    const cfg = config.current;
    const path = root.querySelector('[data-orbit-path]');
    let length = 0;
    try {
      length = path ? path.getTotalLength() : 0;
    } catch {
      length = 0;
    }
    if (!path || !length || !isFinite(length)) {
      st.lut = null;
      return;
    }
    const lut = new Float32Array(SAMPLES * 2);
    const angle = (cfg.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const origin = cfg.baseWidth / 2;
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    let front = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const point = path.getPointAtLength((i / SAMPLES) * length);
      const dx = point.x - origin;
      const dy = point.y - origin;
      const x = origin + dx * cos - dy * sin;
      const y = origin + dx * sin + dy * cos;
      lut[i * 2] = x;
      lut[i * 2 + 1] = y;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      if (y > lut[front * 2 + 1] + 1e-6) front = i;
    }
    st.lut = lut;
    st.length = length;
    st.front = front / SAMPLES;
    st.yMid = (y0 + y1) / 2;
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);
    const depth = clamp(cfg.depth, 0, 1);
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));
  };

  const layout = () => {
    const cfg = config.current;
    st.width = root.clientWidth;
    st.height = root.clientHeight;
    if (!st.lut) return;
    const [bx0, by0, bx1, by1] = st.bbox;
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;
    st.size = cfg.itemSize * st.scale;
    for (const it of st.items) {
      it.el.style.width = `${st.size}px`;
      it.el.style.height = `${st.size}px`;
    }
    if (!st.scale) return;
    const vw = st.width / st.scale;
    const vh = st.height / st.scale;
    const cx = (bx0 + bx1) / 2;
    const cy = (by0 + by1) / 2;
    root.querySelectorAll('[data-orbit-svg]').forEach(svg => {
      svg.setAttribute('viewBox', `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`);
    });
    const clip = root.querySelector('[data-orbit-clip]');
    if (clip) {
      clip.setAttribute('x', String(cx - vw));
      clip.setAttribute('y', String(st.yMid));
      clip.setAttribute('width', String(vw * 2));
      clip.setAttribute('height', String(vh * 2));
    }
    for (const stroke of st.strokes) {
      stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);
    }
    applyDash(1);
  };

  const applyDash = reveal => {
    const cfg = config.current;
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;
    for (const stroke of st.strokes) {
      if (reveal < 1 && !dash) {
        stroke.style.strokeDasharray = `${st.length} ${st.length}`;
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));
        stroke.style.opacity = '';
      } else {
        stroke.style.strokeDasharray = dash ? `${dash} ${dash * 1.6}` : '';
        stroke.style.strokeDashoffset = '';
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';
      }
    }
  };

  const sample = u => {
    const f = (((u % 1) + 1) % 1) * SAMPLES;
    const i0 = Math.floor(f) % SAMPLES;
    const i1 = (i0 + 1) % SAMPLES;
    const t = f - Math.floor(f);
    const lut = st.lut;
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];
  };

  const heading = u => {
    const a = sample(u - 2 / SAMPLES);
    const b = sample(u + 2 / SAMPLES);
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  };

  const progress = () => {
    const cfg = config.current;
    const ease = EASINGS[cfg.easing] || EASINGS.linear;
    const whole = Math.floor(st.lap);
    return (whole + ease(st.lap - whole)) * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;
  };

  const offsetOf = (index, count) => {
    const cfg = config.current;
    if (cfg.fill) return index / Math.max(1, count);
    return (-index * cfg.itemSize * 1.3) / Math.max(1, st.length);
  };

  const write = (it, key, prop, value) => {
    if (it[key] !== value) {
      it[key] = value;
      it.el.style[prop] = value;
    }
  };

  const render = now => {
    const cfg = config.current;
    if (!st.lut || !st.scale) return;
    const p = progress();
    const count = st.items.length;
    const depth = clamp(cfg.depth, 0, 1);
    const [bx0, by0, bx1, by1] = st.bbox;
    const cx = (bx0 + bx1) / 2;
    const cy = (by0 + by1) / 2;
    const half = st.size / 2;
    const introRunning = st.introStart >= 0;
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;
    for (let i = 0; i < count; i++) {
      const it = st.items[i];
      let u = p + offsetOf(i, count);
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;
      const [x, y] = sample(u);
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);
      const w = (d + 1) / 2;
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));
      let opacity = 1 - depth * BACK_DIM * (1 - w);
      if (introRunning) {
        scale *= 0.7 + 0.3 * appear;
        opacity *= appear * appear * (3 - 2 * appear);
      }
      const sx = (x - cx) * st.scale + st.width / 2 - half;
      const sy = (y - cy) * st.scale + st.height / 2 - half;
      const rot = cfg.alignToPath ? heading(u) : 0;
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;
      if (i === st.hoverIndex) z += 200;
      write(
        it,
        't',
        'transform',
        `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0px)${rot ? ` rotate(${rot.toFixed(2)}deg)` : ''} scale(${scale.toFixed(4)})`
      );
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));
      write(it, 'z', 'zIndex', String(z));
    }
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));
  };

  const frame = now => {
    st.raf = 0;
    if (st.destroyed) return;
    const cfg = config.current;
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;
    st.last = now;
    let busy = false;
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {
      if (cfg.intro && !st.reduced) {
        st.introStart = now;
      } else {
        st.introDone = true;
      }
      root.removeAttribute('data-intro');
    }
    if (st.introStart >= 0) {
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {
        st.introStart = -2;
        st.introDone = true;
        applyDash(1);
      } else {
        busy = true;
      }
    }
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;
    if (st.speed !== want) {
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;
      busy = true;
    }
    if (st.speed > 0 && cfg.duration > 0) {
      st.lap += (dt * st.speed) / cfg.duration;
      busy = true;
    }
    if (st.drag?.active) {
      busy = true;
    } else if (st.seek) {
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;
      st.manual = st.seek.from + st.seek.delta * e;
      if (st.seek.t >= 1) st.seek = null;
      busy = true;
    } else if (st.glide) {
      st.manual += st.glide * dt;
      st.glide *= Math.exp(-dt / 0.7);
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;
      busy = true;
    }
    render(now);
    const whole = Math.floor(st.lap);
    if (whole) st.lap -= whole;
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (st.raf || st.destroyed || !st.visible) return;
    st.last = 0;
    st.raf = requestAnimationFrame(frame);
  };

  const local = e => {
    const r = root.getBoundingClientRect();
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  };

  const dragRate = () => {
    if (!st.lut || !st.scale) return 0;
    const a = sample(st.front - 3 / SAMPLES);
    const b = sample(st.front + 3 / SAMPLES);
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;
    const floor = st.length * st.scale * 0.35;
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;
  };

  const itemIndex = target => {
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;
  };

  const bringToFront = index => {
    if (!st.lut || index < 0) return;
    const u = progress() + offsetOf(index, st.items.length);
    const delta = wrapSigned(st.front - u);
    st.glide = 0;
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };
    wake();
  };

  const onEnter = () => {
    st.hovered = true;
    wake();
  };

  const onLeave = () => {
    st.hovered = false;
    st.hoverIndex = -1;
    wake();
  };

  const onOver = e => {
    const index = itemIndex(e.target);
    if (index !== st.hoverIndex) {
      st.hoverIndex = index;
      if (st.lut) render(performance.now());
    }
  };

  const onDown = e => {
    const cfg = config.current;
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;
    const [x, y] = local(e);
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };
  };

  const onMove = e => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    const [x, y] = local(e);
    const along = x - d.x;
    if (!d.active) {
      if (Math.abs(along) < DRAG_THRESHOLD) return;
      if (Math.abs(y - d.y) > Math.abs(along)) {
        st.drag = null;
        return;
      }
      d.active = true;
      d.anchor = along;
      d.manual = st.manual;
      st.seek = null;
      st.glide = 0;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
      root.setAttribute('data-dragging', '');
    }
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;
    const now = performance.now();
    d.samples.push([now, along]);
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();
    wake();
  };

  const endDrag = (e, cancelled) => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    st.drag = null;
    if (!d.active) return;
    root.removeAttribute('data-dragging');
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {}
    const now = performance.now();
    st.suppressUntil = now + 400;
    const s = d.samples;
    if (!cancelled && s.length > 1 && d.rate) {
      const [t0, a0] = s[0];
      const [t1, a1] = s[s.length - 1];
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);
    }
    wake();
  };

  const onUp = e => endDrag(e, false);
  const onCancel = e => endDrag(e, true);

  const activate = index => {
    const cfg = config.current;
    if (index < 0) return;
    if (cfg.clickToFront) bringToFront(index);
    cfg.onItemClick?.(index, cfg.sources[index]);
  };

  const onClick = e => {
    if (performance.now() < st.suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
      st.suppressUntil = 0;
      return;
    }
    activate(itemIndex(e.target));
  };

  const onKey = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const index = itemIndex(e.target);
    if (index < 0) return;
    e.preventDefault();
    activate(index);
  };

  const onFocus = e => {
    const index = itemIndex(e.target);
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible'))
      bringToFront(index);
  };

  const onMotion = () => {
    st.reduced = !!query?.matches;
    wake();
  };

  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerover', onOver);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('lostpointercapture', onCancel);
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  root.addEventListener('focusin', onFocus);
  query?.addEventListener?.('change', onMotion);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      layout();
      render(performance.now());
      wake();
    });
    resizeObserver.observe(root);
  }

  let intersection = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersection = new IntersectionObserver(
      entries => {
        st.visible = entries[entries.length - 1].isIntersecting;
        if (st.visible) wake();
      },
      { threshold: 0.05 }
    );
    intersection.observe(root);
  }

  const onVisibility = () => {
    if (!document.hidden) wake();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', wake);

  const refresh = () => {
    collect();
    build();
    layout();
    render(performance.now());
    wake();
  };

  const destroy = () => {
    st.destroyed = true;
    if (st.raf) cancelAnimationFrame(st.raf);
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointerover', onOver);
    root.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onCancel);
    root.removeEventListener('lostpointercapture', onCancel);
    root.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKey);
    root.removeEventListener('focusin', onFocus);
    query?.removeEventListener?.('change', onMotion);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', wake);
    resizeObserver?.disconnect();
    intersection?.disconnect();
  };

  return { refresh, wake, destroy };
};

export default function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  shape = 'ellipse',
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = '100%',
  height = 'auto',
  className = '',
  showPath = false,
  pathColor = 'rgba(128,128,128,0.35)',
  pathWidth = 2,
  pathDash = 0,
  easing = 'linear',
  paused = false,
  depth = 0.5,
  itemRadius = 12,
  shadow = 0.3,
  hoverScale = 1.08,
  hoverSpeed = 0.3,
  draggable = true,
  clickToFront = true,
  onItemClick,
  alignToPath = false,
  intro = true,
  centerContent
}) {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const clipId = useId().replace(/:/g, '');
  const [introPending] = useState(intro);
  const [measuredAspect, setAspect] = useState(null);

  const center = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case 'circle':
        return generateCirclePath(center, center, radius);
      case 'ellipse':
        return generateEllipsePath(center, center, radiusX, radiusY);
      case 'square':
        return generateSquarePath(center, center, radius * 2);
      case 'rectangle':
        return generateRectanglePath(center, center, radiusX * 2, radiusY * 2);
      case 'triangle':
        return generateTrianglePath(center, center, radius * 2);
      case 'star':
        return generateStarPath(center, center, radius, radius * starInnerRatio, starPoints);
      case 'heart':
        return generateHeartPath(center, center, radius * 2);
      case 'infinity':
        return generateInfinityPath(center, center, radiusX * 2, radiusY * 2);
      case 'wave':
        return generateWavePath(center, center, radiusX * 2, radiusY, 3);
      case 'custom':
        return customPath || generateCirclePath(center, center, radius);
      default:
        return generateEllipsePath(center, center, radiusX, radiusY);
    }
  }, [shape, customPath, center, radiusX, radiusY, radius, starPoints, starInnerRatio]);

  const items = useMemo(
    () =>
      images.map((image, index) =>
        typeof image === 'string'
          ? { src: image, alt: `${altPrefix} ${index + 1}` }
          : { src: image.src, alt: image.alt ?? `${altPrefix} ${index + 1}` }
      ),
    [images, altPrefix]
  );

  const interactive = !!onItemClick;

  const config = useRef(null);
  config.current = {
    baseWidth,
    rotation,
    duration,
    itemSize,
    direction,
    fill,
    pathWidth,
    pathDash,
    easing,
    paused,
    depth,
    hoverScale,
    hoverSpeed,
    draggable,
    clickToFront,
    onItemClick,
    alignToPath,
    intro,
    sources: items.map(item => item.src)
  };

  useIsomorphicLayoutEffect(() => {
    const engine = createEngine(rootRef.current, config, setAspect);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    engineRef.current?.refresh();
  }, [
    path,
    rotation,
    baseWidth,
    itemSize,
    depth,
    hoverScale,
    items.length,
    showPath,
    pathWidth,
    pathDash,
    measuredAspect,
    height
  ]);

  useEffect(() => {
    engineRef.current?.wake();
  });

  const aspect = measuredAspect ?? estimateAspect({ shape, radiusX, radiusY, radius, itemSize });
  const autoHeight = height === 'auto' || height === undefined;
  const layered = depth > 0 && !!centerContent;

  return (
    <div
      ref={rootRef}
      className={`orbit-container ${className}`.trim()}
      style={{
        width: toCssLength(width),
        height: autoHeight ? undefined : toCssLength(height),
        aspectRatio: autoHeight ? String(aspect) : undefined,
        '--orbit-radius':
          typeof itemRadius === 'number' ? `${(itemRadius / Math.max(1, itemSize)) * 100}%` : itemRadius,
        '--orbit-shadow': String(clamp(shadow, 0, 1)),
        '--orbit-hover-scale': String(hoverScale)
      }}
      aria-hidden={interactive ? undefined : true}
      data-intro={introPending ? '' : undefined}
      data-draggable={draggable ? '' : undefined}
    >
      <svg
        className="orbit-path-svg"
        data-orbit-svg=""
        preserveAspectRatio="none"
        style={{ zIndex: 0, visibility: showPath ? undefined : 'hidden' }}
        aria-hidden="true"
      >
        <path
          data-orbit-path=""
          data-orbit-stroke=""
          d={path}
          fill="none"
          stroke={pathColor}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${center} ${center})`}
        />
      </svg>
      {showPath && layered && (
        <svg
          className="orbit-path-svg"
          data-orbit-svg=""
          preserveAspectRatio="none"
          style={{ zIndex: 105 }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect data-orbit-clip="" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <path
              data-orbit-stroke=""
              d={path}
              fill="none"
              stroke={pathColor}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${center} ${center})`}
            />
          </g>
        </svg>
      )}
      {items.map((item, index) => (
        <div
          key={index}
          className="orbit-item"
          data-orbit-item={index}
          data-clickable={clickToFront || interactive ? '' : undefined}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? item.alt : undefined}
        >
          <div className="orbit-item-inner">
            <img src={item.src} alt={item.alt} draggable={false} decoding="async" className="orbit-image" />
          </div>
        </div>
      ))}
      {centerContent && (
        <div className="orbit-center-content" data-orbit-center="">
          {centerContent}
        </div>
      )}
    </div>
  );
}

```

### Component CSS
```css
.orbit-container {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  isolation: isolate;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.orbit-container[data-draggable] {
  cursor: grab;
  touch-action: pan-y pinch-zoom;
}

.orbit-container[data-dragging],
.orbit-container[data-dragging] * {
  cursor: grabbing;
}

.orbit-path-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.orbit-item {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform, opacity;
}

.orbit-container[data-intro] .orbit-item {
  opacity: 0;
}

.orbit-item[data-clickable] {
  cursor: pointer;
}

.orbit-item-inner {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--orbit-radius, 0px);
  box-shadow: 0 calc(var(--orbit-shadow, 0) * 16px) calc(var(--orbit-shadow, 0) * 36px)
    rgba(0, 0, 0, calc(var(--orbit-shadow, 0) * 0.45));
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.orbit-item:hover .orbit-item-inner,
.orbit-item:focus-visible .orbit-item-inner {
  transform: scale(var(--orbit-hover-scale, 1));
}

.orbit-item:focus-visible {
  outline: none;
}

.orbit-item:focus-visible .orbit-item-inner {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.orbit-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.orbit-center-content {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.orbit-center-content > * {
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .orbit-item-inner {
    transition: none;
  }
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
## Integrate the <TargetCursor /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: TargetCursor
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import TargetCursor from './TargetCursor';

export default function App() {
  return (
    <div>
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn />

      <h1>Hover over the elements below</h1>
      <button className="cursor-target" data-cursor-label="Open">Click me!</button>
      <div className="cursor-target">Hover target</div>
    </div>
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| targetSelector | string | '.cursor-target' | CSS selector for the elements the brackets lock onto. |
| cursorColor | string | '#ffffff' | Color of the brackets and dot. |
| cursorColorOnTarget | string | - | Color the cursor blends to while locked onto a target. |
| spinDuration | number | 2 | Seconds per turn while the cursor roams. 0 stops the spin. |
| hoverDuration | number | 0.2 | How long the brackets take to snap onto a target, in seconds. |
| parallaxOn | boolean | true | Lets the locked brackets lean slightly toward the cursor. |
| hideDefaultCursor | boolean | true | Hides the system cursor while this cursor is shown. |
| size | number | 36 | Size of the reticle while roaming, in px. |
| cornerSize | number | 12 | Length of each bracket arm, in px. |
| thickness | number | 3 | Stroke width of the brackets, in px. |
| padding | number | 6 | Gap between a locked target and the brackets, in px. |
| matchRadius | boolean | true | Rounds the brackets to follow the target's corner radius. |
| dotSize | number | 4 | Size of the center dot, in px. 0 hides it. |
| blendMode | string | 'difference' | CSS blend mode of the cursor. Difference keeps it visible on any background. |
| showLabel | boolean | true | Shows the data-cursor-label text of a locked target above the brackets. |
| clickEffect | boolean | true | Squeezes the brackets and dot while the mouse button is held. |
| container | RefObject | HTMLElement | - | Limits the cursor to one element. By default it works across the whole page. |

### Full Component Source
```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TargetCursor.css';

const CORNER_ANGLES = [0, 90, 180, 270];
const QUARTER = Math.PI / 2;

const spring = (state, goal, stiffness, damping, dt) => {
  const steps = 2;
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;
    state.x += state.v * h;
  }
};

const resolveElement = value => (value && 'current' in value ? value.current : value) || null;

const TargetCursor = ({
  targetSelector = '.cursor-target',
  cursorColor = '#ffffff',
  cursorColorOnTarget,
  spinDuration = 2,
  hoverDuration = 0.2,
  parallaxOn = true,
  hideDefaultCursor = true,
  size = 36,
  cornerSize = 12,
  thickness = 3,
  padding = 6,
  matchRadius = true,
  dotSize = 4,
  blendMode = 'difference',
  showLabel = true,
  clickEffect = true,
  container
}) => {
  const [host, setHost] = useState(null);
  const rootRef = useRef(null);
  const cornerRefs = useRef([]);
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const wakeRef = useRef(null);
  const settings = {
    targetSelector,
    cursorColor,
    cursorColorOnTarget,
    spinDuration,
    hoverDuration: Math.max(0.05, hoverDuration),
    parallaxOn,
    hideDefaultCursor,
    size: Math.max(4, size),
    cornerSize: Math.max(2, cornerSize),
    thickness: Math.max(0.5, thickness),
    padding,
    matchRadius,
    dotSize: Math.max(0, dotSize),
    showLabel,
    clickEffect,
    container
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHost(finePointer.matches ? document.body : null);
    update();
    finePointer.addEventListener('change', update);
    return () => finePointer.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!host || !root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const style = document.createElement('style');
    document.head.appendChild(style);

    const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };
    const centerX = { x: 0, v: 0 };
    const centerY = { x: 0, v: 0 };
    const halfW = { x: 0, v: 0 };
    const halfH = { x: 0, v: 0 };
    const radius = { x: 0, v: 0 };
    const turn = { x: 0, v: 0 };
    const lock = { x: 0, v: 0 };
    const press = { x: 0, v: 0 };
    const presence = { x: 0, v: 0 };
    let target = null;
    let targetRadius = 0;
    let quarter = 0;
    let spinSpeed = 0;
    let raf = 0;
    let last = 0;
    let lastLabel = '';
    let lastColor = '';
    let lastScope = null;

    const scopeOf = () => resolveElement(settingsRef.current.container);

    const hideCursor = () => {
      const s = settingsRef.current;
      const scope = scopeOf();
      if (scope !== lastScope) {
        lastScope?.removeAttribute('data-target-cursor-scope');
        scope?.setAttribute('data-target-cursor-scope', '');
        lastScope = scope;
      }
      const selector = scope ? '[data-target-cursor-scope]' : 'html';
      const rule =
        s.hideDefaultCursor && pointer.inside ? `${selector}, ${selector} * { cursor: none !important; }` : '';
      if (style.textContent !== rule) style.textContent = rule;
    };

    const findTarget = (x, y, element) => {
      const s = settingsRef.current;
      const node = element || document.elementFromPoint(x, y);
      const found = node?.closest?.(s.targetSelector) || null;
      const scope = scopeOf();
      if (found && scope && !scope.contains(found)) return null;
      return found;
    };

    const lockOn = next => {
      if (next === target) return;
      target = next;
      if (target) {
        const angle = turn.x;
        quarter = Math.round(angle / QUARTER);
        const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
        targetRadius = corner;
        spinSpeed = 0;
      }
    };

    const frame = now => {
      raf = 0;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      if (target && !target.isConnected) lockOn(null);
      const rect = target ? target.getBoundingClientRect() : null;
      const locked = !!rect && pointer.inside;
      const snapW = 4.6 / s.hoverDuration;
      const snapK = snapW * snapW;
      const snapC = 2 * 0.62 * snapW;

      spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);
      spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);
      spring(press, pointer.pressed && s.clickEffect ? 1 : 0, 900, 40, dt);

      let goalX = pointer.x;
      let goalY = pointer.y;
      let goalW = s.size / 2;
      let goalH = s.size / 2;
      let goalR = Math.min(2, s.cornerSize / 4);
      if (locked) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const lean = s.parallaxOn ? 0.08 : 0;
        goalX = cx + (pointer.x - cx) * lean;
        goalY = cy + (pointer.y - cy) * lean;
        const odd = Math.abs(quarter) % 2 === 1;
        const w = rect.width / 2 + s.padding;
        const h = rect.height / 2 + s.padding;
        goalW = odd ? h : w;
        goalH = odd ? w : h;
        goalR = s.matchRadius ? Math.min(targetRadius + Math.max(0, s.padding), s.cornerSize) : 0;
      }

      if (!pointer.inside && presence.x < 0.01) pointer.seen = false;
      if (!pointer.seen) {
        centerX.x = goalX;
        centerY.x = goalY;
        halfW.x = goalW;
        halfH.x = goalH;
        pointer.seen = pointer.inside;
      }

      const follow = locked ? snapK : 2200;
      const followC = locked ? snapC : 2 * Math.sqrt(2200);
      spring(centerX, goalX, follow, followC, dt);
      spring(centerY, goalY, follow, followC, dt);
      spring(halfW, goalW, snapK, snapC, dt);
      spring(halfH, goalH, snapK, snapC, dt);
      spring(radius, goalR, snapK, 2 * snapW, dt);

      if (locked) {
        spring(turn, quarter * QUARTER, snapK, snapC, dt);
      } else {
        const speed = s.spinDuration > 0 && !reduce ? (Math.PI * 2) / s.spinDuration : 0;
        spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));
        turn.v = spinSpeed;
        turn.x += spinSpeed * dt;
      }

      const squeeze = 1 - press.x * 0.14;
      const cos = Math.cos(turn.x);
      const sin = Math.sin(turn.x);
      const w = Math.max(0, halfW.x) * squeeze;
      const h = Math.max(0, halfH.x) * squeeze;
      const local = [
        [-w, -h],
        [w, -h],
        [w, h],
        [-w, h]
      ];
      const r = Math.max(0, Math.min(radius.x, s.cornerSize));
      const degrees = (turn.x * 180) / Math.PI;
      let left = Infinity;
      let top = Infinity;
      cornerRefs.current.forEach((corner, i) => {
        if (!corner) return;
        const [lx, ly] = local[i];
        const x = centerX.x + lx * cos - ly * sin;
        const y = centerY.x + lx * sin + ly * cos;
        left = Math.min(left, x);
        top = Math.min(top, y);
        corner.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)`;
        corner.style.width = `${s.cornerSize}px`;
        corner.style.height = `${s.cornerSize}px`;
        corner.style.borderWidth = `${s.thickness}px 0 0 ${s.thickness}px`;
        corner.style.borderTopLeftRadius = `${r.toFixed(2)}px`;
      });

      const dot = dotRef.current;
      if (dot) {
        const dotScale = 1 - press.x * 0.35;
        dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) scale(${dotScale.toFixed(3)})`;
        dot.style.width = `${s.dotSize}px`;
        dot.style.height = `${s.dotSize}px`;
      }

      const label = labelRef.current;
      if (label) {
        const text = s.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';
        if (text && text !== lastLabel) label.textContent = text;
        if (text) lastLabel = text;
        const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;
        label.style.transform = `translate3d(${left.toFixed(2)}px, ${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(${((1 - shown) * 4).toFixed(2)}px)`;
        label.style.opacity = shown.toFixed(3);
      }

      const mix = s.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;
      const color = mix ? `color-mix(in oklab, ${s.cursorColorOnTarget} ${mix}%, ${s.cursorColor})` : s.cursorColor;
      if (color !== lastColor) {
        root.style.setProperty('--target-cursor-color', color);
        lastColor = color;
      }
      root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);

      const resting =
        !pointer.inside &&
        presence.x < 0.002 &&
        Math.abs(presence.v) < 0.002 &&
        Math.abs(lock.x) < 0.002 &&
        Math.abs(press.x) < 0.002;
      const spinning = pointer.inside && !locked && spinSpeed > 0.0001;
      const moving =
        Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||
        Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||
        Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;
      if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    wakeRef.current = () => {
      hideCursor();
      wake();
    };

    const insideScope = (x, y, element) => {
      const scope = scopeOf();
      if (!scope) return true;
      if (element && scope.contains(element)) return true;
      const box = scope.getBoundingClientRect();
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
    };

    const onPointerMove = event => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const inside = insideScope(pointer.x, pointer.y, event.target);
      if (inside !== pointer.inside) {
        pointer.inside = inside;
        hideCursor();
      }
      lockOn(inside ? findTarget(pointer.x, pointer.y, event.target) : null);
      wake();
    };

    const onPointerDown = event => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      pointer.pressed = true;
      wake();
    };

    const onPointerUp = () => {
      pointer.pressed = false;
      wake();
    };

    const onLeave = () => {
      pointer.inside = false;
      pointer.pressed = false;
      lockOn(null);
      hideCursor();
      wake();
    };

    const onScroll = () => {
      if (!pointer.inside) return;
      lockOn(findTarget(pointer.x, pointer.y));
      wake();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll, { capture: true });
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      lastScope?.removeAttribute('data-target-cursor-scope');
      style.remove();
    };
  }, [host]);

  useEffect(() => {
    wakeRef.current?.();
  });

  if (!host) return null;

  return createPortal(
    <div ref={rootRef} className="target-cursor" style={{ mixBlendMode: blendMode, opacity: 0 }} aria-hidden="true">
      {CORNER_ANGLES.map((angle, i) => (
        <span
          key={angle}
          ref={element => {
            cornerRefs.current[i] = element;
          }}
          className="target-cursor__corner"
        />
      ))}
      <span ref={dotRef} className="target-cursor__dot" />
      <span ref={labelRef} className="target-cursor__label" />
    </div>,
    host
  );
};

export default TargetCursor;

```

### Component CSS
```css
.target-cursor {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
}

.target-cursor__corner {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  border-style: solid;
  border-color: var(--target-cursor-color, #ffffff);
  transform-origin: 0 0;
  will-change: transform;
}

.target-cursor__dot {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: var(--target-cursor-color, #ffffff);
  will-change: transform;
}

.target-cursor__label {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--target-cursor-color, #ffffff);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  will-change: transform, opacity;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.


## Integrate the <ImageTrail /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: ImageTrail
### Variant: JavaScript + CSS
### Dependencies: gsap

---

### Usage Example
```jsx
import ImageTrail from './ImageTrail';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <ImageTrail
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300'
    ]}
    size={190}
    threshold={80}
    appearScale={0}
    zoom={2.4}
    flash={0.6}
  />
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | string[] | [] | Image URLs shown in the trail, in order. |
| size | number | string | 190 | Width of each image in pixels, or any CSS length. |
| aspectRatio | number | 1.1 | Width divided by height for each image. |
| radius | number | string | 15 | Corner radius of the images. |
| threshold | number | 80 | How far the cursor travels, in pixels, before the next image appears. |
| lifetime | number | 0.4 | Seconds an image stays before it fades out. |
| appearScale | number | 1 | Size an image starts at as it appears. 0 grows it from nothing and 1 shows it at full size right away. |
| zoom | number | 1 | How far each photo starts zoomed in before settling inside its frame. 1 turns it off. |
| flash | number | 0 | Brightness flash as an image appears, from 0 to 1. |
| exitScale | number | 0.2 | Size an image shrinks or grows to while it fades out. 1 keeps its size. |
| drift | number | 0 | How far images keep flying in the direction of the cursor as they fade, from 0 to 1. |
| rotation | number | 0 | Random tilt of each image, in degrees. |
| sizeVariance | number | 0 | Random size variation between images, from 0 to 1. |
| alignToMotion | boolean | false | Turns each image to face the direction the cursor is moving. |
| stack | number | 0 | Keeps this many of the newest images on screen in a pile, instead of fading each one on its own. 0 turns it off. |
| tilt | number | 0 | Tilts images in 3D toward the edge where they appear, in degrees. |
| className | string | '' | Extra class names for the container. |

### Full Component Source
```jsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import './ImageTrail.css';

const lerp = (a, b, n) => (1 - n) * a + n * b;

const toCssLength = value => (typeof value === 'number' ? `${value}px` : value);

const createTrail = (container, config) => {
  const images = Array.from(container.querySelectorAll('[data-trail-image]')).map(el => ({
    el,
    inner: el.firstElementChild
  }));
  const total = images.length;
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const mouse = { x: 0, y: 0 };
  const last = { x: 0, y: 0 };
  const cache = { x: 0, y: 0 };
  const visible = [];
  let started = false;
  let raf = 0;
  let index = -1;
  let zIndex = 1;
  let active = 0;
  let lastAngle = 0;
  let destroyed = false;

  const settle = () => {
    active = Math.max(0, active - 1);
    if (!active && !visible.length) zIndex = 1;
  };

  const retire = img => {
    const cfg = config.current;
    gsap.to(img.el, {
      duration: 0.4,
      ease: 'power4',
      opacity: 0,
      scale: cfg.exitScale,
      onComplete: () => {
        if (!active && !visible.length) zIndex = 1;
      }
    });
  };

  const spawn = () => {
    const cfg = config.current;
    if (!total) return;
    index = (index + 1) % total;
    const img = images[index];
    const width = img.el.offsetWidth;
    const height = img.el.offsetHeight;
    const dx = mouse.x - last.x;
    const dy = mouse.y - last.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    let fromAngle = gsap.utils.random(-cfg.rotation, cfg.rotation);
    let toAngle = fromAngle * 0.4;
    if (cfg.alignToMotion) {
      fromAngle = lastAngle;
      toAngle = angle;
      while (toAngle - fromAngle > 180) toAngle -= 360;
      while (toAngle - fromAngle < -180) toAngle += 360;
      lastAngle = toAngle;
    }
    const scale = 1 + gsap.utils.random(-0.5, 0.6) * cfg.sizeVariance;
    const box = container.getBoundingClientRect();
    const tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * cfg.tilt : 0;
    const tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * cfg.tilt : 0;
    const drift = cfg.drift > 0;
    const slide = drift ? 0.6 * cfg.drift : 0;

    ++zIndex;
    ++active;
    gsap.killTweensOf(img.el);
    gsap.killTweensOf(img.inner);
    const visibleIndex = visible.indexOf(img);
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);

    const timeline = gsap.timeline({ onComplete: settle });
    timeline.fromTo(
      img.el,
      {
        opacity: 1,
        scale: cfg.appearScale * scale,
        zIndex,
        x: cache.x - width / 2,
        y: cache.y - height / 2,
        rotation: fromAngle,
        rotationX: tiltX * 0.5,
        rotationY: tiltY * 0.5
      },
      {
        duration: drift ? 0.9 : 0.4,
        ease: drift ? 'power2' : 'power1',
        scale,
        x: mouse.x - width / 2 + dx * slide,
        y: mouse.y - height / 2 + dy * slide,
        rotation: toAngle,
        rotationX: tiltX,
        rotationY: tiltY
      },
      0
    );
    if (cfg.zoom !== 1 || cfg.flash > 0) {
      timeline.fromTo(
        img.inner,
        { scale: cfg.zoom, filter: `brightness(${1 + cfg.flash * 1.5})` },
        { duration: 0.5, ease: 'power1', scale: 1, filter: 'brightness(1)' },
        0
      );
    }

    if (cfg.stack > 0) {
      visible.push(img);
      const keep = Math.max(1, Math.min(Math.round(cfg.stack), total - 1));
      while (visible.length > keep) {
        const old = visible.shift();
        if (old) retire(old);
      }
      return;
    }

    timeline.to(
      img.el,
      {
        duration: 0.4,
        ease: drift ? 'expo' : 'power3',
        opacity: 0,
        scale: cfg.exitScale * scale
      },
      cfg.lifetime
    );
    if (drift) {
      timeline.to(
        img.el,
        {
          duration: 1.5,
          ease: 'power4',
          x: `+=${dx * cfg.drift * 1.2}`,
          y: `+=${dy * cfg.drift * 1.2}`
        },
        cfg.lifetime
      );
    }
  };

  const loop = () => {
    raf = 0;
    if (destroyed) return;
    const cfg = config.current;
    cache.x = lerp(cache.x, mouse.x, 0.1);
    cache.y = lerp(cache.y, mouse.y, 0.1);
    if (!query?.matches && Math.hypot(mouse.x - last.x, mouse.y - last.y) > cfg.threshold) {
      spawn();
      last.x = mouse.x;
      last.y = mouse.y;
    }
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) {
      raf = requestAnimationFrame(loop);
    }
  };

  const onMove = e => {
    const rect = container.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    if (!point) return;
    mouse.x = point.clientX - rect.left;
    mouse.y = point.clientY - rect.top;
    if (!started) {
      started = true;
      cache.x = last.x = mouse.x;
      cache.y = last.y = mouse.y;
    }
    if (!raf) raf = requestAnimationFrame(loop);
  };

  container.addEventListener('mousemove', onMove);
  container.addEventListener('touchmove', onMove, { passive: true });

  return () => {
    destroyed = true;
    if (raf) cancelAnimationFrame(raf);
    container.removeEventListener('mousemove', onMove);
    container.removeEventListener('touchmove', onMove);
    images.forEach(img => {
      gsap.killTweensOf(img.el);
      gsap.killTweensOf(img.inner);
    });
  };
};

export default function ImageTrail({
  items = [],
  size = 190,
  aspectRatio = 1.1,
  radius = 15,
  threshold = 80,
  lifetime = 0.4,
  appearScale = 1,
  zoom = 1,
  flash = 0,
  exitScale = 0.2,
  drift = 0,
  rotation = 0,
  sizeVariance = 0,
  alignToMotion = false,
  stack = 0,
  tilt = 0,
  className = ''
}) {
  const containerRef = useRef(null);
  const config = useRef(null);
  config.current = {
    threshold,
    lifetime,
    appearScale,
    zoom,
    flash,
    exitScale,
    drift,
    rotation,
    sizeVariance,
    alignToMotion,
    stack,
    tilt
  };

  useEffect(() => {
    if (!containerRef.current) return;
    return createTrail(containerRef.current, config);
  }, [items]);

  return (
    <div
      className={`content ${className}`.trim()}
      ref={containerRef}
      style={{
        '--trail-size': toCssLength(size),
        '--trail-aspect': String(aspectRatio),
        '--trail-radius': toCssLength(radius),
        perspective: tilt ? '1000px' : undefined
      }}
    >
      {items.map((url, i) => (
        <div className="content__img" data-trail-image="" key={i}>
          <div className="content__img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}

```

### Component CSS
```css
.content {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 100;
  border-radius: 8px;
  background: transparent;
  overflow: visible;
}

.content__img {
  width: var(--trail-size, 190px);
  aspect-ratio: var(--trail-aspect, 1.1);
  border-radius: var(--trail-radius, 15px);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  will-change: transform, filter;
}

.content__img-inner {
  background-position: 50% 50%;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  background-size: cover;
  position: absolute;
  top: calc(-1 * 20px / 2);
  left: calc(-1 * 20px / 2);
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
## Integrate the <InfiniteSpiral /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: InfiniteSpiral
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import InfiniteSpiral from './InfiniteSpiral';

const images = [
  { src: '/images/landscape-1.jpg', alt: 'Mountain lake' },
  { src: '/images/landscape-2.jpg', alt: 'Forest path' },
  { src: '/images/landscape-3.jpg', alt: 'Rocky summit' },
  { src: '/images/landscape-4.jpg', alt: 'Ocean shore' },
  { src: '/images/landscape-5.jpg', alt: 'Green meadow' },
  { src: '/images/landscape-6.jpg', alt: 'Desert light' }
];

<div style={{ height: '600px', position: 'relative', overflow: 'hidden' }}>
  <InfiniteSpiral
    items={images}
    animationMode="all"
    speed={0.55}
    radius={170}
    cardWidth={100}
    cardHeight={100}
    verticalSpacing={60}
    perspective={1000}
    cardRadius={10}
    centerScale={1.2}
    edgeBlur={6}
    cardsPerTurn={7}
    pauseOnHover
  />
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | (string | SpiralItem)[] | [] | Images shown in the spiral. Objects may also include alt, href, target, label and id. |
| speed | number | 0.55 | Automatic travel speed in cards per second and the sensitivity of scroll-controlled motion. |
| direction | "up" | "down" | "up" | Vertical travel direction. |
| animationMode | "auto" | "drag" | "scroll" | "all" | "auto" | Selects automatic motion, pointer dragging, page-scroll control or all interactions. |
| radius | number | 170 | Depth radius of the helix in pixels. |
| cardWidth | number | 100 | Card width in pixels. |
| cardHeight | number | 100 | Card height in pixels. |
| verticalSpacing | number | 60 | Vertical distance between neighboring cards. |
| perspective | number | 1000 | CSS perspective applied to the 3D stage. |
| cardsPerTurn | number | 7 | Number of cards used for one complete revolution. |
| rotation | number | 0 | Global angular offset in degrees. |
| cardTilt | number | 0 | Additional clockwise card tilt in degrees. |
| cardRadius | number | 10 | Card corner radius in pixels. |
| centerScale | number | 1.2 | Scale multiplier for cards nearest the center. |
| edgeFade | number | 0.3 | Fraction of the outer travel range used for fading. |
| edgeBlur | number | 6 | Maximum blur applied near the edges. |
| pauseOnHover | boolean | true | Smoothly eases automatic motion to a stop while the gallery is hovered. |
| imageFit | "cover" | "contain" | "cover" | Object fit used by every image. |
| grayscale | number | 0 | Grayscale amount applied to every image, from 0 to 1. |
| className | string | "" | Additional class names for the root element. |

### Full Component Source
```jsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import './InfiniteSpiral.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min, max, value) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

const InfiniteSpiral = ({
  items = [],
  speed = 0.55,
  direction = 'up',
  animationMode = 'auto',
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  imageFit = 'cover',
  grayscale = 0,
  className = ''
}) => {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const dragMovedRef = useRef(false);

  const normalizedItems = useMemo(
    () =>
      items.map((item, index) =>
        typeof item === 'string'
          ? { src: item, alt: `Spiral image ${index + 1}` }
          : { alt: `Spiral image ${index + 1}`, ...item }
      ),
    [items]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || normalizedItems.length === 0) return;

    let frameId;
    let previousTime = performance.now();
    let bounds = root.getBoundingClientRect();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrollEnabled = animationMode === 'scroll' || animationMode === 'all';
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    let lastScrollY = window.scrollY;

    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect();
    });
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(root);

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visibleRef.current || scrollDelta === 0) return;
      targetProgressRef.current += clamp(
        (scrollDelta * scrollSpeedMultiplier) / Math.max(verticalSpacing * 2, 1),
        -1.5,
        1.5
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = time => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const autoEnabled = animationMode === 'auto' || animationMode === 'all';
      const motionPaused = draggingRef.current || (pauseOnHover && hoveredRef.current);
      const directionMultiplier = direction === 'down' ? -1 : 1;
      const desiredAutoSpeed =
        autoEnabled && visibleRef.current && !reducedMotion.matches && !motionPaused
          ? speed * directionMultiplier
          : 0;
      const speedBlend = 1 - Math.exp(-delta * 7);
      autoSpeedRef.current += (desiredAutoSpeed - autoSpeedRef.current) * speedBlend;
      targetProgressRef.current += autoSpeedRef.current * delta;

      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 22 : 11));
      progressRef.current += (targetProgressRef.current - progressRef.current) * followBlend;

      const count = normalizedItems.length;
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / (cardWidth * 2.8), height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        let offset = index - progressRef.current;
        offset = modulo(offset + half, count) - half;

        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + rotation;
        const angleRadians = (angle * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const visualScale = scale * depthScale;
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(0.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${visualScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    normalizedItems,
    speed,
    direction,
    animationMode,
    radius,
    perspective,
    cardWidth,
    cardHeight,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    cardTilt,
    centerScale,
    edgeFade,
    edgeBlur,
    pauseOnHover
  ]);

  const rootStyle = {
    perspective: `${perspective}px`,
    '--infinite-spiral-card-width': `${cardWidth}px`,
    '--infinite-spiral-card-height': `${cardHeight}px`,
    '--infinite-spiral-card-radius': `${cardRadius}px`,
    cursor: animationMode === 'drag' || animationMode === 'all' ? 'grab' : 'default',
    touchAction: animationMode === 'drag' || animationMode === 'all' ? 'pan-x' : 'auto',
    userSelect: animationMode === 'drag' || animationMode === 'all' ? 'none' : 'auto'
  };

  const dragEnabled = animationMode === 'drag' || animationMode === 'all';

  const stopDragging = event => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default';
  };

  return (
    <div
      ref={rootRef}
      className={`infinite-spiral ${className}`.trim()}
      style={rootStyle}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={event => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerYRef.current = event.clientY;
        targetProgressRef.current = progressRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.cursor = 'grabbing';
      }}
      onPointerMove={event => {
        if (!draggingRef.current) return;
        const pointerDelta = event.clientY - lastPointerYRef.current;
        lastPointerYRef.current = event.clientY;
        if (Math.abs(pointerDelta) > 0.5) dragMovedRef.current = true;
        targetProgressRef.current -= pointerDelta / Math.max(verticalSpacing, 1);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={event => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <div className="infinite-spiral__stage" role="list" aria-label="Infinite spiral gallery">
        {normalizedItems.map((item, index) => {
          const Card = item.href ? 'a' : 'div';
          return (
            <Card
              key={item.id ?? `${item.src}-${index}`}
              ref={node => {
                cardRefs.current[index] = node;
              }}
              className="infinite-spiral__item"
              style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }}
              href={item.href}
              target={item.target}
              rel={item.target === '_blank' ? 'noreferrer' : undefined}
              role="listitem"
              aria-label={item.label ?? item.alt}
            >
              <img
                className="infinite-spiral__image"
                src={item.src}
                alt={item.alt}
                loading={index < 6 ? 'eager' : 'lazy'}
                draggable={false}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: imageFit,
                  filter: `grayscale(${Math.min(1, Math.max(0, grayscale))})`
                }}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSpiral;

```

### Component CSS
```css
.infinite-spiral {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  overflow: hidden;
  isolation: isolate;
}

.infinite-spiral__stage {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.infinite-spiral__item {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: var(--infinite-spiral-card-width);
  height: var(--infinite-spiral-card-height);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.24);
  border-radius: var(--infinite-spiral-card-radius);
  background: rgb(255 255 255 / 0.08);
  box-shadow: 0 14px 38px rgb(8 6 18 / 0.2);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
  text-decoration: none;
}

.infinite-spiral__image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-position: center;
  user-select: none;
}

@media (prefers-reduced-motion: reduce) {
  .infinite-spiral__item {
    transition: none;
  }
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
  ## Integrate the <FlexCarousel /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: FlexCarousel
### Variant: JavaScript + CSS
### Dependencies: ogl

---

### Usage Example
```jsx
import FlexCarousel from './FlexCarousel';

const items = [
  { src: '/images/one.jpg', alt: 'A chrome sculpture', title: 'Iridescence' },
  { src: '/images/two.jpg', alt: 'A figure on a white set', title: 'White Room' },
  { src: '/images/three.jpg', alt: 'A clay bust in profile', title: 'Clay Study', subtitle: 'Studio 04' }
];

<div style={{ width: '100%', height: '560px', position: 'relative' }}>
  <FlexCarousel
    items={items}
    preset="liquid"
    intro="rise"
    cardHeight={0.5}
    gap={12}
    squeeze={0.2}
    focusOnClick
    captions
  />
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | Array<{ src: string; alt?: string; title?: string; subtitle?: string }> | 12 sample photos | Images shown in the row. Each keeps its natural aspect ratio unless fit is set. The alt text is announced to screen readers, the title and optional subtitle are shown above the row. |
| preset | 'liquid' | 'ribbon' | 'vortex' | 'arch' | 'liquid' | A starting shape for the invisible glass. Every lens prop below overrides the preset value when you pass it. |
| intro | 'rise' | 'bloom' | 'spin' | 'deal' | 'none' | 'rise' | Entrance once the images load. Rise lifts the cards in from below, bloom fades them in while the bend forms, spin lands a fast flick, deal spreads the cards from the middle. Any input skips it. |
| fit | 'natural' | 'portrait' | 'square' | 'landscape' | 'natural' | Card shape. Natural keeps each image uncropped, the others crop every card to the same shape. |
| cardHeight | number | 0.5 | Card height as a fraction of the container height. |
| gap | number | 12 | Space between cards, in px. |
| radius | number | 0 | Corner radius of the cards, in px. |
| lensWidth | number | from preset | Width of the invisible glass as a fraction of the container width. |
| lensHeight | number | from preset | Height of the invisible glass as a fraction of the container width, so the bend keeps its shape at any size. |
| tilt | number | from preset | Rotation of the glass in degrees. It decides where its edge crosses the row. |
| roundness | number | from preset | Shape of the glass, from a rounded rectangle at 0 to a perfect ellipse at 1. |
| bend | number | from preset | How far the row flexes where it passes the edge of the glass. The glass itself is never drawn and the images always stay connected. |
| reach | number | from preset | Width of the curved edge of the glass. Small values give a tight kink, large values a long smooth bend. |
| curl | 'twist' | 'rise' | 'fall' | from preset | Which way the ends of the row flex. Twist sends the left end down and the right end up, rise lifts both, fall drops both. |
| dispersion | number | from preset | Rainbow splitting of light, only where the edge of the glass bends the images. |
| liquid | number | from preset | How much the glass stretches and wobbles like a liquid when the row moves. Off in every preset. |
| followCursor | boolean | from preset | Let the lens drift after the cursor like a loupe, and return to the center when it leaves. |
| squeeze | number | 0.2 | How much the cards shrink while the row moves fast. 0 keeps them at full size. |
| focusOnClick | boolean | true | Clicking a card centers it and opens it: the others part, the bend melts away and the card grows. Click, drag, scroll or Escape closes it. |
| autoplay | boolean | false | Advance one card at a time. Pauses on hover, focus and interaction, and when reduced motion is on. |
| interval | number | 4 | Seconds between autoplay steps. |
| captions | boolean | true | Show the title of the centered card above the row and a counter below it. |
| captureWheel | boolean | true | Let a vertical mouse wheel scroll the carousel while hovering. Horizontal wheels and trackpads always scroll it. |
| onChange | (index: number, item) => void | - | Called whenever a different card reaches the center. |
| onSelect | (index: number, item) => void | - | Called when the centered card is clicked or Enter is pressed. Clicking a side card centers it first. |
| className | string | '' | Extra classes on the container. |
| style | CSSProperties | - | Inline styles on the container. |

### Full Component Source
```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from 'ogl';

import './FlexCarousel.css';

const photo = id => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=max`;

const DEFAULT_ITEMS = [
  {
    src: photo('photo-1737071371043-761e02b1ef95'),
    alt: 'An iridescent chrome sculpture of a head',
    title: 'Iridescence'
  },
  {
    src: photo('photo-1693645325828-62cd35c8da8f'),
    alt: 'A person in dark clothes standing in front of a white backdrop',
    title: 'White Room'
  },
  { src: photo('photo-1739056238917-d89cd05c48d5'), alt: 'A twisted chrome form on black', title: 'Liquid Metal' },
  { src: photo('photo-1747191092806-c7da11881986'), alt: 'A clay bust shown in profile', title: 'Clay Study' },
  { src: photo('photo-1605034313761-73ea4a0cfbf3'), alt: 'Black and white low top sneakers', title: 'Low Tops' },
  { src: photo('photo-1495462911434-be47104d70fa'), alt: 'A woman in a wide black hat', title: 'Brim' },
  {
    src: photo('photo-1786835568925-20cd20007ed0'),
    alt: 'Three swirling shapes in white, gold and silver on grey',
    title: 'Three Forms'
  },
  { src: photo('photo-1770249196550-ff6c641165cb'), alt: 'A chrome humanoid sculpture', title: 'Automaton' },
  {
    src: photo('photo-1787181875088-087d612262a7'),
    alt: 'A black textured sculpture with an opening at its center',
    title: 'Obsidian'
  },
  {
    src: photo('photo-1770062422885-2dfcbe8fb65b'),
    alt: 'A woman in a white shirt crouching on a dark set',
    title: 'Poise'
  },
  { src: photo('photo-1726910133626-9b573eca70ff'), alt: 'Black curved shapes stacked like a fan', title: 'Fins' },
  { src: photo('photo-1604854574958-59047362c165'), alt: 'A white plaster bust on a black table', title: 'Plaster' }
];

const BEND_PRESETS = {
  liquid: {
    lensWidth: 0.74,
    lensHeight: 1.18,
    tilt: 62,
    roundness: 1,
    bend: 0.34,
    reach: 0.38,
    curl: 'twist',
    dispersion: 0.45,
    liquid: 0,
    followCursor: false
  },
  ribbon: {
    lensWidth: 0.8,
    lensHeight: 0.8,
    tilt: 0,
    roundness: 1,
    bend: 0.34,
    reach: 0.34,
    curl: 'twist',
    dispersion: 0.4,
    liquid: 0,
    followCursor: false
  },
  vortex: {
    lensWidth: 0.7,
    lensHeight: 0.95,
    tilt: 30,
    roundness: 1,
    bend: 0.46,
    reach: 0.3,
    curl: 'twist',
    dispersion: 0.5,
    liquid: 0,
    followCursor: false
  },
  arch: {
    lensWidth: 0.8,
    lensHeight: 0.8,
    tilt: 0,
    roundness: 1,
    bend: 0.3,
    reach: 0.36,
    curl: 'rise',
    dispersion: 0.4,
    liquid: 0,
    followCursor: false
  }
};

const FIT_ASPECT = { portrait: 0.75, square: 1, landscape: 4 / 3 };
const TAPS = 12;
const PIXEL_BUDGET = 4.5e6;
const INTRO_DURATION = { rise: 2.1, bloom: 1.6, spin: 2.2, deal: 1.5, fade: 0.35 };

const wrap = (value, size) => ((((value + size / 2) % size) + size) % size) - size / 2;
const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
const easeOutQuint = value => 1 - Math.pow(1 - clamp01(value), 5);
const easeInOut = value => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const cardVertex = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

const cardFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += uShift * (1.0 - scale.x) * 0.5;
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}
`;

const lensVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const lensFragment = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);

  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;

  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));

  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < ${TAPS}; i++) {
      float s = (float(i) + 0.5) / float(${TAPS});
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }

  fragColor = color * uSceneAlpha;
}
`;

const Digits = ({ value }) => (
  <span className="flex-carousel__digits">
    {String(value)
      .padStart(2, '0')
      .split('')
      .map((digit, index) => (
        <span key={index} className="flex-carousel__digit">
          <span className="flex-carousel__reel" style={{ transform: `translateY(${-Number(digit) * 10}%)` }}>
            {'0123456789'.split('').map(n => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
  </span>
);

const FlexCarousel = ({
  items = DEFAULT_ITEMS,
  preset = 'liquid',
  intro = 'rise',
  cardHeight = 0.5,
  gap = 12,
  radius = 0,
  fit = 'natural',
  lensWidth,
  lensHeight,
  tilt,
  roundness,
  bend,
  reach,
  curl,
  dispersion,
  liquid,
  followCursor,
  squeeze = 0.2,
  focusOnClick = true,
  autoplay = false,
  interval = 4,
  captions = true,
  captureWheel = true,
  onChange,
  onSelect,
  className = '',
  style
}) => {
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const itemsRef = useRef(items);
  const engineRef = useRef(null);
  const callbacksRef = useRef({ onChange, onSelect });
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  const base = BEND_PRESETS[preset] || BEND_PRESETS.liquid;
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);

  const list = items && items.length ? items : DEFAULT_ITEMS;
  const itemsKey = list.map(item => item.src).join('|');

  useEffect(() => {
    itemsRef.current = list;
    callbacksRef.current = { onChange, onSelect };
    settingsRef.current = {
      intro,
      cardHeight,
      gap,
      radius,
      fit,
      lensWidth: pick(lensWidth, 'lensWidth'),
      lensHeight: pick(lensHeight, 'lensHeight'),
      tilt: pick(tilt, 'tilt'),
      roundness: pick(roundness, 'roundness'),
      bend: pick(bend, 'bend'),
      reach: pick(reach, 'reach'),
      curl: pick(curl, 'curl'),
      dispersion: pick(dispersion, 'dispersion'),
      liquid: pick(liquid, 'liquid'),
      followCursor: pick(followCursor, 'followCursor'),
      squeeze,
      focusOnClick,
      autoplay,
      interval,
      captureWheel
    };
    engineRef.current?.wake();
  });

  useEffect(() => {
    engineRef.current?.setItems(itemsRef.current);
  }, [itemsKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false
    });
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return undefined;
    }
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-hidden', 'true');
    container.prepend(canvas);

    const cardProgram = new Program(gl, {
      vertex: cardVertex,
      fragment: cardFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: { value: new Texture(gl) },
        uRect: { value: [0, 0, 1, 1] },
        uResolution: { value: [1, 1] },
        uSize: { value: [1, 1] },
        uImage: { value: [1, 1] },
        uRadius: { value: 16 },
        uAlpha: { value: 1 },
        uReady: { value: 0 },
        uShift: { value: 0 },
        uDpr: { value: 1 },
        uPlaceholder: { value: [0.5, 0.5, 0.5] }
      }
    });
    cardProgram.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const cardMesh = new Mesh(gl, { geometry: new Plane(gl), program: cardProgram });

    const target = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR
    });

    const lensUniforms = {
      tScene: { value: target.texture },
      uResolution: { value: [1, 1] },
      uDpr: { value: 1 },
      uCenter: { value: [0, 0] },
      uHalf: { value: [1, 1] },
      uAngle: { value: 0 },
      uExponent: { value: 2 },
      uInner: { value: 60 },
      uOuter: { value: 80 },
      uFlow: { value: 0 },
      uCurl: { value: 0 },
      uDispersion: { value: 0 },
      uStrength: { value: 0 },
      uSceneAlpha: { value: 0 }
    };
    const lensMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: lensVertex,
        fragment: lensFragment,
        uniforms: lensUniforms,
        depthTest: false,
        depthWrite: false
      })
    });

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const anisotropy = renderer.getExtension('EXT_texture_filter_anisotropic') ? 8 : 0;

    let slots = [];
    let width = 1;
    let height = 1;
    let pos = 0;
    let vel = 0;
    let goal = 0;
    let mode = 'spring';
    let wheelAt = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let dirty = true;
    let activeIndex = -1;
    let interactedAt = -Infinity;
    let autoplayAt = performance.now();
    let hasFocus = false;
    let deform = 0;
    let deformVel = 0;
    let layout = null;
    let resnap = false;
    let hover = '';
    let lift = 1;
    let energy = 0;
    let lastPos = 0;
    const lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
    const pointer = {
      x: 0,
      y: 0,
      over: false,
      down: false,
      id: -1,
      startX: 0,
      startY: 0,
      startPos: 0,
      dragging: false,
      touch: false,
      samples: []
    };
    const introState = { kind: 'none', t: 0, running: false, done: false, readyAt: 0 };
    const focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
    let instances = [];

    const loadSlot = (item, index) => {
      const texture = new Texture(gl, {
        generateMipmaps: true,
        minFilter: gl.LINEAR_MIPMAP_LINEAR,
        magFilter: gl.LINEAR,
        anisotropy
      });
      const slot = {
        item,
        index,
        texture,
        aspect: 0.8,
        loaded: false,
        failed: false,
        ready: 0,
        color: [0.5, 0.5, 0.5],
        image: [1, 1],
        dispose: () => {}
      };
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => {
        if (!alive || !slots.includes(slot)) return;
        texture.image = image;
        texture.update();
        slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
        slot.aspect = slot.image[0] / slot.image[1];
        try {
          const probe = document.createElement('canvas');
          probe.width = 8;
          probe.height = 8;
          const ctx = probe.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(image, 0, 0, 8, 8);
            const data = ctx.getImageData(0, 0, 8, 8).data;
            const avg = [0, 0, 0];
            for (let i = 0; i < data.length; i += 4) {
              avg[0] += data[i];
              avg[1] += data[i + 1];
              avg[2] += data[i + 2];
            }
            slot.color = avg.map(v => v / 64 / 255);
          }
        } catch {
          slot.color = [0.5, 0.5, 0.5];
        }
        slot.loaded = true;
        dirty = true;
        start();
      };
      image.onerror = () => {
        if (!alive) return;
        slot.failed = true;
        dirty = true;
        start();
      };
      image.src = item.src;
      slot.dispose = () => {
        image.onload = null;
        image.onerror = null;
        gl.deleteTexture(texture.texture);
      };
      return slot;
    };

    const setItems = next => {
      slots.forEach(slot => slot.dispose());
      slots = next.map(loadSlot);
      activeIndex = -1;
      layout = null;
      resnap = true;
      focus.target = 0;
      focus.t = 0;
      focus.v = 0;
      focus.pending = -1;
      setFocusOpen(false);
      introState.readyAt = performance.now();
      dirty = true;
      start();
    };

    const metrics = s => {
      const cardH = Math.max(24, s.cardHeight * height);
      const fixed = FIT_ASPECT[s.fit];
      const widths = slots.map(slot => (fixed || slot.aspect) * cardH);
      const centers = [];
      let cursor = 0;
      for (let i = 0; i < widths.length; i++) {
        centers.push(cursor + widths[i] / 2);
        cursor += widths[i] + s.gap;
      }
      return { cardH, widths, centers, gap: s.gap, loop: Math.max(cursor, 1) };
    };

    const nearest = (m, at) => {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < m.centers.length; i++) {
        const dist = Math.abs(wrap(m.centers[i] - at, m.loop));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    };

    const snapPoint = (m, at) => {
      const i = nearest(m, at);
      return at + wrap(m.centers[i] - at, m.loop);
    };

    const remap = (from, to, at) => {
      const i = nearest(from, at);
      const offset = wrap(at - from.centers[i], from.loop);
      const cycles = Math.round((at - offset - from.centers[i]) / from.loop);
      return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
    };

    const step = (m, delta) => {
      let at = snapPoint(m, goal);
      let index = nearest(m, at);
      const n = m.centers.length;
      for (let k = 0; k < Math.abs(delta); k++) {
        const next = (index + (delta > 0 ? 1 : n - 1)) % n;
        const distance =
          delta > 0
            ? m.widths[index] / 2 + m.gap + m.widths[next] / 2
            : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
        at += distance;
        index = next;
      }
      goal = at;
      mode = 'spring';
      dirty = true;
      start();
    };

    const goTo = (m, index) => {
      const i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
      goal = goal + wrap(m.centers[i] - goal, m.loop);
      mode = 'spring';
      dirty = true;
      start();
    };

    const openFocus = index => {
      focus.index = index;
      focus.pending = -1;
      focus.target = 1;
      setFocusOpen(true);
      dirty = true;
      start();
    };

    const closeFocus = () => {
      focus.pending = -1;
      if (focus.target === 0) return false;
      focus.target = 0;
      setFocusOpen(false);
      dirty = true;
      start();
      return true;
    };

    const skipIntro = () => {
      if (introState.running) introState.t = 1;
    };

    const introEffects = () => {
      const t = introState.running ? introState.t : introState.done ? 1 : 0;
      const e = { sceneAlpha: 1, strength: 1, card: null };
      if (!introState.done && !introState.running) {
        e.sceneAlpha = 0;
        e.strength = 0;
        return e;
      }
      if (t >= 1) return e;
      const kind = introState.kind;
      if (kind === 'rise') {
        e.strength = easeInOut((t - 0.3) / 0.65);
        e.card = rel => {
          const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34;
          const local = clamp01((t - delay) / 0.6);
          return {
            alpha: clamp01(local * 4),
            x: 0,
            y: (1 - easeOutQuint(local)) * height * 0.62,
            scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82)
          };
        };
      } else if (kind === 'bloom') {
        e.strength = easeInOut((t - 0.2) / 0.8);
        e.card = rel => {
          const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.25;
          const local = easeOut((t - delay) / 0.55);
          return { alpha: local, x: 0, y: 0, scale: 0.92 + 0.08 * local };
        };
      } else if (kind === 'spin') {
        e.sceneAlpha = easeOut(t / 0.25);
        e.strength = easeOut((t - 0.55) / 0.45);
      } else if (kind === 'deal') {
        e.strength = easeOut((t - 0.45) / 0.5);
        e.card = rel => {
          const spread = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.3;
          const local = easeOut((t - 0.12 - spread) / 0.5);
          return { alpha: easeOut((t - spread) / 0.12), x: -rel * (1 - local), y: 0, scale: 1 };
        };
      } else {
        e.sceneAlpha = easeOut(t);
        e.strength = easeOut(t);
      }
      return e;
    };

    const beginIntro = (s, m) => {
      const kind = reducedMotion && s.intro !== 'none' ? 'fade' : s.intro;
      introState.kind = INTRO_DURATION[kind] ? kind : 'none';
      introState.running = introState.kind !== 'none';
      introState.done = !introState.running;
      introState.t = 0;
      if (introState.done) setRevealed(true);
      if (introState.kind === 'spin') {
        const distance = m.loop * 1.6 + width;
        pos = goal + distance;
        vel = -distance * 3;
        mode = 'spring';
      }
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
      renderer.setSize(width, height);
      target.setSize(Math.max(2, Math.round(width * renderer.dpr)), Math.max(2, Math.round(height * renderer.dpr)));
      lensUniforms.tScene.value = target.texture;
      dirty = true;
      start();
    };

    const frame = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!s || !slots.length) {
        if (visible) raf = requestAnimationFrame(frame);
        return;
      }

      const m = metrics(s);
      const n = slots.length;
      let animating = false;

      if (resnap) {
        goal = snapPoint(m, goal);
        pos = goal;
        vel = 0;
        resnap = false;
      } else if (layout && layout.loop !== m.loop) {
        pos = remap(layout, m, pos);
        goal = remap(layout, m, goal);
        pointer.startPos = pos + (pointer.x - pointer.startX);
        animating = true;
      }
      layout = m;

      if (!introState.running && !introState.done) {
        const allSettled = slots.every(slot => slot.loaded || slot.failed);
        if (allSettled || now - introState.readyAt > 3500) {
          goal = snapPoint(m, goal);
          pos = goal;
          beginIntro(s, m);
        }
      }
      if (introState.running) {
        introState.t = Math.min(1, introState.t + dt / (INTRO_DURATION[introState.kind] || 1));
        if (introState.t >= 1) {
          introState.running = false;
          introState.done = true;
          setRevealed(true);
        }
        animating = true;
      }

      if (mode === 'wheel' && now - wheelAt > 150) {
        goal = snapPoint(m, goal);
        mode = 'spring';
      }
      if (!pointer.dragging) {
        const spinning = introState.running && introState.kind === 'spin';
        const stiffness = spinning ? 9 : mode === 'wheel' ? 80 : 55;
        const damping = 2 * Math.sqrt(stiffness);
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          const acc = stiffness * (goal - pos) - damping * vel;
          vel += acc * h;
          pos += vel * h;
        }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) {
          pos = goal;
          vel = 0;
        } else {
          animating = true;
        }
      } else {
        animating = true;
      }

      if (Math.abs(pos) > m.loop * 8) {
        const shift = Math.round(pos / m.loop) * m.loop;
        pos -= shift;
        goal -= shift;
        pointer.startPos -= shift;
      }

      const current = nearest(m, pos);
      if (current !== activeIndex) {
        activeIndex = current;
        setActive(current);
        callbacksRef.current.onChange?.(current, itemsRef.current[current]);
      }

      if (focus.pending >= 0 && mode === 'spring' && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
        if (current === focus.pending) openFocus(current);
        else focus.pending = -1;
      }

      if (
        s.autoplay &&
        !reducedMotion &&
        introState.done &&
        focus.target === 0 &&
        focus.t < 0.01 &&
        !pointer.over &&
        !pointer.down &&
        !hasFocus &&
        mode === 'spring' &&
        Math.abs(goal - pos) < 1 &&
        now - interactedAt > 3000 &&
        now - autoplayAt > s.interval * 1000
      ) {
        autoplayAt = now;
        step(m, 1);
      }
      if (s.autoplay && !reducedMotion) animating = true;

      const travel = Math.abs(pos - lastPos) / dt;
      lastPos = pos;
      const energyTarget = reducedMotion ? 0 : Math.min(travel / 2600, 1);
      energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
      if (energy > 0.001) animating = true;
      const liquidAmount = reducedMotion ? 0 : s.liquid;
      const push = Math.max(-1, Math.min(1, vel / 2200));
      const deformStiffness = 120;
      const deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
      deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
      deform += deformVel * dt;
      if (Math.abs(deform) > 0.0005 || Math.abs(deformVel) > 0.005) animating = true;

      const focusStiffness = 64;
      focus.v += (focusStiffness * (focus.target - focus.t) - 2 * Math.sqrt(focusStiffness) * focus.v) * dt;
      focus.t += focus.v * dt;
      if (Math.abs(focus.target - focus.t) < 0.0005 && Math.abs(focus.v) < 0.001) {
        focus.t = focus.target;
        focus.v = 0;
      } else {
        animating = true;
      }
      const focusAmount = clamp01(focus.t);
      const focusEase = easeInOut(focusAmount);
      const focusW = focus.index >= 0 && focus.index < n ? m.widths[focus.index] : m.cardH;
      const focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
      const nextLift = 1 + (focusScale - 1) * focusEase;
      if (Math.abs(nextLift - lift) > 0.0005) {
        lift = nextLift;
        container.style.setProperty('--flex-carousel-lift', lift.toFixed(4));
      }

      const effects = introEffects();

      const homeX = width / 2;
      const homeY = height / 2;
      const follow = s.followCursor && pointer.over && !pointer.dragging && !pointer.touch && focus.target === 0;
      const aimX = follow ? pointer.x : homeX;
      const aimY = follow ? pointer.y : homeY;
      if (!lens.ready) {
        lens.x = homeX;
        lens.y = homeY;
        lens.ready = true;
      }
      const lensK = 110;
      const lensC = 2 * Math.sqrt(lensK) * 0.8;
      lens.vx += (lensK * (aimX - lens.x) - lensC * lens.vx) * dt;
      lens.vy += (lensK * (aimY - lens.y) - lensC * lens.vy) * dt;
      lens.x += lens.vx * dt;
      lens.y += lens.vy * dt;
      if (Math.abs(aimX - lens.x) + Math.abs(aimY - lens.y) > 0.2 || Math.abs(lens.vx) + Math.abs(lens.vy) > 0.5)
        animating = true;

      const cardH = m.cardH;
      let halfW = (s.lensWidth * width) / 2;
      let halfH = (s.lensHeight * width) / 2;
      const squash = Math.abs(deform) * liquidAmount;
      halfW *= 1 + squash * 0.16;
      halfH *= 1 - squash * 0.08;
      const lensX = lens.x - deform * 14 * liquidAmount;

      for (let i = 0; i < n; i++) {
        const slot = slots[i];
        if (slot.loaded && slot.ready < 1) {
          slot.ready = Math.min(1, slot.ready + dt / 0.45);
          animating = true;
        }
      }

      const waiting = !introState.done;
      if (dirty || animating || pointer.dragging) {
        dirty = false;
        instances = [];
        const dpr = renderer.dpr;
        cardProgram.uniforms.uResolution.value = [width, height];
        cardProgram.uniforms.uDpr.value = dpr;
        cardProgram.uniforms.uRadius.value = s.radius;
        const shrink = 1 - clamp01(s.squeeze) * energy;
        const draws = [];
        for (let i = 0; i < n; i++) {
          const w = m.widths[i];
          const baseRel = wrap(m.centers[i] - pos, m.loop);
          for (let k = -3; k <= 3; k++) {
            const rel = baseRel + k * m.loop;
            if (Math.abs(rel) - w / 2 > width + 40) continue;
            const fx = effects.card ? effects.card(rel) : null;
            let x = homeX + rel + (fx ? fx.x : 0);
            let scale = shrink * (fx ? fx.scale : 1);
            let alpha = fx ? fx.alpha : 1;
            if (focusAmount > 0) {
              if (i === focus.index && Math.abs(rel) < w) {
                scale *= 1 + (focusScale - 1) * focusEase;
              } else {
                const order = Math.min(Math.abs(rel) / width, 1) * 0.25;
                const part = easeInOut(focusAmount * 1.25 - order);
                x += Math.sign(rel) * part * width * 0.7;
                alpha *= 1 - part;
              }
            }
            const cw = w * scale;
            if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
            draws.push({ i, rel, x, y: homeY + (fx ? fx.y : 0), cw, ch: cardH * scale, alpha });
          }
        }
        draws.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
        let first = true;
        for (const draw of draws) {
          const slot = slots[draw.i];
          cardProgram.uniforms.tMap.value = slot.texture;
          cardProgram.uniforms.uRect.value = [draw.x, draw.y, draw.cw + 2, draw.ch + 2];
          cardProgram.uniforms.uSize.value = [draw.cw, draw.ch];
          cardProgram.uniforms.uImage.value = slot.image;
          cardProgram.uniforms.uAlpha.value = draw.alpha;
          cardProgram.uniforms.uReady.value = slot.ready;
          cardProgram.uniforms.uShift.value = reducedMotion ? 0 : Math.max(-1, Math.min(1, draw.rel / (width * 0.75)));
          cardProgram.uniforms.uPlaceholder.value = slot.color;
          renderer.render({ scene: cardMesh, target, clear: first });
          first = false;
          instances.push({
            index: draw.i,
            x0: draw.x - draw.cw / 2,
            x1: draw.x + draw.cw / 2,
            y0: draw.y - draw.ch / 2,
            y1: draw.y + draw.ch / 2
          });
        }
        if (first) {
          renderer.bindFramebuffer(target);
          gl.viewport(0, 0, target.width, target.height);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        renderer.bindFramebuffer();
        target.texture.bind();
        gl.generateMipmap(gl.TEXTURE_2D);

        lensUniforms.uResolution.value = [width, height];
        lensUniforms.uDpr.value = dpr;
        lensUniforms.uCenter.value = [lensX, lens.y];
        lensUniforms.uHalf.value = [Math.max(halfW, 1), Math.max(halfH, 1)];
        lensUniforms.uAngle.value = (s.tilt * Math.PI) / 180;
        lensUniforms.uExponent.value = 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10;
        const spanW = Math.max(halfW, 1);
        const spanH = Math.max(halfH, 1);
        const inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
        lensUniforms.uInner.value = inner;
        lensUniforms.uOuter.value = inner * 1.6;
        lensUniforms.uFlow.value = s.bend * (spanW + spanH) * 0.45;
        lensUniforms.uCurl.value = s.curl === 'rise' ? 1 : s.curl === 'fall' ? -1 : 0;
        lensUniforms.uDispersion.value = s.dispersion * 0.12 * (1 + Math.abs(deform) * liquidAmount * 1.2);
        lensUniforms.uStrength.value = effects.strength * (1 - focusEase);
        lensUniforms.uSceneAlpha.value = effects.sceneAlpha;
        renderer.render({ scene: lensMesh });
      }

      let nextHover = '';
      if (pointer.over && !pointer.dragging && introState.done && s.focusOnClick) {
        const hit = instances.find(
          inst => pointer.x >= inst.x0 && pointer.x <= inst.x1 && pointer.y >= inst.y0 && pointer.y <= inst.y1
        );
        if (focus.target > 0) nextHover = 'close';
        else if (hit) nextHover = 'open';
      }
      if (nextHover !== hover) {
        hover = nextHover;
        if (hover) container.setAttribute('data-hover', hover);
        else container.removeAttribute('data-hover');
      }

      if (visible && (animating || waiting || dirty || pointer.down)) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const localPoint = e => {
      const rect = container.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerDown = e => {
      if (e.button !== undefined && e.button > 0) return;
      skipIntro();
      const [x, y] = localPoint(e);
      pointer.down = true;
      pointer.id = e.pointerId;
      pointer.touch = e.pointerType === 'touch';
      pointer.startX = x;
      pointer.startY = y;
      pointer.x = x;
      pointer.y = y;
      pointer.startPos = pos;
      pointer.dragging = false;
      pointer.samples = [{ x, t: performance.now() }];
      interactedAt = performance.now();
      if (Math.abs(vel) > 40) {
        goal = pos;
        vel = 0;
      }
      dirty = true;
      start();
    };

    const onPointerMove = e => {
      const [x, y] = localPoint(e);
      pointer.x = x;
      pointer.y = y;
      pointer.over = true;
      if (pointer.down && e.pointerId === pointer.id) {
        const dx = x - pointer.startX;
        const dy = y - pointer.startY;
        const slop = pointer.touch ? 10 : 5;
        if (!pointer.dragging) {
          if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
            pointer.down = false;
            return;
          }
          if (Math.abs(dx) > slop) {
            pointer.dragging = true;
            pointer.startX = x;
            pointer.startPos = pos;
            closeFocus();
            try {
              container.setPointerCapture(e.pointerId);
            } catch {
              pointer.dragging = true;
            }
            container.setAttribute('data-dragging', '');
          }
        }
        if (pointer.dragging) {
          pos = pointer.startPos - (x - pointer.startX);
          goal = pos;
          vel = 0;
          const now = performance.now();
          pointer.samples.push({ x, t: now });
          while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
        }
      }
      dirty = true;
      start();
    };

    const onPointerUp = e => {
      if (!pointer.down || e.pointerId !== pointer.id) return;
      pointer.down = false;
      container.removeAttribute('data-dragging');
      const s = settingsRef.current;
      if (!s) return;
      const m = metrics(s);
      interactedAt = performance.now();
      if (pointer.dragging) {
        pointer.dragging = false;
        const now = performance.now();
        const first = pointer.samples[0];
        const lastSample = pointer.samples[pointer.samples.length - 1];
        let velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) {
          velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        }
        vel = velocity;
        const landing = snapPoint(m, pos + velocity * 0.32);
        goal = landing;
        if (Math.abs(velocity) > 400 && Math.abs(landing - pos) < 1) step(m, velocity > 0 ? 1 : -1);
        mode = 'spring';
        start();
        return;
      }
      if (closeFocus()) return;
      const [x, y] = localPoint(e);
      const hit = instances.find(inst => x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1);
      if (!hit) return;
      if (hit.index === activeIndex && Math.abs(goal - pos) < 2) {
        callbacksRef.current.onSelect?.(hit.index, itemsRef.current[hit.index]);
        if (s.focusOnClick) openFocus(hit.index);
      } else {
        const rel = (hit.x0 + hit.x1) / 2 - width / 2;
        goal = snapPoint(m, pos + rel);
        mode = 'spring';
        if (s.focusOnClick) focus.pending = hit.index;
        start();
      }
    };

    const onPointerLeave = () => {
      pointer.over = false;
      dirty = true;
      start();
    };

    const onPointerCancel = () => {
      pointer.down = false;
      pointer.dragging = false;
      container.removeAttribute('data-dragging');
      const s = settingsRef.current;
      if (!s) return;
      goal = snapPoint(metrics(s), pos);
      mode = 'spring';
      start();
    };

    const onWheel = e => {
      const s = settingsRef.current;
      if (!s || e.ctrlKey) return;
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) {
        dx = dy;
        dy = 0;
      }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal && !s.captureWheel) return;
      e.preventDefault();
      skipIntro();
      interactedAt = performance.now();
      if (closeFocus()) return;
      const delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
      goal += delta * 1.25;
      mode = 'wheel';
      wheelAt = performance.now();
      start();
    };

    const onKeyDown = e => {
      const s = settingsRef.current;
      if (!s) return;
      const m = metrics(s);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        skipIntro();
        closeFocus();
        interactedAt = performance.now();
        step(m, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        skipIntro();
        closeFocus();
        interactedAt = performance.now();
        step(m, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        closeFocus();
        goTo(m, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        closeFocus();
        goTo(m, slots.length - 1);
      } else if (e.key === 'Escape') {
        if (closeFocus()) e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (closeFocus() || activeIndex < 0) return;
        callbacksRef.current.onSelect?.(activeIndex, itemsRef.current[activeIndex]);
        if (s.focusOnClick) openFocus(activeIndex);
      }
    };

    const onFocus = () => {
      hasFocus = true;
    };
    const onBlur = () => {
      hasFocus = false;
    };
    const onVisibility = () => {
      if (!document.hidden) start();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('focus', onFocus);
    container.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersectionObserver.observe(container);

    engineRef.current = {
      wake: () => {
        dirty = true;
        start();
      },
      setItems
    };

    resize();
    setItems(itemsRef.current);

    return () => {
      alive = false;
      visible = false;
      engineRef.current = null;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focus', onFocus);
      container.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      slots.forEach(slot => slot.dispose());
      slots = [];
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  const current = list[active] || list[0];
  const label = current ? current.title || current.alt || `Image ${active + 1}` : '';

  return (
    <div
      ref={containerRef}
      className={`flex-carousel ${className}`.trim()}
      style={{ ...style, '--flex-carousel-half': `${Math.min(Math.max(cardHeight, 0.05), 1) * 50}%` }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      tabIndex={0}
    >
      {captions && current && revealed && (
        <div className="flex-carousel__caption" aria-hidden="true">
          <span key={active} className="flex-carousel__title">
            {current.title || current.alt}
            {current.subtitle && <span className="flex-carousel__subtitle">{current.subtitle}</span>}
          </span>
          <span className="flex-carousel__count" data-hidden={focusOpen ? '' : undefined}>
            <Digits value={active + 1} />
            <span className="flex-carousel__slash">/</span>
            <span>{String(list.length).padStart(2, '0')}</span>
          </span>
        </div>
      )}
      <div className="flex-carousel__live" aria-live="polite" aria-atomic="true">
        {`${label}, ${active + 1} of ${list.length}`}
      </div>
    </div>
  );
};

export default FlexCarousel;

```

### Component CSS
```css
.flex-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: contain;
  outline: none;
}

.flex-carousel[data-hover='open'] {
  cursor: zoom-in;
}

.flex-carousel[data-hover='close'] {
  cursor: zoom-out;
}

.flex-carousel[data-dragging] {
  cursor: grabbing;
}

.flex-carousel:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(128, 128, 140, 0.55);
}

.flex-carousel__caption {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% + var(--flex-carousel-half) * var(--flex-carousel-lift, 1) + 22px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  pointer-events: none;
  text-align: center;
  animation: flex-carousel-reveal 900ms ease both;
}

.flex-carousel__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
  animation: flex-carousel-title 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.flex-carousel__subtitle {
  font-weight: 400;
  opacity: 0.6;
}

.flex-carousel__count {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
  transition: opacity 400ms ease;
}

.flex-carousel__count[data-hidden] {
  opacity: 0;
}

.flex-carousel__digits {
  display: inline-flex;
}

.flex-carousel__digit {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}

.flex-carousel__reel {
  display: flex;
  flex-direction: column;
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.flex-carousel__reel span {
  height: 1em;
}

.flex-carousel__slash {
  opacity: 0.6;
}

.flex-carousel__live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes flex-carousel-title {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes flex-carousel-reveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flex-carousel__caption,
  .flex-carousel__title {
    animation: none;
  }

  .flex-carousel__reel {
    transition: none;
  }
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
  ## Integrate the <ScrollStack /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: ScrollStack
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import ScrollStack, { ScrollStackItem } from './ScrollStack'

<div style={{ height: 600 }}>
  <ScrollStack>
    <ScrollStackItem>
      <h2>Card 1</h2>
      <p>This is the first card in the stack</p>
    </ScrollStackItem>
    <ScrollStackItem>
      <h2>Card 2</h2>
      <p>This is the second card in the stack</p>
    </ScrollStackItem>
    <ScrollStackItem>
      <h2>Card 3</h2>
      <p>This is the third card in the stack</p>
    </ScrollStackItem>
  </ScrollStack>
</div>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | The cards to stack, usually ScrollStackItem elements. |
| itemDistance | number | 100 | Gap between cards before they stack, in px. Larger gaps mean more scrolling between cards. |
| itemStackDistance | number | 24 | How far each card rests below the one before it in the stack, in px. 0 piles them exactly. |
| stackPosition | number | string | '15%' | Where the stack pins, from the top of the viewport or container. A number is px, or use a % string. |
| itemScale | number | 0.05 | How much a card shrinks for each card stacked on top of it. |
| baseScale | number | 0.8 | The smallest a buried card can shrink to. |
| dimAmount | number | 0.2 | How much a card darkens for each card stacked on top of it, from 0 to 1. |
| blurAmount | number | 0 | Blur added for each card stacked on top, in px. |
| tiltAmount | number | 0 | How far buried cards lean back in 3D, in degrees. |
| rotationAmount | number | 0 | How far buried cards turn, alternating left and right like a loose pile, in degrees. |
| holdDistance | number | 200 | How long the finished stack stays pinned before it scrolls away, in px of scrolling. |
| smoothScroll | boolean | true | Glides mouse wheel scrolling smoothly. Touch, keyboard and scrollbar scrolling stay native. With useWindowScroll it smooths the whole page while the stack is mounted. |
| snap | boolean | false | When scrolling stops near a card, glides it the rest of the way onto the stack. |
| useWindowScroll | boolean | false | Stacks the cards as the page scrolls instead of scrolling inside its own container. Avoid overflow: hidden on parent elements, which stops cards from pinning. |
| onStackComplete | () => void | - | Called when the last card lands on the stack. |
| className | string | '' | Extra class names for the stack container. |
| itemClassName | string | '' | ScrollStackItem only. Extra class names for the card, for its size, colors and content. |
| style | CSSProperties | - | ScrollStackItem only. Inline styles for the card. |

### Full Component Source
```jsx
'use client';

import { Children, Fragment, isValidElement, useLayoutEffect, useRef } from 'react';
import './ScrollStack.css';

const resolveOffset = (value, size) => {
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
  return parseFloat(text) || 0;
};

const toLength = value => (typeof value === 'number' ? `${value}px` : value);

const scrollsInside = (node, stop, delta) => {
  for (let element = node; element && element !== stop; element = element.parentElement) {
    if (element.scrollHeight <= element.clientHeight + 1) continue;
    const overflow = getComputedStyle(element).overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    if (delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) {
      return true;
    }
  }
  return false;
};

export const ScrollStackItem = ({ children, itemClassName = '', style }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
    <span className="scroll-stack-card__shade" aria-hidden="true" />
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemStackDistance = 24,
  stackPosition = '15%',
  itemScale = 0.05,
  baseScale = 0.8,
  dimAmount = 0.2,
  blurAmount = 0,
  tiltAmount = 0,
  rotationAmount = 0,
  holdDistance = 200,
  smoothScroll = true,
  snap = false,
  useWindowScroll = false,
  onStackComplete
}) => {
  const rootRef = useRef(null);
  const innerRef = useRef(null);
  const endRef = useRef(null);
  const settingsRef = useRef(null);
  const scheduleRef = useRef(null);
  const items = Children.toArray(children);

  useLayoutEffect(() => {
    settingsRef.current = {
      itemDistance,
      itemStackDistance,
      stackPosition,
      itemScale,
      baseScale,
      dimAmount,
      blurAmount,
      tiltAmount,
      rotationAmount,
      holdDistance,
      smoothScroll,
      snap,
      onStackComplete
    };
    scheduleRef.current?.();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const end = endRef.current;
    if (!root || !inner || !end) return undefined;

    const windowed = useWindowScroll;
    const target = windowed ? window : root;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map();
    let frame = 0;
    let glide = 0;
    let rest = 0;
    let complete = false;
    let gliding = false;
    let pressed = false;
    let current = 0;
    let goal = 0;
    let written = 0;
    let last = 0;
    let points = [];
    let reach = 0;

    const readScroll = () => (windowed ? window.scrollY : root.scrollTop);
    const maxScroll = () =>
      windowed ? document.documentElement.scrollHeight - window.innerHeight : root.scrollHeight - root.clientHeight;
    const writeScroll = value => {
      written = value;
      target.scrollTo({ top: value, behavior: 'instant' });
    };

    const write = (key, value, apply) => {
      if (cache.get(key) === value) return false;
      cache.set(key, value);
      apply(value);
      return true;
    };

    const update = () => {
      frame = 0;
      const settings = settingsRef.current;
      const slots = Array.from(inner.children).filter(child => child.hasAttribute('data-stack-slot'));
      if (!settings || !slots.length) return;

      const viewHeight = windowed ? window.innerHeight : root.clientHeight;
      const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      const stackTop = resolveOffset(settings.stackPosition, viewHeight);
      const offset = settings.itemStackDistance;
      const heights = slots.map(slot => slot.offsetHeight);
      const tops = slots.map(slot => slot.getBoundingClientRect().top);
      const lastPin = stackTop + (slots.length - 1) * offset;
      const padTop = windowed ? 0 : stackTop;
      const endHeight =
        settings.holdDistance + (windowed ? 0 : Math.max(0, viewHeight - lastPin - heights[heights.length - 1]));

      let moved = write('padTop', padTop, value => {
        inner.style.paddingTop = `${value}px`;
      });
      moved =
        write('endHeight', endHeight, value => {
          end.style.height = `${value}px`;
        }) || moved;

      let flow = inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
      points = heights.map((height, i) => {
        const point = flow - stackTop - i * offset;
        flow += height + settings.itemDistance;
        return point;
      });
      reach = Math.max(40, (heights[0] + settings.itemDistance - offset) / 2);

      const depths = slots.map(() => 0);
      let lastCover = 0;
      for (let j = 1; j < slots.length; j++) {
        const pinBefore = viewTop + stackTop + (j - 1) * offset;
        const start = pinBefore + heights[j - 1];
        const span = Math.max(1, start - pinBefore - offset);
        const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
        for (let i = 0; i < j; i++) depths[i] += cover;
        lastCover = cover;
      }

      const dimStep = Math.min(Math.max(settings.dimAmount, 0), 1);
      slots.forEach((slot, i) => {
        const card = slot.firstElementChild;
        if (!card) return;
        const depth = depths[i];
        const lean = Math.min(depth, 1);
        const scale = Math.max(Math.min(settings.baseScale, 1), 1 - depth * settings.itemScale);
        const tilt = -lean * settings.tiltAmount;
        const turn = lean * settings.rotationAmount * (i % 2 ? -1 : 1);
        const blur = depth * settings.blurAmount;
        const dim = 1 - Math.pow(1 - dimStep, depth);
        const transform =
          depth < 0.0005
            ? ''
            : `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        write(`transform${i}`, transform, value => {
          card.style.transform = value;
        });
        write(`filter${i}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '', value => {
          card.style.filter = value;
        });
        write(`dim${i}`, dim.toFixed(3), value => {
          card.style.setProperty('--scroll-stack-dim', value);
        });
      });

      const done = slots.length > 1 && lastCover >= 0.999;
      if (done !== complete) {
        complete = done;
        if (done) settings.onStackComplete?.();
      }

      if (moved) schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const step = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (Math.abs(readScroll() - written) > 2) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      current += (goal - current) * (1 - Math.pow(0.9, dt * 60));
      if (Math.abs(goal - current) < 0.5) current = goal;
      writeScroll(current);
      if (current === goal) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      glide = requestAnimationFrame(step);
    };

    const glideTo = value => {
      goal = Math.min(Math.max(value, 0), maxScroll());
      if (motion.matches) {
        writeScroll(goal);
        return;
      }
      if (gliding) return;
      gliding = true;
      current = readScroll();
      written = current;
      last = performance.now();
      glide = requestAnimationFrame(step);
    };

    const settle = () => {
      rest = 0;
      if (!settingsRef.current?.snap || gliding || pressed || !points.length) return;
      const now = readScroll();
      const nearest = points.reduce((best, point) => (Math.abs(point - now) < Math.abs(best - now) ? point : best));
      const gap = Math.abs(nearest - now);
      if (gap > 1 && gap < reach) glideTo(nearest);
    };

    const settleSoon = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 140);
    };

    const onScroll = () => {
      schedule();
      if (!gliding) settleSoon();
    };

    const onWheel = event => {
      if (!settingsRef.current?.smoothScroll || motion.matches || event.defaultPrevented || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const page = windowed ? window.innerHeight : root.clientHeight;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
      if (!delta || scrollsInside(event.target, windowed ? document.body : root, delta)) return;
      const base = gliding ? goal : readScroll();
      if ((delta < 0 && base <= 0) || (delta > 0 && base >= maxScroll() - 0.5)) return;
      event.preventDefault();
      window.clearTimeout(rest);
      glideTo(base + delta);
    };

    const onPress = () => {
      pressed = true;
      window.clearTimeout(rest);
    };

    const onRelease = () => {
      if (!pressed) return;
      pressed = false;
      settleSoon();
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(inner);
    target.addEventListener('scroll', onScroll, { passive: true });
    target.addEventListener('wheel', onWheel, { passive: false });
    target.addEventListener('pointerdown', onPress, { passive: true });
    window.addEventListener('pointerup', onRelease, { passive: true });
    window.addEventListener('pointercancel', onRelease, { passive: true });
    window.addEventListener('resize', schedule);
    scheduleRef.current = schedule;
    update();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glide);
      window.clearTimeout(rest);
      observer.disconnect();
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('pointerdown', onPress);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('resize', schedule);
      scheduleRef.current = null;
    };
  }, [useWindowScroll]);

  return (
    <div
      ref={rootRef}
      className={`scroll-stack ${useWindowScroll ? 'scroll-stack--window' : 'scroll-stack--contained'} ${className}`.trim()}
    >
      <div ref={innerRef} className="scroll-stack__inner">
        {items.map((child, index) => {
          const gap = itemDistance - (items.length - index) * itemStackDistance;
          return (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 && (
                <div aria-hidden="true" style={{ height: Math.max(0, gap), marginTop: Math.min(0, gap) }} />
              )}
              <div
                data-stack-slot=""
                className="scroll-stack__slot"
                style={{
                  top: `calc(${toLength(stackPosition)} + ${index * itemStackDistance}px)`,
                  marginBottom: (items.length - 1 - index) * itemStackDistance,
                  zIndex: index + 1
                }}
              >
                {child}
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} className="scroll-stack__end" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ScrollStack;

```

### Component CSS
```css
.scroll-stack {
  position: relative;
  width: 100%;
}

.scroll-stack--contained {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.scroll-stack__inner {
  position: relative;
  padding-inline: clamp(1rem, 6%, 5rem);
}

.scroll-stack__slot {
  position: sticky;
}

.scroll-stack-card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 20rem;
  padding: 2.5rem;
  border-radius: 28px;
  background: light-dark(#ffffff, #18181b);
  color: light-dark(#18181b, #fafafa);
  box-shadow:
    0 0 0 1px light-dark(rgb(0 0 0 / 0.06), rgb(255 255 255 / 0.08)),
    0 -12px 40px -16px rgb(0 0 0 / 0.35),
    0 24px 48px -24px rgb(0 0 0 / 0.4);
  transform-origin: 50% 0;
  will-change: transform;
}

.scroll-stack-card__shade {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #000;
  opacity: var(--scroll-stack-dim, 0);
  pointer-events: none;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
 ## Integrate the <OptionWheel /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: OptionWheel
### Variant: JavaScript + CSS


---

### Usage Example
```jsx
import OptionWheel from './OptionWheel';

<OptionWheel
  items={['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave']}
  defaultSelected={2}
  textColor="#a6a6a6"
  activeColor="#ffffff"
  side="left"
  fontSize={3}
  spacing={1.4}
  curve={1}
  tilt={6}
  blur={2}
  fade={0.25}
  smoothing={200}
  inset={80}
  loop={false}
  draggable
  soundUrl="/sounds/click-soft.mp3"
  soundVolume={0.5}
  onChange={(index, item) => console.log(index, item)}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | string[] | [...] | Labels rendered as the wheel options. |
| defaultSelected | number | 3 | Index of the option selected on mount. |
| onChange | (index, item) => void | - | Called whenever the wheel settles on a new option. |
| textColor | string | "#a6a6a6" | Resting color of the option labels. |
| activeColor | string | "#ffffff" | Color an option blends toward as it reaches the middle of the wheel. |
| side | "left" | "right" | "left" | Edge of the container the wheel curves around. |
| fontSize | number | 3 | Font size of the option labels in rem. |
| spacing | number | 1.4 | Vertical distance between options as a multiple of the font size. |
| curve | number | 1 | Depth of the circular curve; 0 flattens the wheel into a straight list. |
| tilt | number | 6 | Angle in degrees between neighboring options; higher values curl the wheel tighter. |
| blur | number | 2 | Blur in pixels added per step away from the middle. |
| fade | number | 0.25 | Opacity lost per step away from the middle. |
| minOpacity | number | 0.05 | Opacity floor for the furthest options. |
| smoothing | number | 200 | Easing time constant in milliseconds; higher values feel heavier. |
| inset | number | 80 | Padding in pixels between the anchored edge and the centered option. |
| loop | boolean | false | Wrap around infinitely instead of stopping at the first and last option. |
| draggable | boolean | true | Allow dragging the wheel with a pointer, in addition to scroll and arrow keys. |
| soundUrl | string | "" | URL of a short tick sound played when the selection changes; empty disables it. |
| soundVolume | number | 0.5 | Playback volume of the tick sound. |
| className | string | "" | Additional CSS classes for the outer wrapper. |

### Full Component Source
```jsx
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import './OptionWheel.css';

const DEFAULT_ITEMS = [
  'Ambient',
  'House',
  'Techno',
  'Jazz',
  'Lo-Fi',
  'Synthwave',
  'Trance',
  'Funk',
  'Disco',
  'Hip-Hop',
  'Chillwave',
  'Drum & Bass'
];

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = ''
}) => {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume
  };

  // Single rAF loop that eases the wheel position toward its target with
  // frame-rate independent exponential smoothing, then lays every option out
  // along the curve based on its distance from the current position.
  const runFrame = useCallback(now => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === 'right' ? -1 : 1;
    // Options sit on a circle whose radius keeps the arc length between two
    // neighbors equal to one row height, so tilt controls how tightly it curls.
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // Optional tick on selection change, throttled so fast scrolling can't spam
  // it, and with playback failures (e.g. autoplay policies) silently ignored.
  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = soundUrl;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(soundVolume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value, snap) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick]
  );

  // Wheel / touchpad scrolling, registered manually so it can be non-passive.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      // Cap each event at one step so notchy mouse wheels move exactly one
      // option per click, while touchpads still scroll continuously.
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback(e => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    e => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        // Capture only once a real drag starts, so plain clicks still reach
        // the items and navigate to them.
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false);
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    index => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    e => {
      let delta = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`option-wheel${side === 'right' ? ' option-wheel--right' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={`option-wheel__item${selectedIndex === index ? ' option-wheel__item--selected' : ''}`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default OptionWheel;

```

### Component CSS
```css
.option-wheel {
  --ow-text-color: #a6a6a6;
  --ow-active-color: #ffffff;
  --ow-font-size: 3rem;
  --ow-inset: 80px;

  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: none;
  outline: none;
}

.option-wheel--dragging {
  cursor: grabbing;
}

/* Each option is absolutely centered, then offset along the curve by the
   rAF loop through transform/opacity/filter, so everything stays in step. */
.option-wheel__item {
  position: absolute;
  top: 50%;
  left: var(--ow-inset);
  white-space: nowrap;
  font-size: var(--ow-font-size);
  line-height: 1;
  font-weight: 200;
  transform-origin: left center;
  cursor: pointer;
  will-change: transform, opacity, filter;
  /* --ow-p goes 0 -> 1 as an option approaches the middle of the wheel */
  color: color-mix(in srgb, var(--ow-active-color) calc(var(--ow-p, 0) * 100%), var(--ow-text-color));
}

.option-wheel--right .option-wheel__item {
  left: auto;
  right: var(--ow-inset);
  transform-origin: right center;
}

.option-wheel__item--selected {
  font-weight: 500;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.
