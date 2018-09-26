
import React, {
  Component,
} from 'react'

import {
  WebView,
  Platform,
} from 'react-native'

import WKWebView from 'react-native-wkwebview-reborn'

const isIos = Platform.OS === 'ios'

const script = `
window.sendMessage = function (str) {
  if (str && typeof str === 'object') {
    str = JSON.stringify(str);
  }
  postMessage(str);
};
document.addEventListener('message', function (event) {
  var data = event.data;
  if (data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
    try {
      data = JSON.parse(data);
    }
    catch (error) {
      sendMessage('json parse error: ' + data);
      return;
    }
  }
  receiveMessage && receiveMessage(data);
});
if (typeof onWebViewReady === 'function') {
  onWebViewReady();
}
`

const WebViewComponent = isIos ? WKWebView : WebView

export default class PureWebView extends Component {

  static propTypes = WebView.propTypes

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

      onMessage(data)

    }

  }

  postMessage(str) {
    if (str && typeof str === 'object') {
      str = JSON.stringify(str)
    }
    this.refs.webview.postMessage(str)
  }

  render() {
    let { injectedJavaScript, ...props } = this.props
    if (injectedJavaScript) {
      injectedJavaScript = script + injectedJavaScript
    }
    else {
      injectedJavaScript = script
    }
    return (
      <WebViewComponent
        {...props}
        ref="webview"
        injectedJavaScript={injectedJavaScript}
        allowsInlineMediaPlayback={true}
        hideKeyboardAccessoryView={true}
        onMessage={this.handleMessage}
      />
    )
  }

}
