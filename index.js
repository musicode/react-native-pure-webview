
import React, {
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
    if (str && typeof str === 'object') {
      str = JSON.stringify(str)
    }
    this.injectJavaScript(
      `receiveMessage(${str});`
    )
  }

  injectJavaScript(code) {
    this.refs.webview.injectJavaScript(code)
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
    let { injectedJavaScript, ...props } = this.props
    if (injectedJavaScript) {
      injectedJavaScript = injectedJavaScript + script
    }
    else {
      injectedJavaScript = script
    }
    return (
      <WebView
        {...props}
        ref="webview"
        injectedJavaScript={injectedJavaScript}
        onMessage={this.handleMessage}
        onLoad={this.handleLoad}
      />
    )
  }

}
