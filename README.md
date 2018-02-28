# react-native-pure-webview

封装了 ios 和安卓的兼容问题，webview 网页中收发消息修改如下：

```js
function receiveMessage(data) {
  // 如果消息是字符串，data 是字符串
  // 如果消息是 json，会经过 JSON.parse 再传入

  // 发消息
  sendMessage('已收到');
}
```

WebView 组件的 `onMessage` 参数为实际的数据，如果是 json，会经过 JSON.parse 再传入
