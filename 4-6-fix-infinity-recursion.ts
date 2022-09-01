interface Effect {

  content: () => void,

  depends: Set<Effect>[]

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

    content(): void {

      cleanup(this);

      activeEffect = this;

      effectStack.push(this);

      customEffect();

      effectStack.pop();

      activeEffect = effectStack[effectStack.length - 1];

    },

    depends: []

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

    trigger(target, key);

    return Reflect.set(...arguments);

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

  // const dependsToRun: Set<Effect> = new Set<Effect>(depends);

  const dependsToRun: Set<Effect> = new Set<Effect>();

  depends.forEach((currentEffect: Effect) => {

    if (currentEffect !== activeEffect) {

      dependsToRun.add(currentEffect);

    };

  });

  dependsToRun.forEach((currentEffect: Effect) =>
    currentEffect.content());

};

const delay = (delayed: () => any, time: number) =>
  new Promise((resolve: (result: any) => void,
               _: (error: Error) => void) =>
    setTimeout(() => resolve(delayed()), time));


// custom code part

const customEffect = (): void => {

  obj.foo++;

};

registerEffect(customEffect);

// const step1 = await delay(() => console.log(obj.foo), 1000);

while (true) {

  await delay(() => console.log(obj.foo++), 1000);

};
