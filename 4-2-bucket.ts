const bucket = new Set<() => void>();

const data = { text: 'hello world' };

const obj: Proxy = new Proxy(data, {

  get(target: Object, key: string): any {

    bucket.add(customEffect);

    return target[key];

  },

  set(target: Object, key: string, newVal: any): boolean {

    target[key] = newVal;

    bucket.forEach((customEffect: () => void) => customEffect());

    return true;

  }

});

const customEffect = (): void => {

  // document.body.innerText = obj.text;

  console.log(obj.text);  // put customEffect into backet

};

customEffect();

setTimeout(() => obj.text = 'hello vue3', 1000);
