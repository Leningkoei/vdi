const obj = {
  tag: 'div',
  children: [
    { tag: 'span', children: 'hello world' }
  ];
};

const render = (obj, root) => {

  const el = document.createElement(obj.tag);

  if (typeof object.children === 'string') {

    const text = document.createTextNode(obj.children);

    el.appendChild(text);

  } else if (obj.children) {

    obj.children.forEach((child) => Render(child, el));

  } else {

    throw new Error('?');

  };

  root.appendChild(el);

};

render(obj, document.body);
