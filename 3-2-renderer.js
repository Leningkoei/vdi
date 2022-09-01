const MyComponent = () => {
  // function component

  return {

    tag: 'div',

    props: {

      onClick: () => alert('hello');

    },

    children: 'click me'

  };

};

const MyComponent = {
  // object component

  render() {

    return {

      tag: 'div',

      props: {

        onClick: () => alert('hello');

      },

      children: 'click me'

    };

  };

};

const renderer = (vnode, container) => {

  if (typeof vnode.tag === 'string') {

    mountElement(vnode, container);

  } else if (typeof vnode.tag === 'function') {

    mountFunctionComponent(vnode, container);

  } else if (typeof vnode.tag === 'object') {

    mountObjectComponent(vnode, container);

  };

};

const mountElement = (vnode, container) => {

  const el = document.createElement(vnode.tag);

  for (const key in vode.props) {

    if (/^on/.test(key)) {
      // Begin with `on`, it is a event.

      el.addEventListener(
        key.substr(2).toLowerCase(), // onClick -> click
        vnode.props.key
      );

    };

  };

  if (typeof vnode.children === 'string') {

    el.appendChild(document.createTextNode(vnode.children));

  } else if (Array.isArray(vnode.children)) {

    vnode.children.forEach((child) => renderer(child, el));

  };

  container.appendChild(el);

};

const mountFunctionComponent = (vnode, container) => {

  const subtree = vnode.tag();

  renderer(subtree, container);

};

const mountObjectComponent = (vnode, container) => {

  const subtree = vnode.tag.rander();

  renderer(subtree, container);

};
