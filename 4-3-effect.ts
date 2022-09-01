const bucket: WeakMap<Object, Map<string, Set<() => void>>> =
  new WeakMap<Object, Map<string, Set<() => void>>>();

let activeEffect: () => void = undefined;

const registerEffect = (customEffect: () => void) => {

  activeEffect = customEffect;

  customEffect();

};

const data: Object = { text: 'hello world' };

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

      let dependsMap: Map<string, Set<() => void>> = bucket.get(target);

      if (!dependsMap) {

        dependsMap = new Map<string, Set<() => void>>();

        bucket.set(target, dependsMap);

      };

      let depends: Set<() => void> = dependsMap.get(key);

      if (!depends) {

        depends = new Set<() => void>();

        dependsMap.set(key, depends);

      };

      depends.add(activeEffect);

    };

};

const trigger = (target: Object, key: string): void => {
  
  const dependsMap: Map<string, Set<() => void>> = bucket.get(target);

  if (!dependsMap) return;
  
  const depends: Set<() => void> = dependsMap.get(key);
  
  if (!depends) return;
  
  depends.forEach((customEffect: () => void) => customEffect());
  
};

const customEffect = (): void => {

  console.log(obj.text);

};

registerEffect(customEffect);

setTimeout(() => obj.text = 'hello vue3', 1000);
