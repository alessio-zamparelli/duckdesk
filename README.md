# neutralinojs-zero

neu run -- --window-enable-inspector

neu run --frontend-lib-dev

neu run --frontend-lib-dev -- --window-enable-inspector

cd react-src
npm run build

cd ..
neu build --release

https://reactrouter.com/en/main/start/overview
