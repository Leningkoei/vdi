interface Effect {

  content: () => void,

  depends: Set<Effect>[]

};

// class EffectSet {

class Set {

  // fix adding inner effect repeatedly by recover Set
  // https://github.com/HcySunYang/code-for-vue-3-book/issues/146

  constructor(templateSet: Set<Effect>) {

    if (templateSet) {

      this.set = [ ...templateSet.getSet() ];

    } else {

      this.set = [];

    };

  };

  public add(effect: Effect) {

    if (this.set.filter((currentEffect: Effect) =>
      currentEffect.customEffect === effect.customEffect).length)
      return;

    this.set.push(effect);

  };

  public forEach(f) {

    this.set.forEach(f);

  };

  public delete(effect: Effect) {

    this.set.filter((currentEffect: Effect) => currentEffect === effect);

  };

  public getSet() {
    
    return this.set;
    
  };

  private set: Effect[] = undefined;

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

const registerEffect = (customEffect: () => void): void => {

  const effect: Effect = {

    id: Math.random(),

    birthday: + new Date(),

    content() {

      cleanup(this);

      activeEffect = this;

      effectStack.push(activeEffect);

      customEffect();

      effectStack.pop();

      activeEffect = effectStack[effectStack.length - 1];

    },

    depends: [],

    customEffect

  };

  effect.content();

};

const data: Object = {

  foo: true,

  bar: true

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

const trigger = (target: Object, key: string) : void => {

  const dependsMap: Map<string, Set<Effect>> = bucket.get(target);

  if (!dependsMap) return;

  const depends: Set<Effect> = dependsMap.get(key);

  if (!depends) return;

  const dependsToRun: Set<Effect> = new Set<Effect>(depends);

  console.log(dependsToRun);

  dependsToRun.forEach((currentEffect: Effect) =>
    currentEffect.content());

};

const customEffect2 = (): void => {

  console.log('effect 2 is running');

  console.log(obj.bar);

};
const customEffect1 = (): void => {

  console.log('effect 1 is running');

  registerEffect(customEffect2);

  console.log(obj.foo);

};

registerEffect(customEffect1);

const delay = (delayed: () => any, time: number) =>
  new Promise((resolve: (result: any) => void,
               _: (error: Error) => void) =>
    setTimeout(() => resolve(delayed()), time));

console.log('------');
const step1 = await delay(() => obj.foo = false, 1000) // correct
console.log('------');
const step2 = await delay(() => obj.bar = false, 1000) // wrong
