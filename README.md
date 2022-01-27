[Macos only at the moment] 
</div>

## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/botpress/botpress-electron
cd botpress-electron
npm i
npm run fetch:macos
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

OR for debugging production instances

```bash
npm run package:dev
```
