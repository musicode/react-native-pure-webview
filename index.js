
import React, {
  createRef,
  PureComponent,
} from 'react'

import { WebView } from 'react-native-webview'

const script = `
window.sendMessage = function (str) {
  if (str && typeof str === 'object') {
    str = JSON.stringify(str);
  }
  try {
    window.ReactNativeWebView.postMessage(str);
  }
  catch (e) {
    console.log(e);
  }
};
if (!window.receiveMessage) {
  window.receiveMessage = function () { };
}
sendMessage('ready');
if (window.bridgeReady) {
  window.bridgeReady();
}
`

export default class PureWebView extends PureComponent {

  static propTypes = WebView.propTypes

  static defaultProps = {
    originWhitelist: ['*'],
    domStorageEnabled: true,
    allowsInlineMediaPlayback: true,
    hideKeyboardAccessoryView: true,
    geolocationEnabled: true,
    shouldStartLoad: true,
    useWebKit: true,
  }

  constructor(props) {
    super(props)
    this.webviewRef = createRef()
  }

  handleMessage = event => {

    let { onMessage } = this.props
    if (onMessage) {

      let { data } = event.nativeEvent

      if (data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
        try {
          data = JSON.parse(data)
        }
        catch (error) {
          return
        }
      }

      if (data === 'ready') {
        this.markReady()
      }

      onMessage(data)

    }

  }

  postMessage(str) {
    if (!this.ready) {
      return
    }
    if (str) {
      let type = typeof str
      if (type === 'object') {
        str = JSON.stringify(str)
      }
      else if (type === 'string') {
        str = `"${str}"`
      }
    }
    this.injectJavaScript(
      `receiveMessage(${str});`
    )
  }

  goForward() {
    this.webviewRef.current?.goForward()
  }

  goBack() {
    this.webviewRef.current?.goBack()
  }

  reload() {
    this.webviewRef.current?.reload()
  }

  stopLoading() {
    this.webviewRef.current?.stopLoading()
  }

  injectJavaScript(code) {
    this.webviewRef.current?.injectJavaScript(code)
  }

  markReady = () => {
    if (this.ready) {
      return
    }
    this.ready = true
    let { onLoad } = this.props
    onLoad && onLoad()
  }

  handleLoad = () => {

  }

  render() {

    let {
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      ...props
    } = this.props

    if (injectedJavaScript) {
      injectedJavaScript = injectedJavaScript + script
    }
    else {
      injectedJavaScript = script
    }

    if (injectedJavaScriptBeforeContentLoaded) {
      injectedJavaScriptBeforeContentLoaded = injectedJavaScriptBeforeContentLoaded + script
    }
    else {
      injectedJavaScriptBeforeContentLoaded = script
    }

    return (
      <WebView
        {...props}
        ref={this.webviewRef}
        injectedJavaScript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={this.handleMessage}
        onLoad={this.handleLoad}
      />
    )
  }

}
