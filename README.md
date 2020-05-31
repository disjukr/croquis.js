# croquis.js
this library provides [Photoshop-like brush features][common-brush].

it also provides functions such as stabilization of brush strokes.

[common-brush]: https://croquisjs.0xabcdef.com/example/common-brush

## install
```sh
npm install croquis.js
# or
yarn add croquis.js
```

## stroke protocol
brush-related functions in croquis.js are working on the [stroke protocol][stroke protocol].

stroke protocol consists of the `down` method and the `move` and `up` methods of the drawing context.

`down` method means that the stylus pen has started drawing a stroke. it returns the drawing context containing the `move` and `up` methods.

`move` means that the stylus pen draws a stroke, and `up` means that the stroke ends.

stroke protocol makes it easy to add features such as stabilization without having to modify the drawing code very much.

look at the [simple brush example][simple brush] and the [pulled string stabilizer example][pulled string].
you can see that the code is not different except for [the part injecting the settings][injecting the settings] and [the part drawing the guide][drawing the guide].

[stroke protocol]: ./packages/croquis.js/src/stroke-protocol.ts
[simple brush]: ./packages/website/src/pages/example/simple-brush.tsx
[pulled string]: ./packages/website/src/pages/example/stabilizer-pulled-string.tsx
[injecting the settings]: https://github.com/disjukr/croquis.js/blob/master/packages/website/src/pages/example/stabilizer-pulled-string.tsx#L47-L58
[drawing the guide]: https://github.com/disjukr/croquis.js/blob/master/packages/website/src/pages/example/stabilizer-pulled-string.tsx#L115-L141

## license
croquis.js is dual-licensed under Apache 2.0 and MIT terms.
