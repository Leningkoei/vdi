interface Options {

  scheduler: (f: () => void) => void

};

interface Effect {

  content: () => void,

  depends: Set<Effect>[],

  options: Options

};

const bucket: WeakMap<Object, Map<string, Set<Effect>>> =
  new Map<Object, Map<string, Set<Effect>>>();

const effectStack: Effect[] = [];

let activeEffect: Effect = undefined;

const cleanup = (effect: Effect) => {

  effect.depends.forEach((currentDepends: Set<Effect>): boolean =>
    currentDepends.delete(effect));

  effect.depends.length = 0;

};

const registerEffect = (customEffect: () => void,
                        options: Options = {}): void => {

  const effect: Effect = {

    content(): void {

      // Holy Shit!!! I will never use `this` in your fucking javascript.
      // `this` will cause problem when you call this function as a callback.
      // Reason is you just pass `effect.content` and call it by `content()`,
      // so you can solve it by pass `effect` and call it by `effect.content()`
      // Just is my guess.
      // So you should never pass a method of a object which is using `this`
      // inner it.

      cleanup(effect);

      activeEffect = effect;

      effectStack.push(effect);

        customEffect();

      effectStack.pop();

      activeEffect = effectStack[effectStack.length - 1];

    },

    depends: [],

    options

  };

  effect.content();

};

const data: Object = {

  foo: 1

};

const obj: Proxy = new Proxy(data, {

  get(target: Object, key: string): any {

    track(target, key);

    return Reflect.get(...arguments);

  },

  set(target: Object, key: string, newVal: any): boolean {

    target[key] = newVal;

    trigger(target, key);

    // return Reflect.set(...arguments);

    return true;

  }

});

const track = (target: Object, key: string): void => {

  if (activeEffect) {

    let dependsMap: Map<Set<Effect>> = bucket.get(target);

    if (!dependsMap) {

      dependsMap = new Map<string, Set<Effect>>();

      bucket.set(target, dependsMap);

    };

    let depends: Set<Effect> = dependsMap.get(key);

    if (!depends) {

      depends = new Set<Effect>();

      dependsMap.set(key, depends);

    };

    depends.add(activeEffect);

    activeEffect.depends.push(depends);

  };

};

const trigger = (target: Object, key: string): void => {

  const dependsMap: Map<string, Set<Effect>> = bucket.get(target);

  if (!dependsMap) return;

  const depends: Set<Effect> = dependsMap.get(key);

  if (!depends) return;

  const dependsToRun: Set<Effect> = new Set<Effect>();

  depends.forEach((currentEffect: Effect) => {

    if (currentEffect !== activeEffect) {

      dependsToRun.add(currentEffect);

    };

  });

  dependsToRun.forEach((currentEffect: Effect) => {

    if (currentEffect.options.scheduler) {

      currentEffect.options.scheduler(currentEffect.content);

    } else {

      currentEffect.content()

    };

  });

};

const delay = (delayed: () => any, time: number) =>
  new Promise((resolve: (result: any) => void,
               _: (error: Error) => void) =>
    setTimeout(() => resolve(delayed()), time));

const jobQueue: Set<() => void> = new Set<() => void>();

const p: Promise = Promise.resolve();

let isFlushing = false;

const flushJob = () => {

  if (isFlushing) return;

  isFlushing = true;

  p.then(() => {

    jobQueue.forEach(job => job());

  }).finally(() => {

    isFlushing = false;

  });

};

// custom code part

const customEffect = (): void => {

  console.log(obj.foo);

};

registerEffect(customEffect, {

  scheduler(effect: () => void) {

    // setTimeout(effect);

    jobQueue.add(effect);

    flushJob();

  }

});

obj.foo++;
obj.foo++;
console.log('finished');

// while (true) {
// 
//   await delay(() => obj.foo++, 1000);
// 
// };
