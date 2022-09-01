interface Effect {

  content: () => void,

  depends: Set<Effect>[]

};

const bucket: WeakMap<Object, Map<string, Set<Effect>>> =
  new WeakMap<Object, Map<string, Set<Effect>>>();

let activeEffect: Effect = undefined;

const cleanup = (effect: Effect) => {

  effect.depends.forEach((currentDepends: Set<Effect>): boolean =>
    currentDepends.delete(effect));

  effect.depends.length = 0;

};

const registerEffect = (customEffect: () => void): void => {

  const effect: Effect = {

    content() {

      cleanup(this);

      activeEffect = this;

      customEffect();

    },

    depends: []

  };

  effect.content();

};

const data: Object = {

  ok: true,

  text: 'hello world'

};

const obj: Proxy = new Proxy(data, {

  get(target: Object, key: string): any {

    track(target, key);

    return target[key];

  },

  set(target: Object, key: string, newVal: any): boolean {

    target[key] = newVal;

    trigger(target, key);

    return true;

  }

});

const track = (target: Object, key: string): void => {

  if (activeEffect) {

    let dependsMap: Map<string, Set<Effect>> = bucket.get(target);

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

  const dependsToRun: Set<Effect> = new Set<Effect>(depends);

  dependsToRun.forEach((currentEffect: Effect) =>
    currentEffect.content());

};

const customEffect = (): void => {

  console.log(obj.ok? obj.text: 'not');

};

registerEffect(customEffect);

const delay = (delayed: () => any, time: number) => {

  return new Promise((resolve: (result: any) => void,
                      _: (error: Error) => void) =>
    setTimeout(() => resolve(delayed()), time));

};

const step1 = await delay(() => obj.ok = false, 1000);
const step2 = await delay(() => obj.text = 'hello vue3', 1000);
